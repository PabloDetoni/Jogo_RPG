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
    // A cura pela Sabedoria (Parte 3) e pela passiva de cura
    const cura = config.curaPorPulso * (this.dono.multiplicadorDeCura ?? 1) * (this.dono.fatorDeCura ?? 1)
    for (const { id: personagem, vida, curado } of curaDaAura(membros, this.dono, config.raio, cura)) {
      personagem.vida = vida
      numeroFlutuante(this.cena, personagem.x, personagem.y - 34, `+${curado}`, coresDaArena.numeroDeCura, 22)
    }
    // Dano baixo nos inimigos dentro da aura (Parte 3, provisório), pela Sabedoria; o bicho não hostil que ninguém
    // provocou (o cervo) não é atingido
    const dano = (config.danoPorPulso ?? 0) * (this.dono.fatorDeDano ?? 1)
    if (dano <= 0) return
    for (const alvo of this.cena.alvosDoJogador()) {
      if (alvo.config?.hostil === false && !alvo.perseguindo) continue
      if (Math.hypot(alvo.x - this.dono.x, alvo.y - this.dono.y) <= config.raio + alvo.tamanho / 2) this.cena.acertar(alvo, dano, this.dono, 0, this.dono)
    }
  }

  destruir() {
    this.cena.tweens.killTweensOf(this.circulo)
    this.circulo.destroy()
  }
}
