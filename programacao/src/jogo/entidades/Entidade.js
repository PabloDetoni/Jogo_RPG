import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { camadas } from '../efeitos.js'

// Base de tudo que tem corpo na arena: Líder, aliados, mobs e boneco.
// A hitbox (uma zona de física, invisível) é separada do desenho (o quadrado, a sombra, a barra),
// como pede o CLAUDE.md: dá para trocar a arte sem mexer no acerto.
export default class Entidade {
  constructor(cena, { x, y, tamanho, cor, estatico = false }) {
    this.cena = cena
    this.tamanho = tamanho
    this.cor = cor
    this.morto = false
    this.podeSerEmpurrado = !estatico

    this.corpo = cena.add.zone(x, y, tamanho, tamanho)
    cena.physics.add.existing(this.corpo, estatico)
    this.corpo.entidade = this

    this.sombra = cena.add
      .ellipse(x, y + tamanho * 0.5, tamanho * 1.15, tamanho * 0.42, coresDaArena.sombra, 0.25)
      .setDepth(camadas.sombras)
    this.quadrado = cena.add.rectangle(0, 0, tamanho, tamanho, cor).setStrokeStyle(2, coresDaArena.contorno)
    this.visual = cena.add.container(x, y, [this.quadrado])

    this.escalaExtra = { x: 1, y: 1 } // deformações rápidas (esquiva, bote, aviso)
    this.balanco = 0 // fase do esticar e achatar ao andar
    this.fimDoPiscar = 0
    this.fimDoEmpurrao = 0
    this.vetorDoEmpurrao = { x: 0, y: 0 }

    // Movimento: cada um diz para onde quer andar (andar/parar); quem decide a velocidade final é a cena,
    // somando a separação dos outros corpos e as manobras para destravar (CenaArena.moverTodos).
    this.querida = { x: 0, y: 0 }
    this.peso = 1 // na separação, o mais pesado se mexe menos
    this.travamento = null // registro do detector de travamento (regras/movimento.js)
    this.manobra = null // manobra para destravar em andamento
    this.deslizando = false // indo depressa para o ponto livre mais próximo
    this.separandoAte = 0 // depois do "Juntar todos": até quando a separação é só pela zona (sem a batida dura)
  }

  get x() {
    return this.corpo.x
  }

  get y() {
    return this.corpo.y
  }

  get raio() {
    return this.tamanho / 2
  }

  // Quem não se mexe na separação (o boneco; os caídos, em Personagem)
  get fixo() {
    return !this.podeSerEmpurrado
  }

  retangulo() {
    return { x: this.x, y: this.y, largura: this.tamanho, altura: this.tamanho }
  }

  andar(velocidade) {
    this.querida = velocidade
  }

  parar() {
    this.querida = { x: 0, y: 0 }
  }

  // Põe o corpo num ponto, parado (nascer, reaparecer, "Juntar todos")
  colocarEm(x, y) {
    this.corpo.body.reset(x, y)
    this.parar()
    this.travamento = null
    this.manobra = null
  }

  definirCor(cor) {
    this.cor = cor
    if (!this.fimDoPiscar) this.quadrado.setFillStyle(cor)
  }

  // Pisca branco por um instante ao levar um golpe
  piscar() {
    this.quadrado.setFillStyle(0xffffff)
    this.fimDoPiscar = this.cena.time.now + 80
  }

  // Empurrão: a velocidade vira o vetor dado por alguns milissegundos, e o controle volta depois
  empurrar(vetor, ms) {
    if (!this.podeSerEmpurrado || !this.corpo.body) return
    this.vetorDoEmpurrao = { x: vetor.x, y: vetor.y }
    this.corpo.body.setVelocity(vetor.x, vetor.y)
    this.fimDoEmpurrao = this.cena.time.now + ms
  }

  estaSendoEmpurrado(agora) {
    return agora < this.fimDoEmpurrao
  }

  // Estica (ou encolhe) e volta: escalaX e escalaY são multiplicadores
  deformar(escalaX, escalaY, ida = 70, volta = 150) {
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.cena.tweens.chain({
      targets: this.escalaExtra,
      tweens: [
        { x: escalaX, y: escalaY, duration: ida, ease: 'Quad.Out' },
        { x: 1, y: 1, duration: volta, ease: 'Back.Out' },
      ],
    })
  }

  // Põe o desenho onde está a hitbox, com o balanço de quem anda
  atualizarDesenho(agora, delta) {
    if (this.fimDoPiscar && agora >= this.fimDoPiscar) {
      this.fimDoPiscar = 0
      this.quadrado.setFillStyle(this.cor)
    }
    const velocidade = this.corpo.body?.velocity
    const andando = velocidade && Math.hypot(velocidade.x, velocidade.y) > 20
    this.balanco = andando ? this.balanco + delta * 0.024 : 0
    const onda = andando ? Math.sin(this.balanco) * 0.08 : 0
    const pulinho = andando ? Math.abs(Math.sin(this.balanco)) * 3 : 0

    this.visual.setPosition(this.x, this.y - pulinho)
    this.visual.setScale((1 + onda) * this.escalaExtra.x, (1 - onda) * this.escalaExtra.y)
    this.visual.setDepth(this.y)
    this.sombra.setPosition(this.x, this.y + this.tamanho * 0.5)
  }

  destruir() {
    this.morto = true
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.corpo.destroy()
    this.visual.destroy()
    this.sombra.destroy()
  }
}

// Barra pequena em cima de quem a tem: vida (grupo, mobs e boneco) e mana (grupo, mais fina)
export class BarraDeVida {
  constructor(cena, largura, cor = 0x4be04b, altura = 4) {
    this.largura = largura
    this.fundo = cena.add.rectangle(0, 0, largura + 4, altura + 4, coresDaArena.contorno).setDepth(camadas.textos - 2)
    this.preenchimento = cena.add.rectangle(0, 0, largura, altura, cor).setOrigin(0, 0.5).setDepth(camadas.textos - 2)
  }

  atualizar(x, y, fracao) {
    this.fundo.setPosition(x, y)
    this.preenchimento.setPosition(x - this.largura / 2, y)
    this.preenchimento.setScale(Math.max(0, Math.min(1, fracao)), 1)
  }

  definirVisivel(visivel) {
    this.fundo.setVisible(visivel)
    this.preenchimento.setVisible(visivel)
  }

  destruir() {
    this.fundo.destroy()
    this.preenchimento.destroy()
  }
}
