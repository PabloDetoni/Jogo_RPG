import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import Projetil from './projetil.js'

const config = combateDeTeste.atirador

// Bolinha lenta do atirador: para numa pedra, na borda ou no escudo do Tanque ("BLOQUEADO").
// Só o Líder leva dano; os aliados ainda não levam (TASK-043), então ela passa por eles.
// Na esquiva, na imunidade ou com o Invencível ligado, ela também passa pelo Líder.
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
      const lider = this.cena.lider
      if (this.percorrido >= config.alcanceDoTiro || this.cena.bateEmObstaculo(circulo)) acabou = true
      else if (this.cena.escudo?.bloqueiaTiro(circulo)) {
        this.cena.mostrarBloqueado(this.x, this.y)
        acabou = true
      } else if (!lider.caido && circuloTocaRetangulo(circulo, lider.retangulo())) {
        acabou = this.cena.liderLevaGolpe(config.dano, this.origemDoEmpurrao, config.empurrao) !== 'protegido'
      }
      return acabou
    })
    this.desenhar()
    return !acabou
  }
}
