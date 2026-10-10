import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { curaDaAura } from '../../regras/combate.js'
import { camadas, numeroFlutuante } from '../efeitos.js'

const config = combateDeTeste.ataques.sacerdote

// Sacerdote: área em volta dele que pulsa por alguns segundos e, a cada pulso, cura o Líder e os
// aliados que estiverem dentro (a conta é de regras/combate.js). Segue o Sacerdote enquanto dura.
export default class Aura {
  constructor(cena, dono, agora) {
    this.cena = cena
    this.dono = dono
    this.fim = agora + config.msDeDuracao
    this.proximoPulso = agora
    this.circulo = cena.add
      .circle(dono.x, dono.y, config.raio, coresDaArena.aura, 0.16)
      .setStrokeStyle(3, coresDaArena.aura, 0.9)
      .setDepth(camadas.aura)
  }

  atualizar(agora) {
    if (agora >= this.fim) return false
    this.circulo.setPosition(this.dono.x, this.dono.y)
    if (agora >= this.proximoPulso) {
      this.proximoPulso += config.msEntrePulsos
      this.pulsar()
    }
    return true
  }

  pulsar() {
    this.cena.tweens.add({ targets: this.circulo, scale: { from: 0.86, to: 1 }, fillAlpha: { from: 0.34, to: 0.16 }, duration: 320, ease: 'Quad.Out' })
    const membros = this.cena.grupo.map((personagem) => ({
      id: personagem,
      x: personagem.x,
      y: personagem.y,
      vida: personagem.caido ? 0 : personagem.vida,
      vidaMaxima: personagem.vidaMaxima,
    }))
    for (const { id: personagem, vida, curado } of curaDaAura(membros, this.dono, config.raio, config.curaPorPulso * (this.dono.multiplicadorDeCura ?? 1))) {
      personagem.vida = vida
      numeroFlutuante(this.cena, personagem.x, personagem.y - 34, `+${curado}`, coresDaArena.numeroDeCura, 22)
    }
  }

  destruir() {
    this.cena.tweens.killTweensOf(this.circulo)
    this.circulo.destroy()
  }
}
