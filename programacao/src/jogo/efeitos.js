import { coresDaArena } from '../dados/arenaDeTeste.js'

// Resposta visual dos golpes (referência: Everything is Crab): números que sobem,
// quadradinhos de partícula e a tela tremendo. Nada aqui muda regra; é só desenho.

// Camadas de desenho: o chão embaixo, os personagens pela altura na tela (y), os textos por cima
export const camadas = { manchas: -100, borda: -90, sombras: -50, aura: -40, textos: 100000 }

const fonte = 'system-ui, "Segoe UI", sans-serif'

// Textura de um quadradinho branco: as partículas pegam a cor de quem foi atingido
export function criarTexturas(cena) {
  if (cena.textures.exists('particula')) return
  const desenho = cena.add.graphics()
  desenho.fillStyle(0xffffff, 1).fillRect(0, 0, 8, 8)
  desenho.generateTexture('particula', 8, 8)
  desenho.destroy()
}

// Número (ou palavra) que pula e sobe sumindo
export function numeroFlutuante(cena, x, y, texto, cor = coresDaArena.numeroDeDano, tamanho = 26) {
  const rotulo = cena.add
    .text(x, y, texto, {
      fontFamily: fonte,
      fontSize: `${tamanho}px`,
      fontStyle: 'bold',
      color: cor,
      stroke: '#1c2230',
      strokeThickness: 5,
    })
    .setOrigin(0.5)
    .setDepth(camadas.textos)
    .setScale(0.5)
  cena.tweens.add({ targets: rotulo, scale: 1, duration: 110, ease: 'Back.Out' })
  cena.tweens.add({
    targets: rotulo,
    y: y - 48,
    alpha: 0,
    delay: 220,
    duration: 650,
    ease: 'Cubic.Out',
    onComplete: () => rotulo.destroy(),
  })
}

// Explosão de quadradinhos
export function particulas(cena, x, y, cor, quantidade = 10, velocidade = 220) {
  const emissor = cena.add.particles(x, y, 'particula', {
    speed: { min: velocidade * 0.35, max: velocidade },
    angle: { min: 0, max: 360 },
    rotate: { min: 0, max: 360 },
    lifespan: { min: 250, max: 520 },
    scale: { start: 1, end: 0 },
    tint: cor,
    emitting: false,
  })
  emissor.setDepth(camadas.textos - 1)
  emissor.explode(quantidade)
  cena.time.delayedCall(700, () => emissor.destroy())
}

export function tremerTela(cena, ms = 140, intensidade = 0.006) {
  cena.cameras.main.shake(ms, intensidade)
}

// Rastro da esquiva: uma cópia apagada do quadrado que some no lugar de onde ele saiu
export function rastro(cena, x, y, tamanho, cor) {
  const copia = cena.add.rectangle(x, y, tamanho, tamanho, cor, 0.45).setDepth(y - 1)
  cena.tweens.add({ targets: copia, alpha: 0, scale: 0.8, duration: 220, onComplete: () => copia.destroy() })
}
