import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import { particulas } from '../efeitos.js'

const config = combateDeTeste.habilidades.guerreiro

// Giro (Guerreiro, provisória): golpe em volta de si que acerta e empurra todo mundo no raio
export function giro(cena, dono) {
  const area = { x: dono.x, y: dono.y, raio: config.raio }
  for (const alvo of cena.alvosDoJogador()) {
    if (circuloTocaRetangulo(area, alvo.retangulo())) cena.acertar(alvo, config.dano, dono, config.empurrao, dono)
  }

  // Desenho: uma fatia branca dá a volta inteira e some
  const desenho = cena.add.graphics({ x: dono.x, y: dono.y }).setDepth(dono.y + 3)
  const volta = { angulo: 0 }
  cena.tweens.add({
    targets: volta,
    angulo: Math.PI * 2,
    duration: 260,
    ease: 'Quad.Out',
    onUpdate: () => {
      desenho.clear().setPosition(dono.x, dono.y)
      desenho.fillStyle(0xffffff, 0.35)
      desenho.slice(0, 0, config.raio, volta.angulo - 1.3, volta.angulo, false)
      desenho.fillPath()
      desenho.lineStyle(3, 0xffffff, 0.8).strokeCircle(0, 0, config.raio * 0.95)
    },
    onComplete: () => cena.tweens.add({ targets: desenho, alpha: 0, duration: 140, onComplete: () => desenho.destroy() }),
  })
  dono.deformar(1.2, 1.2, 60, 160)
  particulas(cena, dono.x, dono.y, 0xffffff, 10, 260)
}
