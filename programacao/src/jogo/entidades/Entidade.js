import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { direcaoDoVetor } from '../../regras/arte.js'
import { raioDoCorpo } from '../../regras/movimento.js'
import { DesenhoDoBoneco } from '../arte.js'
import { camadas } from '../efeitos.js'

// Base de tudo que tem corpo na arena: Líder, aliados, mobs e boneco.
// A hitbox (uma zona de física, invisível) é separada do desenho (o quadrado, a sombra, a barra),
// como pede o CLAUDE.md: dá para trocar a arte sem mexer no acerto. Ajustes de 14/10: o corpo que colide é bem menor que
// o desenho (regras/movimento.js, raioDoCorpo), para o grupo deslizar um no outro e nas pedras; a área que recebe
// golpes (retangulo) continua do tamanho do desenho, para o combate não ficar injusto. Com a arte (usarArte), o quadrado dá lugar à
// imagem animada do boneco (jogo/arte.js); sem ela, continua o quadrado.
export default class Entidade {
  constructor(cena, { x, y, tamanho, cor, estatico = false }) {
    this.cena = cena
    this.tamanho = tamanho
    this.cor = cor
    this.morto = false
    this.podeSerEmpurrado = !estatico

    this.raioDoCorpo = raioDoCorpo(tamanho)
    this.corpo = cena.add.zone(x, y, this.raioDoCorpo * 2, this.raioDoCorpo * 2)
    cena.physics.add.existing(this.corpo, estatico)
    this.corpo.entidade = this

    this.sombra = cena.add
      .ellipse(x, y + tamanho * 0.5, tamanho * 1.15, tamanho * 0.42, coresDaArena.sombra, 0.25)
      .setDepth(camadas.sombras)
    this.quadrado = cena.add.rectangle(0, 0, tamanho, tamanho, cor).setStrokeStyle(2, coresDaArena.contorno)
    this.visual = cena.add.container(x, y, [this.quadrado])

    this.boneco = null // a imagem animada (jogo/arte.js), quando a arte existe
    this.idDaArte = null
    this.ladoDoDesenho = 'baixo' // para onde o boneco olha
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

  // O meio lado do corpo que colide (menor que o desenho): é o que a separação, as pedras e o caminho usam
  get raio() {
    return this.raioDoCorpo
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

  // Troca o quadrado pela imagem do boneco (classe, mob ou Boss; dados/arte.js), se ela existir
  usarArte(id) {
    if (this.idDaArte === id) return
    this.idDaArte = id
    this.boneco?.sprite.destroy()
    this.boneco = DesenhoDoBoneco.criar(this.cena, id)
    if (this.boneco) this.visual.add(this.boneco.sprite)
    this.quadrado.setVisible(!this.boneco)
  }

  definirCor(cor) {
    this.cor = cor
    if (!this.fimDoPiscar) this.quadrado.setFillStyle(cor)
  }

  // O desenho inteiro de uma cor (piscar, aviso do golpe); null volta ao normal
  destacar(cor) {
    this.quadrado.setFillStyle(cor ?? this.cor)
    this.boneco?.preencher(cor)
  }

  // Pisca branco por um instante ao levar um golpe
  piscar() {
    this.destacar(0xffffff)
    this.fimDoPiscar = this.cena.agora + 80
  }

  // Empurrão: a velocidade vira o vetor dado por alguns milissegundos, e o controle volta depois
  empurrar(vetor, ms) {
    if (!this.podeSerEmpurrado || !this.corpo.body) return
    this.vetorDoEmpurrao = { x: vetor.x, y: vetor.y }
    this.corpo.body.setVelocity(vetor.x, vetor.y)
    this.fimDoEmpurrao = this.cena.agora + ms
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

  // O que o boneco está fazendo agora (a animação da arte) e para onde olha: cada tipo de entidade completa
  // ({ animacao, olharPara?: vetor, desde?: quando o golpe começou, para reiniciar a animação })
  animacaoDoMomento(agora, andando) {
    return { animacao: andando ? 'andando' : 'parado' }
  }

  atualizarBoneco(agora, andando, velocidade) {
    const { animacao, olharPara, desde } = this.animacaoDoMomento(agora, andando)
    const vetor = olharPara ?? (andando ? velocidade : null)
    if (vetor) this.ladoDoDesenho = direcaoDoVetor(vetor.x, vetor.y, this.ladoDoDesenho)
    const reiniciar = desde !== undefined && desde !== this.golpeMostrado
    this.golpeMostrado = desde
    this.boneco.mostrar(animacao, this.ladoDoDesenho, reiniciar)
  }

  // Põe o desenho onde está a hitbox, com o balanço de quem anda (o quadrado; a imagem tem a própria animação)
  atualizarDesenho(agora, delta) {
    if (this.fimDoPiscar && agora >= this.fimDoPiscar) {
      this.fimDoPiscar = 0
      this.destacar(null)
    }
    const velocidade = this.corpo.body?.velocity
    const andando = velocidade && Math.hypot(velocidade.x, velocidade.y) > 20
    const balancar = andando && !this.boneco
    this.balanco = balancar ? this.balanco + delta * 0.024 : 0
    const onda = balancar ? Math.sin(this.balanco) * 0.08 : 0
    const pulinho = balancar ? Math.abs(Math.sin(this.balanco)) * 3 : 0
    if (this.boneco) this.atualizarBoneco(agora, andando, velocidade)

    this.visual.setPosition(this.x, this.y - pulinho)
    this.visual.setScale((1 + onda) * this.escalaExtra.x, (1 - onda) * this.escalaExtra.y)
    this.visual.setDepth(this.y)
    this.sombra.setPosition(this.x, this.y + this.tamanho * 0.5)
  }

  // Esconde o desenho fora da tela (a hitbox continua)
  definirVisivel(visivel) {
    if (this.visual.visible === visivel) return
    this.visual.setVisible(visivel)
    this.sombra.setVisible(visivel)
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
