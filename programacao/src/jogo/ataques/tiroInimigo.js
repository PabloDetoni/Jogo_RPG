import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import Projetil from './projetil.js'

const config = combateDeTeste.atirador

// Bolinha lenta do atirador: para numa pedra, na borda ou no escudo de um Tanque ("BLOQUEADO").
// Acerta o primeiro do grupo que estiver de pé no caminho (TASK-043: os aliados também levam dano).
// Quem está protegido (esquivando, imune ou com o Invencível ligado) deixa a bolinha passar.
export default class TiroInimigo extends Projetil {
  constructor(cena, atirador, angulo) {
    const saida = atirador.tamanho * 0.7
    super(cena, atirador.x + Math.cos(angulo) * saida, atirador.y + Math.sin(angulo) * saida, angulo, config.velocidadeDoTiro, config.raioDoTiro, coresDaArena.tiroInimigo)
    this.forma.setStrokeStyle(3, 0xffb0b0)
  }

  atualizar(agora, segundos) {
    let acabou = false
    this.mover(segundos, () => {
      const circulo = this.circulo()
      if (this.percorrido >= config.alcanceDoTiro || this.cena.bateEmObstaculo(circulo)) acabou = true
      else if (this.cena.escudoQueBloqueia(circulo)) {
        this.cena.mostrarBloqueado(this.x, this.y)
        acabou = true
      } else {
        const membro = this.cena.membroAtingido(circulo)
        if (membro) acabou = this.cena.membroLevaGolpe(membro, config.dano, this.origemDoEmpurrao, config.empurrao) !== 'protegido'
      }
      return acabou
    })
    this.desenhar()
    return !acabou
  }
}
