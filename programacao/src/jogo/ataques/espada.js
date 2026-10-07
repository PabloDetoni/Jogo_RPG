import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { grausParaRadianos, noArco } from '../../regras/combate.js'

const config = combateDeTeste.ataques.guerreiro

// Guerreiro: a lâmina varre um arco na frente, na direção do mouse, e acerta tudo o que está nele.
export function golpeDeEspada(cena, lider, angulo) {
  for (const alvo of cena.alvosDoJogador()) {
    if (noArco(lider, angulo, config.alcance + alvo.tamanho / 2, config.aberturaGraus, alvo)) {
      cena.acertar(alvo, config.dano, lider, config.empurrao)
    }
  }

  // Desenho: a fatia do arco (onde o golpe pega) e a lâmina passando de um lado ao outro
  const meio = grausParaRadianos(config.aberturaGraus) / 2
  const fatia = cena.add.graphics({ x: lider.x, y: lider.y }).setDepth(lider.y + 3)
  fatia.fillStyle(0xffffff, 0.3)
  fatia.slice(0, 0, config.alcance + 12, angulo - meio, angulo + meio, false)
  fatia.fillPath()
  const lamina = cena.add
    .rectangle(lider.x, lider.y, config.alcance + 10, 12, 0xeef4ff)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, coresDaArena.contorno)
    .setRotation(angulo - meio)
    .setDepth(lider.y + 4)
  const giro = { angulo: angulo - meio }
  cena.tweens.add({
    targets: giro,
    angulo: angulo + meio,
    duration: 110,
    ease: 'Quad.Out',
    onUpdate: () => {
      lamina.setPosition(lider.x, lider.y).setRotation(giro.angulo)
      fatia.setPosition(lider.x, lider.y)
    },
    onComplete: () => {
      cena.tweens.add({
        targets: [lamina, fatia],
        alpha: 0,
        duration: 120,
        onComplete: () => {
          lamina.destroy()
          fatia.destroy()
        },
      })
    },
  })
  lider.deformar(1.15, 0.88, 50, 120)
}
