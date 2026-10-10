import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import { camadas, particulas, tremerTela } from '../efeitos.js'

const config = combateDeTeste.habilidades.mago
const corPadrao = 0xff7a00

// Meteoro (Mago): um círculo no chão avisa onde vai cair; depois do aviso, a pedra cai e explode, com dano e empurrão
// em todos no raio. Fica na lista de projéteis da cena (atualizar/destruir). Também serve à Chuva de flechas (a mesma
// queda avisada, com os números e a cor dela).
export default class Meteoro {
  constructor(cena, dono, ponto, agora, h = config) {
    this.cena = cena
    this.dono = dono
    this.ponto = ponto
    this.h = h
    const corDoMeteoro = h.cor ?? corPadrao
    this.cor = corDoMeteoro
    this.fim = agora + h.msDeQueda
    this.sombra = cena.add
      .circle(ponto.x, ponto.y, h.raio, 0x000000, 0.18)
      .setStrokeStyle(3, corDoMeteoro, 0.9)
      .setDepth(camadas.aura)
      .setScale(0.2)
    cena.tweens.add({ targets: this.sombra, scale: 1, duration: h.msDeQueda, ease: 'Quad.Out' })
    this.pedra = cena.add
      .rectangle(ponto.x, ponto.y - 520, 34, 34, corDoMeteoro)
      .setStrokeStyle(3, 0x1c2230)
      .setDepth(camadas.textos - 5)
    cena.tweens.add({ targets: this.pedra, y: ponto.y, angle: 270, duration: h.msDeQueda, ease: 'Quad.In' })
  }

  atualizar(agora) {
    if (agora < this.fim) return true
    this.explodir()
    return false
  }

  explodir() {
    const area = { ...this.ponto, raio: this.h.raio }
    for (const alvo of this.cena.alvosDoJogador()) {
      if (circuloTocaRetangulo(area, alvo.retangulo())) this.cena.acertar(alvo, this.h.dano, this.ponto, this.h.empurrao, this.dono)
    }
    const onda = this.cena.add
      .circle(this.ponto.x, this.ponto.y, this.h.raio, this.cor, 0.5)
      .setStrokeStyle(5, 0xffffff)
      .setDepth(this.ponto.y + 6)
      .setScale(0.3)
    this.cena.tweens.add({ targets: onda, scale: 1, alpha: 0, duration: 320, ease: 'Cubic.Out', onComplete: () => onda.destroy() })
    particulas(this.cena, this.ponto.x, this.ponto.y, this.cor, 24, 380)
    tremerTela(this.cena, 220, 0.012)
  }

  destruir() {
    this.cena.tweens.killTweensOf(this.sombra)
    this.cena.tweens.killTweensOf(this.pedra)
    this.sombra.destroy()
    this.pedra.destroy()
  }
}
