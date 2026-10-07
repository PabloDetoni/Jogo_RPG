import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo, raioDaBolaMagica } from '../../regras/combate.js'
import { particulas, tremerTela } from '../efeitos.js'
import Projetil from './projetil.js'

const config = combateDeTeste.ataques.mago

// Mago: bola mais lenta que cresce enquanto voa. Explode ao acertar algo ou no alcance máximo,
// e a explosão dá dano em área. A tela treme de leve.
export default class BolaMagica extends Projetil {
  constructor(cena, dono, angulo) {
    const saida = dono.tamanho * 0.7
    super(cena, dono.x + Math.cos(angulo) * saida, dono.y + Math.sin(angulo) * saida, angulo, config.velocidade, config.raioInicial, coresDaArena.bolaMagica)
    this.dono = dono
    this.brilho = cena.add.circle(this.x, this.y, config.raioInicial * 1.7, coresDaArena.bolaMagica, 0.3)
  }

  atualizar(agora, segundos) {
    let explodiu = false
    this.mover(segundos, () => {
      this.raio = raioDaBolaMagica(this.percorrido, config.alcance, config.raioInicial, config.raioFinal)
      const circulo = this.circulo()
      explodiu = this.percorrido >= config.alcance || this.cena.bateEmObstaculo(circulo) || Boolean(this.cena.alvoAtingido(circulo))
      return explodiu
    })
    if (explodiu) {
      this.explodir()
      return false
    }
    this.forma.setRadius(this.raio)
    this.desenhar()
    this.brilho.setRadius(this.raio * 1.7).setPosition(this.x, this.y).setDepth(this.y + 4)
    return true
  }

  explodir() {
    const centro = { x: this.x, y: this.y }
    const area = { ...centro, raio: config.raioDaExplosao }
    for (const alvo of this.cena.alvosDoJogador()) {
      if (circuloTocaRetangulo(area, alvo.retangulo())) this.cena.acertar(alvo, config.dano, centro, config.empurrao, this.dono)
    }
    const onda = this.cena.add
      .circle(centro.x, centro.y, config.raioDaExplosao, coresDaArena.bolaMagica, 0.5)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(centro.y + 6)
      .setScale(0.3)
    this.cena.tweens.add({ targets: onda, scale: 1, alpha: 0, duration: 280, ease: 'Cubic.Out', onComplete: () => onda.destroy() })
    particulas(this.cena, centro.x, centro.y, coresDaArena.bolaMagica, 18, 340)
    tremerTela(this.cena, 160, 0.008)
  }

  destruir() {
    super.destruir()
    this.brilho.destroy()
  }
}
