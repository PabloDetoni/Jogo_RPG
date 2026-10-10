import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import { particulas } from '../efeitos.js'

const config = combateDeTeste.habilidades.guerreiro

// Giro (Guerreiro): golpe em volta de si que acerta e empurra todo mundo no raio. Também serve às habilidades da
// árvore que são um golpe em volta (Golpe pesado, Explosão de fogo, Golpe de escudo), com os números e a cor delas.
export function giro(cena, dono, h = config) {
  const area = { x: dono.x, y: dono.y, raio: h.raio }
  const cor = h.cor ?? 0xffffff
  for (const alvo of cena.alvosDoJogador()) {
    if (circuloTocaRetangulo(area, alvo.retangulo())) cena.acertar(alvo, h.dano, dono, h.empurrao, dono)
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
      desenho.fillStyle(cor, 0.35)
      desenho.slice(0, 0, h.raio, volta.angulo - 1.3, volta.angulo, false)
      desenho.fillPath()
      desenho.lineStyle(3, cor, 0.8).strokeCircle(0, 0, h.raio * 0.95)
    },
    onComplete: () => cena.tweens.add({ targets: desenho, alpha: 0, duration: 140, onComplete: () => desenho.destroy() }),
  })
  dono.deformar(1.2, 1.2, 60, 160)
  particulas(cena, dono.x, dono.y, cor, 10, 260)
}
