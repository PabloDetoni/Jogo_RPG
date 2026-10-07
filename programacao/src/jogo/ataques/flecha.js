import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { particulas } from '../efeitos.js'
import Projetil from './projetil.js'

const config = combateDeTeste.ataques.arqueiro

// Arqueiro: bolinha pequena e muito rápida, em linha reta. Some ao acertar alguém, uma pedra ou a borda;
// acerta um alvo só.
export default class Flecha extends Projetil {
  constructor(cena, dono, angulo) {
    const saida = dono.tamanho * 0.7
    super(cena, dono.x + Math.cos(angulo) * saida, dono.y + Math.sin(angulo) * saida, angulo, config.velocidade, config.raio, coresDaArena.flecha)
    this.dono = dono
    this.risco = cena.add.rectangle(this.x, this.y, 28, 3, coresDaArena.flecha, 0.55).setOrigin(1, 0.5).setRotation(angulo)
  }

  atualizar(agora, segundos) {
    let acabou = false
    this.mover(segundos, () => {
      const circulo = this.circulo()
      if (this.percorrido >= config.alcance) acabou = true
      else if (this.cena.bateEmObstaculo(circulo)) {
        particulas(this.cena, this.x, this.y, coresDaArena.pedra, 5, 120)
        acabou = true
      } else {
        const alvo = this.cena.alvoAtingido(circulo)
        if (alvo) {
          this.cena.acertar(alvo, config.dano, this.origemDoEmpurrao, config.empurrao, this.dono)
          acabou = true
        }
      }
      return acabou
    })
    this.desenhar()
    this.risco.setPosition(this.x, this.y).setDepth(this.y + 4)
    return !acabou
  }

  destruir() {
    super.destruir()
    this.risco.destroy()
  }
}
