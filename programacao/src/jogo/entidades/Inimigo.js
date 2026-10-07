import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { desvioDePedras, devePerseguir, velocidadeDoMovimento } from '../../regras/combate.js'
import { numeroFlutuante, particulas } from '../efeitos.js'
import Entidade, { BarraDeVida } from './Entidade.js'

// Base dos inimigos: vida e barra, passear à toa em volta de casa, perseguir o Líder dentro do raio
// de detecção e desistir depois do raio de desistência (Conceito §11.3), e o "pop" ao morrer.
// Cada inimigo tem um "!" quando começa a perseguir e um "?" quando desiste, para dar para ver.
export default class Inimigo extends Entidade {
  constructor(cena, x, y, config, cor) {
    super(cena, { x, y, tamanho: config.tamanho, cor })
    this.config = config
    this.vida = config.vida
    this.vidaMaxima = config.vida
    this.barra = new BarraDeVida(cena, config.tamanho, 0xff5a5a)
    this.casa = { x, y }
    this.destinoDoPasseio = null
    this.proximoPasseio = 0
    this.estado = 'passeando'
    this.corpo.body.setCollideWorldBounds(true)
  }

  get perseguindo() {
    return this.estado !== 'passeando'
  }

  distanciaAte(alvo) {
    return Math.hypot(alvo.x - this.x, alvo.y - this.y)
  }

  // Decide entre perseguir e passear. Devolve true se está perseguindo o Líder agora.
  decidirPerseguicao(lider, agora) {
    const perseguia = this.perseguindo
    const persegue =
      !lider.caido &&
      devePerseguir({
        distancia: this.distanciaAte(lider),
        perseguindo: perseguia,
        raioDeDeteccao: this.config.raioDeDeteccao,
        raioDeDesistencia: this.config.raioDeDesistencia,
      })
    if (persegue && !perseguia) {
      this.estado = 'perseguindo'
      numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '!', '#ffe14a', 30)
    } else if (!persegue && perseguia) {
      this.desistir(agora)
    }
    return persegue
  }

  // Volta a andar à toa em volta de onde estava
  desistir(agora) {
    this.estado = 'passeando'
    this.casa = { x: this.x, y: this.y }
    this.destinoDoPasseio = null
    this.proximoPasseio = agora + 700
    this.corpo.body.setVelocity(0, 0)
    if (!this.cena.lider.caido) numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '?', '#ffffff', 28)
  }

  // Apanhou: se estava à toa, vai atrás de quem bateu
  aoApanhar() {
    if (!this.perseguindo && !this.cena.lider.caido) {
      this.estado = 'perseguindo'
      numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '!', '#ffe14a', 30)
    }
  }

  // Velocidade para ir até o alvo contornando as pedras
  velocidadeAte(alvo, velocidade) {
    const destino = desvioDePedras(this, alvo, this.cena.retangulosDosObstaculos, this.tamanho / 2 - 2)
    return velocidadeDoMovimento(destino.x - this.x, destino.y - this.y, velocidade)
  }

  passear(agora) {
    if (agora >= this.proximoPasseio) {
      const angulo = Math.random() * Math.PI * 2
      const raio = Math.random() * this.config.raioDoPasseio
      this.destinoDoPasseio = { x: this.casa.x + Math.cos(angulo) * raio, y: this.casa.y + Math.sin(angulo) * raio }
      this.proximoPasseio = agora + 1500 + Math.random() * 1500
    }
    const destino = this.destinoDoPasseio
    if (!destino || this.distanciaAte(destino) < 8) {
      this.corpo.body.setVelocity(0, 0)
      return
    }
    const velocidade = velocidadeDoMovimento(destino.x - this.x, destino.y - this.y, this.config.velocidade * 0.4)
    this.corpo.body.setVelocity(velocidade.x, velocidade.y)
  }

  atualizarDesenho(agora, delta) {
    super.atualizarDesenho(agora, delta)
    this.barra.atualizar(this.x, this.y - this.tamanho * 0.5 - 12, this.vida / this.vidaMaxima)
  }

  // Some com um "pop" de partículas
  morrer() {
    particulas(this.cena, this.x, this.y, this.cor, 18, 300)
    particulas(this.cena, this.x, this.y, 0xffffff, 8, 200)
    this.destruir()
  }

  destruir() {
    super.destruir()
    this.barra.destruir()
  }
}

export const corDoInimigo = { mobVermelho: coresDaArena.mobVermelho, atirador: coresDaArena.atirador }
