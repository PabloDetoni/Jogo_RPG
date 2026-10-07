import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { velocidadeDoMovimento } from '../../regras/combate.js'
import { alvoDoInimigo, maisProximo } from '../../regras/iaDosAliados.js'
import { numeroFlutuante, particulas } from '../efeitos.js'
import Entidade, { BarraDeVida } from './Entidade.js'

// Base dos inimigos: vida e barra, passear à toa em volta de casa, perseguir quem do grupo entrar no raio
// de detecção e desistir depois do raio de desistência (Conceito §11.3), e o "pop" ao morrer.
// O alvo é escolhido em regras/iaDosAliados.js: o Tanque perto atrai, e a Provocação puxa todos no raio.
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
    this.alvo = null // quem do grupo ele persegue
    this.peso = combateDeTeste.separacao.pesoDoInimigo
    this.andaSozinho = true
    this.corpo.body.setCollideWorldBounds(true)
  }

  get perseguindo() {
    return this.estado !== 'passeando'
  }

  distanciaAte(alvo) {
    return Math.hypot(alvo.x - this.x, alvo.y - this.y)
  }

  // Decide quem perseguir (ou voltar a passear). Devolve o alvo, ou null se está passeando.
  decidirAlvo(agora) {
    const perseguia = this.perseguindo
    const alvo = alvoDoInimigo(this, this.cena.membrosDePe, {
      alvoAtual: this.alvo,
      raioDeDeteccao: this.config.raioDeDeteccao,
      raioDeDesistencia: this.config.raioDeDesistencia,
      raioDeAtracao: combateDeTeste.ia.raioDeAtracaoDoTanque,
      raioDaProvocacao: combateDeTeste.habilidades.tanque.raio,
    })
    this.alvo = alvo
    if (alvo && !perseguia) {
      this.estado = 'perseguindo'
      numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '!', '#ffe14a', 30)
    } else if (!alvo && perseguia) {
      this.desistir(agora)
    }
    return alvo
  }

  // Volta a andar à toa em volta de onde estava
  desistir(agora) {
    this.estado = 'passeando'
    this.casa = { x: this.x, y: this.y }
    this.destinoDoPasseio = null
    this.proximoPasseio = agora + 700
    this.alvo = null
    this.parar()
    numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '?', '#ffffff', 28)
  }

  // Apanhou: se estava à toa, vai atrás de quem do grupo estiver mais perto
  aoApanhar() {
    const alvo = maisProximo(this, this.cena.membrosDePe)
    if (!this.perseguindo && alvo) {
      this.alvo = alvo
      this.estado = 'perseguindo'
      numeroFlutuante(this.cena, this.x, this.y - this.tamanho, '!', '#ffe14a', 30)
    }
  }

  // Velocidade para ir até o alvo contornando as pedras (caminho na grade)
  velocidadeAte(alvo, velocidade) {
    return this.cena.navegador.velocidadeAte(this, alvo, velocidade, this.cena.time.now)
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
      this.parar()
      return
    }
    this.andar(velocidadeDoMovimento(destino.x - this.x, destino.y - this.y, this.config.velocidade * 0.4))
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
