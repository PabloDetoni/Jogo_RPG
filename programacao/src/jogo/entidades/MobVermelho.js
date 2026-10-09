import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { podeUsar, velocidadeDoMovimento } from '../../regras/combate.js'
import Inimigo from './Inimigo.js'

// O bote para ao encostar (ninguém atravessa ninguém, e quem anda para a poucos px do outro);
// a folga conta esse encostar como acerto
const aumentar = (retangulo, folga) => ({ ...retangulo, largura: retangulo.largura + folga, altura: retangulo.altura + folga })

// Mob vermelho (corpo a corpo). Ataca quem do grupo ele estiver perseguindo (o Tanque perto atrai). Estados:
// passeando → perseguindo → avisando (pisca e encolhe) → bote (avanço curto) → descansando → perseguindo
// Na Floresta (Fase 3), o lobo, o javali e o cervo são este mesmo mob com outra ficha (balanceamento.js, mundo.mobs).
export default class MobVermelho extends Inimigo {
  constructor(cena, x, y, config = combateDeTeste.mobVermelho, cor = coresDaArena.mobVermelho) {
    super(cena, x, y, config, cor)
    this.ultimoBote = null
  }

  atualizar(agora) {
    const { config } = this
    if (this.morto || this.estaSendoEmpurrado(agora)) return

    if (this.estado === 'passeando' || this.estado === 'perseguindo') {
      const alvo = this.decidirAlvo(agora)
      if (!alvo) {
        this.passear(agora)
        return
      }
      const ate = this.distanciaAte(alvo)
      if (ate <= config.alcanceDoBote && podeUsar(agora, this.ultimoBote, config.recargaMs)) {
        this.avisar(agora)
        return
      }
      // Chega perto e espera a recarga sem colar no alvo
      if (ate <= config.alcanceDoBote * 0.7) this.parar()
      else this.andar(this.velocidadeAte(alvo, config.velocidade))
      return
    }

    if (this.estado === 'avisando') {
      this.parar()
      if (agora >= this.fimDoAviso) this.darBote(agora)
      return
    }

    if (this.estado === 'bote') {
      if (!this.acertouNoBote) {
        // Acerta o primeiro do grupo que encostar, mesmo que não seja o alvo
        const atingido = this.cena.membroTocado(aumentar(this.retangulo(), 32))
        if (atingido) {
          this.acertouNoBote = true
          this.cena.inimigoAcerta(this, atingido, config.dano, config.empurrao)
        }
      }
      if (agora >= this.fimDoBote) {
        this.estado = 'descansando'
        this.fimDoDescanso = agora + 350
        this.parar()
      }
      return
    }

    if (this.estado === 'descansando') {
      this.parar()
      if (agora >= this.fimDoDescanso) this.estado = 'perseguindo'
    }
  }

  // Meio segundo de aviso antes do golpe: pisca e encolhe (ninguém leva golpe sem ver)
  avisar(agora) {
    const { config } = this
    this.estado = 'avisando'
    this.fimDoAviso = agora + config.msDeAviso
    this.parar()
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.cena.tweens.add({ targets: this.escalaExtra, x: 0.78, y: 0.78, duration: config.msDeAviso, ease: 'Quad.In' })
  }

  // O bote vai na direção do alvo (ou de onde ele estava, se caiu durante o aviso)
  darBote(agora) {
    const { config } = this
    const velocidadeDoBote = config.distanciaDoBote / (config.msDeBote / 1000)
    this.estado = 'bote'
    this.ultimoBote = agora
    this.fimDoBote = agora + config.msDeBote
    this.acertouNoBote = false
    const destino = this.alvo ?? { x: this.x + 1, y: this.y }
    const velocidade = velocidadeDoMovimento(destino.x - this.x, destino.y - this.y, velocidadeDoBote)
    this.andar(velocidade)
    const deitado = Math.abs(velocidade.x) > Math.abs(velocidade.y)
    this.deformar(deitado ? 1.4 : 0.75, deitado ? 0.75 : 1.4, 60, 180)
  }

  // Interrompido por um empurrão: volta a perseguir depois dele
  empurrar(vetor, ms) {
    super.empurrar(vetor, ms)
    if (this.estado === 'avisando' || this.estado === 'bote') {
      this.estado = 'perseguindo'
      this.cena.tweens.killTweensOf(this.escalaExtra)
      this.escalaExtra.x = 1
      this.escalaExtra.y = 1
    }
  }

  atualizarDesenho(agora, delta) {
    // Durante o aviso, pisca branco e vermelho
    if (this.estado === 'avisando') this.quadrado.setFillStyle(Math.floor(agora / 80) % 2 ? 0xffffff : this.cor)
    else if (!this.fimDoPiscar) this.quadrado.setFillStyle(this.cor)
    super.atualizarDesenho(agora, delta)
  }
}
