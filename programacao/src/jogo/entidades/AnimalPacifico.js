import { mundo } from '../../dados/balanceamento.js'
import { velocidadeDoMovimento } from '../../regras/combate.js'
import { direcaoDeFuga } from '../../regras/mobs.js'
import Inimigo from './Inimigo.js'

// Animal pacífico (Parte 6a de 11/2026): o cervo e o coelho das zonas neutras. NUNCA ataca: passeia em volta de casa e,
// quando um mob hostil ou alguém do grupo chega perto (config.raioDeFuga), foge para longe de todos eles, sem sair da
// zona dele (Inimigo.andar). Atacado, foge também (mais longe). Nunca conta como "perseguindo": não deixa o grupo em
// combate, não acorda e os aliados e a aura não miram nele (regras/iaDosAliados.js, jogo/ataques/aura.js).
export default class AnimalPacifico extends Inimigo {
  constructor(cena, x, y, config, cor) {
    super(cena, x, y, config, cor)
    this.fugindoAte = 0 // atacado: foge com o raio maior até esta hora
    this.usarArte(config.tipo)
    this.usarDesenhoDeBicho(config.tipo)
  }

  get perseguindo() {
    return false
  }

  get fugindo() {
    return this.estado === 'fugindo'
  }

  // Quem assusta: os mobs hostis e quem do grupo está de pé
  ameacas() {
    const hostis = this.cena.inimigos.filter((outro) => outro !== this && !outro.morto && outro.config?.hostil !== false)
    return [...hostis, ...this.cena.membrosDePe]
  }

  atualizar(agora) {
    if (this.morto || this.estaSendoEmpurrado(agora)) return
    const { pacificos } = mundo
    const raio = this.config.raioDeFuga * (agora < this.fugindoAte ? pacificos.raioAtacado : this.fugindo ? pacificos.raioFugindo : 1)
    const direcao = direcaoDeFuga(this, this.ameacas(), raio)
    if (direcao) {
      this.estado = 'fugindo'
      this.andar(velocidadeDoMovimento(direcao.x, direcao.y, this.config.velocidade))
      return
    }
    if (this.fugindo) {
      // Passou o susto: a casa nova é onde parou (não volta para perto de quem assustou)
      this.estado = 'passeando'
      this.casa = { x: this.x, y: this.y }
      this.destinoDoPasseio = null
      this.proximoPasseio = agora + pacificos.msParadoDepoisDoSusto
    }
    this.passear(agora)
  }

  // Atacado: nunca revida, só foge (mais longe, por um tempo)
  aoApanhar(agora) {
    this.fugindoAte = (agora ?? this.cena.agora) + mundo.pacificos.msFugindoAtacado
  }
}
