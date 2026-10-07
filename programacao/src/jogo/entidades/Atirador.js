import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { podeUsar, velocidadeDoMovimento } from '../../regras/combate.js'
import TiroInimigo from '../ataques/tiroInimigo.js'
import Inimigo from './Inimigo.js'

const config = combateDeTeste.atirador

// Atirador (vermelho escuro): fica longe do Líder, entre a distância mínima e a máxima,
// e atira bolinhas lentas. Antes de cada tiro, pisca (o aviso). Serve para testar o escudo do Tanque.
export default class Atirador extends Inimigo {
  constructor(cena, x, y) {
    super(cena, x, y, config, coresDaArena.atirador)
    this.ultimoTiro = null
  }

  atualizar(agora) {
    if (this.morto || this.estaSendoEmpurrado(agora)) return
    const lider = this.cena.lider
    const corpo = this.corpo.body

    if (this.estado === 'mirando') {
      corpo.setVelocity(0, 0)
      if (agora >= this.fimDoAviso) this.atirar(agora, lider)
      return
    }

    if (!this.decidirPerseguicao(lider, agora)) {
      this.passear(agora)
      return
    }

    const ate = this.distanciaAte(lider)
    if (ate <= config.alcanceDoTiro && podeUsar(agora, this.ultimoTiro, config.msEntreTiros)) {
      this.estado = 'mirando'
      this.fimDoAviso = agora + config.msDeAviso
      return
    }

    // Mantém a distância: foge se o Líder chega perto, chega mais perto se ele está longe
    let velocidade = { x: 0, y: 0 }
    if (ate < config.distanciaMinima) velocidade = velocidadeDoMovimento(this.x - lider.x, this.y - lider.y, config.velocidade)
    else if (ate > config.distanciaMaxima) velocidade = this.velocidadeAte(lider, config.velocidade)
    corpo.setVelocity(velocidade.x, velocidade.y)
  }

  atirar(agora, lider) {
    this.estado = 'perseguindo'
    this.ultimoTiro = agora
    if (lider.caido) return
    const angulo = Math.atan2(lider.y - this.y, lider.x - this.x)
    this.cena.adicionarProjetil(new TiroInimigo(this.cena, this, angulo))
    this.deformar(0.8, 0.8, 50, 150)
  }

  // Um empurrão cancela o tiro que estava mirando
  empurrar(vetor, ms) {
    super.empurrar(vetor, ms)
    if (this.estado === 'mirando') this.estado = 'perseguindo'
  }

  atualizarDesenho(agora, delta) {
    if (this.estado === 'mirando') this.quadrado.setFillStyle(Math.floor(agora / 70) % 2 ? 0xffffff : this.cor)
    else if (!this.fimDoPiscar) this.quadrado.setFillStyle(this.cor)
    super.atualizarDesenho(agora, delta)
  }
}
