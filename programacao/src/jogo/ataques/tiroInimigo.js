import { coresDaArena } from '../../dados/arenaDeTeste.js'
import Projetil from './projetil.js'

// Bolinha lenta do atirador: para numa pedra, na borda ou no escudo de um Tanque ("BLOQUEADO"; forte demais para a
// Força dele, rompe o escudo e acerta o Tanque: CenaArena.projetilNoEscudo).
// Acerta o primeiro do grupo que estiver de pé no caminho (TASK-043: os aliados também levam dano).
// Quem está protegido (esquivando, imune ou com o Invencível ligado) deixa a bolinha passar.
export default class TiroInimigo extends Projetil {
  // A velocidade, o alcance e o dano vêm da ficha de quem atira (o atirador da arena, a aranha da Floresta)
  constructor(cena, atirador, angulo) {
    const { config } = atirador
    const saida = atirador.tamanho * 0.7
    super(cena, atirador.x + Math.cos(angulo) * saida, atirador.y + Math.sin(angulo) * saida, angulo, config.velocidadeDoTiro, config.raioDoTiro, coresDaArena.tiroInimigo)
    this.config = config
    this.atirador = atirador // a imunidade de quem leva o tiro vale contra este atirador (Parte 3)
    this.forma.setStrokeStyle(3, 0xffb0b0)
    // A teia da Aranha-Mãe (Parte 6c): branca, e prende quem acerta (CenaArena.prender)
    if (config.teia) this.forma.setFillStyle(0xf2eefa).setStrokeStyle(3, 0x9b8fb0)
  }

  atualizar(agora, segundos) {
    const { config } = this
    let acabou = false
    this.mover(segundos, () => {
      const circulo = this.circulo()
      if (this.percorrido >= config.alcanceDoTiro || this.cena.bateEmObstaculo(circulo)) acabou = true
      else if (this.cena.escudoQueBloqueia(circulo)) {
        this.cena.projetilNoEscudo(this.cena.escudoQueBloqueia(circulo), config.dano, this.origemDoEmpurrao, config.empurrao, this.x, this.y, this.atirador)
        acabou = true
      } else {
        const membro = this.cena.membroAtingido(circulo)
        if (membro) {
          const resultado = this.cena.membroLevaGolpe(membro, config.dano, this.origemDoEmpurrao, config.empurrao, this.atirador)
          acabou = resultado !== 'protegido'
          if (resultado === 'acertou' && config.teia) this.cena.prender(membro, config.teia.msPreso)
        }
      }
      return acabou
    })
    this.desenhar()
    return !acabou
  }
}
