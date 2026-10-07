import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { podeUsar, retangulosSeTocam, velocidadeDoMovimento } from '../../regras/combate.js'
import Inimigo from './Inimigo.js'

const config = combateDeTeste.mobVermelho
const velocidadeDoBote = config.distanciaDoBote / (config.msDeBote / 1000)

// Mob vermelho (corpo a corpo). Estados:
// passeando → perseguindo → avisando (pisca e encolhe) → bote (avanço curto) → descansando → perseguindo
export default class MobVermelho extends Inimigo {
  constructor(cena, x, y) {
    super(cena, x, y, config, coresDaArena.mobVermelho)
    this.ultimoBote = null
  }

  atualizar(agora) {
    if (this.morto || this.estaSendoEmpurrado(agora)) return
    const lider = this.cena.lider
    const corpo = this.corpo.body

    if (this.estado === 'passeando' || this.estado === 'perseguindo') {
      if (!this.decidirPerseguicao(lider, agora)) {
        this.passear(agora)
        return
      }
      const ate = this.distanciaAte(lider)
      if (ate <= config.alcanceDoBote && podeUsar(agora, this.ultimoBote, config.recargaMs)) {
        this.avisar(agora)
        return
      }
      // Chega perto e espera a recarga sem colar no Líder
      const velocidade =
        ate <= config.alcanceDoBote * 0.7 ? { x: 0, y: 0 } : this.velocidadeAte(lider, config.velocidade)
      corpo.setVelocity(velocidade.x, velocidade.y)
      return
    }

    if (this.estado === 'avisando') {
      corpo.setVelocity(0, 0)
      if (agora >= this.fimDoAviso) this.darBote(agora, lider)
      return
    }

    if (this.estado === 'bote') {
      if (!this.acertouNoBote && !lider.caido && retangulosSeTocam(this.retangulo(), lider.retangulo())) {
        this.acertouNoBote = true
        this.cena.inimigoAcertaLider(this, config.dano, config.empurrao)
      }
      if (agora >= this.fimDoBote) {
        this.estado = 'descansando'
        this.fimDoDescanso = agora + 350
        corpo.setVelocity(0, 0)
      }
      return
    }

    if (this.estado === 'descansando') {
      corpo.setVelocity(0, 0)
      if (agora >= this.fimDoDescanso) this.estado = 'perseguindo'
    }
  }

  // Meio segundo de aviso antes do golpe: pisca e encolhe (ninguém leva golpe sem ver)
  avisar(agora) {
    this.estado = 'avisando'
    this.fimDoAviso = agora + config.msDeAviso
    this.corpo.body.setVelocity(0, 0)
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.cena.tweens.add({ targets: this.escalaExtra, x: 0.78, y: 0.78, duration: config.msDeAviso, ease: 'Quad.In' })
  }

  darBote(agora, lider) {
    this.estado = 'bote'
    this.ultimoBote = agora
    this.fimDoBote = agora + config.msDeBote
    this.acertouNoBote = false
    const velocidade = velocidadeDoMovimento(lider.x - this.x, lider.y - this.y, velocidadeDoBote)
    this.corpo.body.setVelocity(velocidade.x, velocidade.y)
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
