import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import Entidade, { BarraDeVida } from './Entidade.js'

const config = combateDeTeste.boneco

// Boneco de treino: parado (não é empurrado), não ataca, mostra os números de dano e
// recupera toda a vida depois de um tempo sem apanhar. Não morre.
export default class BonecoDeTreino extends Entidade {
  constructor(cena, x, y) {
    super(cena, { x, y, tamanho: config.tamanho, cor: coresDaArena.boneco, estatico: true })
    this.vida = config.vida
    this.vidaMaxima = config.vida
    this.ultimoDano = null
    this.barra = new BarraDeVida(cena, config.tamanho, 0xffc94a)
    // Um "X" de fita no peito, para não confundir com um personagem
    this.visual.add(cena.add.rectangle(0, 0, config.tamanho * 0.9, 6, coresDaArena.contorno).setAngle(45))
    this.visual.add(cena.add.rectangle(0, 0, config.tamanho * 0.9, 6, coresDaArena.contorno).setAngle(-45))
  }

  get mostraDanoCheio() {
    return true // mesmo sem vida, mostra o dano do golpe
  }

  aoApanhar(agora) {
    this.ultimoDano = agora
  }

  atualizar(agora) {
    if (this.vida < this.vidaMaxima && this.ultimoDano !== null && agora - this.ultimoDano >= config.msParaRecuperar) {
      this.vida = this.vidaMaxima
      this.deformar(1.15, 1.15, 90, 200)
    }
  }

  atualizarDesenho(agora, delta) {
    super.atualizarDesenho(agora, delta)
    this.barra.atualizar(this.x, this.y - this.tamanho * 0.5 - 12, this.vida / this.vidaMaxima)
  }

  destruir() {
    super.destruir()
    this.barra.destruir()
  }
}
