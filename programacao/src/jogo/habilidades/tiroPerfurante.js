import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import Projetil from '../ataques/projetil.js'
import { particulas } from '../efeitos.js'

const config = combateDeTeste.habilidades.arqueiro

// Tiro perfurante (Arqueiro, provisória): muito rápido, com bem mais dano que a flecha. Atravessa os
// inimigos (acerta cada um uma vez) e cruza o mapa; só para numa pedra ou na borda.
export default class TiroPerfurante extends Projetil {
  constructor(cena, dono, angulo) {
    const saida = dono.tamanho * 0.7
    super(cena, dono.x + Math.cos(angulo) * saida, dono.y + Math.sin(angulo) * saida, angulo, config.velocidade, config.raio, 0xffffff)
    this.dono = dono
    this.acertados = new Set()
    this.forma.setStrokeStyle(3, coresDaArena.flecha)
    this.risco = cena.add.rectangle(this.x, this.y, 110, 8, 0x9ffcff, 0.75).setOrigin(1, 0.5).setRotation(angulo)
    this.ultimaFaisca = 0
  }

  atualizar(agora, segundos) {
    let acabou = false
    this.mover(segundos, () => {
      const circulo = this.circulo()
      if (this.percorrido >= config.alcance) acabou = true
      else if (this.cena.bateEmObstaculo(circulo)) {
        particulas(this.cena, this.x, this.y, coresDaArena.pedra, 10, 200)
        acabou = true
      } else {
        for (const alvo of this.cena.alvosDoJogador()) {
          if (this.acertados.has(alvo) || !circuloTocaRetangulo(circulo, alvo.retangulo())) continue
          this.acertados.add(alvo)
          this.cena.acertar(alvo, config.dano, this.origemDoEmpurrao, config.empurrao, this.dono)
        }
      }
      return acabou
    })
    this.desenhar()
    this.risco.setPosition(this.x, this.y).setDepth(this.y + 4)
    if (agora - this.ultimaFaisca > 40) {
      this.ultimaFaisca = agora
      particulas(this.cena, this.x, this.y, 0x9ffcff, 2, 60)
    }
    return !acabou
  }

  destruir() {
    super.destruir()
    this.risco.destroy()
  }
}
