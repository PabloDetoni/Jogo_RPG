import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetanguloGirado, noArco } from '../../regras/combate.js'

const config = combateDeTeste.ataques.tanque

// Tanque (Líder ou aliado): escudo grande sempre na frente, girando com a mira do dono. Bloqueia os tiros
// que batem nele e os golpes que vêm da frente. O ataque dá um empurrão curto, com pouco dano, que joga
// o inimigo para trás. Caído, ninguém segura o escudo.
export default class Escudo {
  constructor(cena, dono) {
    this.cena = cena
    this.dono = dono
    this.angulo = 0
    this.avanco = { distancia: 0 } // o escudo avança um pouco no empurrão
    this.forma = cena.add
      .rectangle(dono.x, dono.y, config.espessuraDoEscudo, config.larguraDoEscudo, coresDaArena.escudo)
      .setStrokeStyle(3, coresDaArena.contorno)
  }

  get ativo() {
    return !this.dono.caido && !this.dono.morto
  }

  atualizar() {
    const angulo = this.dono.anguloDaMira
    this.angulo = angulo
    this.forma.setVisible(this.ativo)
    const distancia = config.distanciaDoEscudo + this.avanco.distancia
    this.forma
      .setPosition(this.dono.x + Math.cos(angulo) * distancia, this.dono.y + Math.sin(angulo) * distancia)
      .setRotation(angulo)
      .setDepth(this.dono.y + 3)
  }

  // A espessura fica na direção da mira; a largura, atravessada
  retangulo() {
    return { x: this.forma.x, y: this.forma.y, largura: config.espessuraDoEscudo, altura: config.larguraDoEscudo }
  }

  bloqueiaTiro(circulo) {
    return this.ativo && circuloTocaRetanguloGirado(circulo, this.retangulo(), this.angulo)
  }

  // Golpe corpo a corpo vindo da frente (dentro da abertura do bloqueio)
  bloqueiaGolpe(origem) {
    return this.ativo && noArco(this.dono, this.angulo, Infinity, config.aberturaDoBloqueioGraus, origem)
  }

  empurrar() {
    this.cena.tweens.killTweensOf(this.avanco)
    this.cena.tweens.add({ targets: this.avanco, distancia: 24, duration: 70, yoyo: true, ease: 'Quad.Out' })
    for (const alvo of this.cena.alvosDoJogador()) {
      if (noArco(this.dono, this.angulo, config.alcanceDoEmpurrao + alvo.tamanho / 2, config.aberturaDoBloqueioGraus, alvo)) {
        this.cena.acertar(alvo, config.dano, this.dono, config.empurrao, this.dono)
      }
    }
    this.dono.deformar(1.1, 0.9, 50, 120)
  }

  destruir() {
    this.cena.tweens.killTweensOf(this.avanco)
    this.forma.destroy()
  }
}
