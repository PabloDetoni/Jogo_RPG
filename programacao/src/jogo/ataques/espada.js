import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { grausParaRadianos, noArco } from '../../regras/combate.js'

const config = combateDeTeste.ataques.guerreiro

// Guerreiro: a lâmina varre um arco na frente, na direção da mira, e acerta tudo o que está nele.
// dono: quem bate (o Líder ou o Guerreiro aliado).
export function golpeDeEspada(cena, dono, angulo) {
  for (const alvo of cena.alvosDoJogador()) {
    if (noArco(dono, angulo, config.alcance + alvo.tamanho / 2, config.aberturaGraus, alvo)) {
      cena.acertar(alvo, config.dano, dono, config.empurrao, dono)
    }
  }

  // Desenho: a fatia do arco (onde o golpe pega) e a lâmina passando de um lado ao outro
  const meio = grausParaRadianos(config.aberturaGraus) / 2
  const fatia = cena.add.graphics({ x: dono.x, y: dono.y }).setDepth(dono.y + 3)
  fatia.fillStyle(0xffffff, 0.3)
  fatia.slice(0, 0, config.alcance + 12, angulo - meio, angulo + meio, false)
  fatia.fillPath()
  const lamina = cena.add
    .rectangle(dono.x, dono.y, config.alcance + 10, 12, 0xeef4ff)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, coresDaArena.contorno)
    .setRotation(angulo - meio)
    .setDepth(dono.y + 4)
  const giro = { angulo: angulo - meio }
  cena.tweens.add({
    targets: giro,
    angulo: angulo + meio,
    duration: 110,
    ease: 'Quad.Out',
    onUpdate: () => {
      lamina.setPosition(dono.x, dono.y).setRotation(giro.angulo)
      fatia.setPosition(dono.x, dono.y)
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
  dono.deformar(1.15, 0.88, 50, 120)
}
