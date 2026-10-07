import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { podeUsar, velocidadeDoMovimento } from '../../regras/combate.js'
import TiroInimigo from '../ataques/tiroInimigo.js'
import Inimigo from './Inimigo.js'

const config = combateDeTeste.atirador

// Atirador (vermelho escuro): fica longe de quem persegue, entre a distância mínima e a máxima,
// e atira bolinhas lentas. Antes de cada tiro, pisca (o aviso). Serve para testar o escudo do Tanque.
export default class Atirador extends Inimigo {
  constructor(cena, x, y) {
    super(cena, x, y, config, coresDaArena.atirador)
    this.ultimoTiro = null
  }

  atualizar(agora) {
    if (this.morto || this.estaSendoEmpurrado(agora)) return

    if (this.estado === 'mirando') {
      this.parar()
      if (agora >= this.fimDoAviso) this.atirar(agora)
      return
    }

    const alvo = this.decidirAlvo(agora)
    if (!alvo) {
      this.passear(agora)
      return
    }

    const ate = this.distanciaAte(alvo)
    if (ate <= config.alcanceDoTiro && podeUsar(agora, this.ultimoTiro, config.msEntreTiros)) {
      this.estado = 'mirando'
      this.fimDoAviso = agora + config.msDeAviso
      return
    }

    // Mantém a distância: foge se o alvo chega perto, chega mais perto se ele está longe
    let velocidade = { x: 0, y: 0 }
    if (ate < config.distanciaMinima) velocidade = velocidadeDoMovimento(this.x - alvo.x, this.y - alvo.y, config.velocidade)
    else if (ate > config.distanciaMaxima) velocidade = this.velocidadeAte(alvo, config.velocidade)
    this.andar(velocidade)
  }

  atirar(agora) {
    this.estado = 'perseguindo'
    this.ultimoTiro = agora
    const alvo = this.alvo
    if (!alvo || alvo.caido) return
    const angulo = Math.atan2(alvo.y - this.y, alvo.x - this.x)
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
