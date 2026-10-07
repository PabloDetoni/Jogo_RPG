import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetanguloGirado, noArco } from '../../regras/combate.js'

const config = combateDeTeste.ataques.tanque

// Tanque: escudo grande sempre na frente, girando com o mouse. Bloqueia os tiros que batem nele e
// os golpes que vêm da frente. O clique dá um empurrão curto, com pouco dano, que joga o inimigo para trás.
export default class Escudo {
  constructor(cena, lider) {
    this.cena = cena
    this.lider = lider
    this.angulo = 0
    this.avanco = { distancia: 0 } // o escudo avança um pouco no empurrão
    this.forma = cena.add
      .rectangle(lider.x, lider.y, config.espessuraDoEscudo, config.larguraDoEscudo, coresDaArena.escudo)
      .setStrokeStyle(3, coresDaArena.contorno)
  }

  atualizar(angulo) {
    this.angulo = angulo
    this.forma.setVisible(!this.lider.caido) // desmaiado, ninguém segura o escudo
    const distancia = config.distanciaDoEscudo + this.avanco.distancia
    this.forma
      .setPosition(this.lider.x + Math.cos(angulo) * distancia, this.lider.y + Math.sin(angulo) * distancia)
      .setRotation(angulo)
      .setDepth(this.lider.y + 3)
  }

  // A espessura fica na direção da mira; a largura, atravessada
  retangulo() {
    return { x: this.forma.x, y: this.forma.y, largura: config.espessuraDoEscudo, altura: config.larguraDoEscudo }
  }

  bloqueiaTiro(circulo) {
    return !this.lider.caido && circuloTocaRetanguloGirado(circulo, this.retangulo(), this.angulo)
  }

  // Golpe corpo a corpo vindo da frente (dentro da abertura do bloqueio)
  bloqueiaGolpe(origem) {
    return !this.lider.caido && noArco(this.lider, this.angulo, Infinity, config.aberturaDoBloqueioGraus, origem)
  }

  empurrar() {
    this.cena.tweens.killTweensOf(this.avanco)
    this.cena.tweens.add({ targets: this.avanco, distancia: 24, duration: 70, yoyo: true, ease: 'Quad.Out' })
    for (const alvo of this.cena.alvosDoJogador()) {
      if (noArco(this.lider, this.angulo, config.alcanceDoEmpurrao + alvo.tamanho / 2, config.aberturaDoBloqueioGraus, alvo)) {
        this.cena.acertar(alvo, config.dano, this.lider, config.empurrao)
      }
    }
    this.lider.deformar(1.1, 0.9, 50, 120)
  }

  destruir() {
    this.cena.tweens.killTweensOf(this.avanco)
    this.forma.destroy()
  }
}
