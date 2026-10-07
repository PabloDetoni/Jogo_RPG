import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { corDaClasse } from '../../dados/classes.js'
import Entidade, { BarraDeVida } from './Entidade.js'

const { tamanho } = combateDeTeste.personagem
const distanciaDaMira = tamanho * 0.95

// Líder ou aliado: quadrado da cor da classe. Só o Líder tem o contorno branco grosso, a mira
// (o triângulo que gira para o mouse) e a barra de vida (os aliados ainda não levam dano).
export default class Personagem extends Entidade {
  constructor(cena, membro, x, y) {
    super(cena, { x, y, tamanho, cor: corDaClasse(membro.classe) })
    this.contornoEscuro = cena.add.rectangle(0, 0, tamanho + 10, tamanho + 10).setStrokeStyle(2, coresDaArena.contorno)
    this.contornoDoLider = cena.add.rectangle(0, 0, tamanho - 4, tamanho - 4).setStrokeStyle(5, 0xffffff)
    this.visual.addAt(this.contornoEscuro, 0)
    this.visual.add(this.contornoDoLider)
    this.mira = cena.add.triangle(0, 0, 0, -8, 16, 0, 0, 8, 0xffffff).setStrokeStyle(2, coresDaArena.contorno)
    this.barra = new BarraDeVida(cena, tamanho + 8)
    this.caido = false
    this.definirMembro(membro)
  }

  // Classe, vida e papel (Líder ou aliado). Trocar de classe mantém a fração da vida.
  definirMembro(membro) {
    const fracao = this.membro ? this.vida / this.vidaMaxima : 1
    this.membro = membro
    this.classe = membro.classe
    this.vidaMaxima = membro.vidaMaxima
    this.vida = Math.max(1, Math.round(fracao * membro.vidaMaxima))
    this.lider = membro.lider
    this.definirCor(corDaClasse(membro.classe))
    this.contornoEscuro.setVisible(this.lider)
    this.contornoDoLider.setVisible(this.lider)
    this.mira.setVisible(this.lider)
    this.barra.definirVisivel(this.lider)
  }

  atualizarMira(angulo) {
    this.mira.setPosition(this.x + Math.cos(angulo) * distanciaDaMira, this.y + Math.sin(angulo) * distanciaDaMira)
    this.mira.setRotation(angulo)
    this.mira.setDepth(this.y + 2)
  }

  atualizarDesenho(agora, delta) {
    super.atualizarDesenho(agora, delta)
    if (this.lider) this.barra.atualizar(this.x, this.y - tamanho * 0.5 - 14, this.vida / this.vidaMaxima)
  }

  // Sem vida: o quadrado tomba e fica cinza
  cair() {
    this.caido = true
    this.corpo.body.setVelocity(0, 0)
    this.definirCor(0x777777)
    this.mira.setVisible(false)
    this.cena.tweens.add({ targets: this.visual, angle: 90, duration: 400, ease: 'Bounce.Out' })
  }

  destruir() {
    super.destruir()
    this.mira.destroy()
    this.barra.destruir()
  }
}
