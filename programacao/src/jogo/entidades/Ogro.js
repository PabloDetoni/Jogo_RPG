import { mundo } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo } from '../../regras/combate.js'
import { camadas, particulas, tremerTela } from '../efeitos.js'
import GuardiaoDaFloresta from './GuardiaoDaFloresta.js'

// O Ogro, chefe da Floresta grande (Parte 6d de 11/2026; PROVISÓRIO – substituir pelo do grupo). Fica no domínio do
// fim do mapa e luta como o Guardião (o mesmo esquema de três golpes AVISADOS no chão antes do dano), com o terceiro
// golpe trocado: em vez do leque de espinhos, ele ARREMESSA uma pedra onde o alvo está: a marca redonda aparece no
// chão, cresce de cor e a pedra cai nela (quem sair da marca a tempo não leva dano).
// - pancada (o "pisao" do Guardião): perto, a clava bate no chão em volta dele;
// - investida: a média distância, a faixa reta até o alvo;
// - arremesso: de longe, a marca no lugar do alvo.
// Desenho: o boneco em blocos grande (dados/bonecos.js, "ogro"); com a arte do Ogro, a imagem.
export default class Ogro extends GuardiaoDaFloresta {
  constructor(cena, x, y) {
    super(cena, x, y, mundo.ogro, 'ogro')
    this.usarDesenhoDeBicho('ogro')
  }

  comecarAtaque(tipo, agora) {
    if (tipo !== 'arremesso') return super.comecarAtaque(tipo, agora)
    const ficha = this.config.arremesso
    const alvo = this.alvo ?? { x: this.x + 1, y: this.y }
    this.tipoDoAtaque = tipo
    this.estado = 'avisando'
    this.parar()
    this.direcao = Math.atan2(alvo.y - this.y, alvo.x - this.x)
    this.pontoDaPedra = { x: alvo.x, y: alvo.y }
    this.fimDoAviso = agora + ficha.msDeAviso
    this.inicioDoAviso = agora
    this.apagarAviso()
    const vermelho = 0xff3b3b
    this.aviso = this.marcaDoAviso('pisao', alvo.x, alvo.y, ficha.raio * 2, ficha.raio * 2, 0, () =>
      this.cena.add.circle(alvo.x, alvo.y, ficha.raio, vermelho, 0.18).setStrokeStyle(3, vermelho, 0.9).setDepth(camadas.aura),
    )
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.cena.tweens.add({ targets: this.escalaExtra, x: 0.9, y: 1.12, duration: ficha.msDeAviso, ease: 'Quad.In' })
  }

  atacar(agora) {
    if (this.tipoDoAtaque !== 'arremesso') return super.atacar(agora)
    const ficha = this.config.arremesso
    const ponto = this.pontoDaPedra
    this.apagarAviso()
    this.ultimoAtaque = agora
    this.escalaExtra.x = 1
    this.escalaExtra.y = 1
    // A pedra cai na marca: quem está dentro leva o golpe (em área: o escudo não segura)
    for (const membro of this.cena.membrosDePe) {
      if (circuloTocaRetangulo({ x: ponto.x, y: ponto.y, raio: ficha.raio }, membro.retangulo())) this.cena.inimigoAcerta(this, membro, ficha.dano, ficha.empurrao, 'area')
    }
    particulas(this.cena, ponto.x, ponto.y, 0x8b8f96, 20, 300)
    tremerTela(this.cena, 120, 0.004)
    this.deformar(0.85, 1.15, 50, 180)
    this.estado = 'perseguindo'
  }
}
