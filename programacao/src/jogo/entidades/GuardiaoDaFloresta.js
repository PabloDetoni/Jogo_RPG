import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { mundo } from '../../dados/balanceamento.js'
import { circuloTocaRetangulo, podeUsar, velocidadeDoMovimento } from '../../regras/combate.js'
import TiroInimigo from '../ataques/tiroInimigo.js'
import { camadas, particulas, tremerTela } from '../efeitos.js'
import Inimigo from './Inimigo.js'

// O Boss da Floresta (Fase 3, TASK-065). PROVISÓRIO – substituir pelo do grupo (TASK-012).
// Fica no domínio dele (o território), persegue o grupo devagar e tem três ataques, todos AVISADOS no chão antes do
// golpe (ninguém leva dano sem ver):
// - pisão: perto, uma área redonda em volta dele;
// - investida: a média distância, uma faixa reta até o alvo, por onde ele avança;
// - espinhos: de longe, um leque de tiros, com as linhas marcadas antes.
// Estados: passeando → perseguindo → avisando (a marca no chão) → atacando → perseguindo.
export default class GuardiaoDaFloresta extends Inimigo {
  constructor(cena, x, y) {
    const config = mundo.boss
    super(cena, x, y, config, config.cor)
    this.ehBoss = true
    this.peso = 6 // quase não se mexe com a separação dos corpos
    this.ultimoAtaque = null
    this.aviso = null // a marca do ataque no chão
    this.quadrado.setStrokeStyle(4, coresDaArena.contorno)
    // A coroa de raízes em cima (só desenho)
    this.coroa = cena.add.rectangle(0, -config.tamanho * 0.42, config.tamanho * 0.7, 10, 0x4f8f3a).setStrokeStyle(2, coresDaArena.contorno)
    this.visual.add(this.coroa)
  }

  // Empurrões quase não o tiram do lugar
  empurrar(vetor, ms) {
    super.empurrar({ x: vetor.x * 0.15, y: vetor.y * 0.15 }, ms)
  }

  atualizar(agora) {
    if (this.morto) return
    const { config } = this

    if (this.estado === 'avisando') {
      this.parar()
      this.atualizarAviso(agora)
      if (agora >= this.fimDoAviso) this.atacar(agora)
      return
    }
    if (this.estado === 'atacando') {
      this.continuarAtaque(agora)
      return
    }

    const alvo = this.decidirAlvo(agora)
    if (!alvo) {
      this.passear(agora)
      return
    }
    const ate = this.distanciaAte(alvo)
    if (podeUsar(agora, this.ultimoAtaque, config.msEntreAtaques)) {
      if (ate <= config.pisao.alcance) return this.comecarAtaque('pisao', agora)
      if (ate <= config.investida.alcance) return this.comecarAtaque('investida', agora)
      if (ate <= config.espinhos.alcanceDoTiro * 0.85) return this.comecarAtaque('espinhos', agora)
    }
    if (ate > config.pisao.alcance * 0.7) this.andar(this.velocidadeAte(alvo, config.velocidade))
    else this.parar()
  }

  // Começa um ataque: a marca aparece no chão e só depois vem o golpe
  comecarAtaque(tipo, agora) {
    const { config } = this
    const alvo = this.alvo ?? { x: this.x + 1, y: this.y }
    this.tipoDoAtaque = tipo
    this.estado = 'avisando'
    this.parar()
    this.direcao = Math.atan2(alvo.y - this.y, alvo.x - this.x)
    const ficha = config[tipo]
    this.fimDoAviso = agora + ficha.msDeAviso
    this.inicioDoAviso = agora
    this.apagarAviso()
    const vermelho = 0xff3b3b
    if (tipo === 'pisao') {
      this.aviso = this.cena.add.circle(this.x, this.y, ficha.raio, vermelho, 0.18).setStrokeStyle(3, vermelho, 0.9).setDepth(camadas.aura)
    } else if (tipo === 'investida') {
      const centro = { x: this.x + (Math.cos(this.direcao) * ficha.comprimento) / 2, y: this.y + (Math.sin(this.direcao) * ficha.comprimento) / 2 }
      this.aviso = this.cena.add
        .rectangle(centro.x, centro.y, ficha.comprimento, ficha.largura, vermelho, 0.18)
        .setStrokeStyle(3, vermelho, 0.9)
        .setRotation(this.direcao)
        .setDepth(camadas.aura)
    } else {
      const linhas = []
      for (let i = 0; i < ficha.quantos; i++) {
        const angulo = this.direcao + (i - (ficha.quantos - 1) / 2) * (ficha.abertura / Math.max(1, ficha.quantos - 1))
        const comprimento = ficha.alcanceDoTiro * 0.6
        linhas.push(
          this.cena.add
            .rectangle(this.x + (Math.cos(angulo) * comprimento) / 2, this.y + (Math.sin(angulo) * comprimento) / 2, comprimento, 6, vermelho, 0.45)
            .setRotation(angulo)
            .setDepth(camadas.aura),
        )
      }
      this.aviso = { linhas, destroy: () => linhas.forEach((linha) => linha.destroy()) }
    }
    this.cena.tweens.killTweensOf(this.escalaExtra)
    this.cena.tweens.add({ targets: this.escalaExtra, x: 1.12, y: 0.88, duration: ficha.msDeAviso, ease: 'Quad.In' })
  }

  // A marca do pisão e da investida vai ficando mais forte até o golpe
  atualizarAviso(agora) {
    if (!this.aviso || this.aviso.linhas) return
    const fracao = Math.min(1, (agora - this.inicioDoAviso) / (this.fimDoAviso - this.inicioDoAviso))
    this.aviso.setFillStyle(0xff3b3b, 0.15 + fracao * 0.35)
  }

  apagarAviso() {
    this.aviso?.destroy()
    this.aviso = null
  }

  atacar(agora) {
    const { config } = this
    const tipo = this.tipoDoAtaque
    const ficha = config[tipo]
    this.apagarAviso()
    this.ultimoAtaque = agora
    this.escalaExtra.x = 1
    this.escalaExtra.y = 1
    if (tipo === 'pisao') {
      // Todo mundo do grupo dentro da área leva o golpe
      for (const membro of this.cena.membrosDePe) {
        if (circuloTocaRetangulo({ x: this.x, y: this.y, raio: ficha.raio }, membro.retangulo())) this.cena.inimigoAcerta(this, membro, ficha.dano, ficha.empurrao)
      }
      particulas(this.cena, this.x, this.y, 0x8a6a3a, 22, 320)
      tremerTela(this.cena, 160, 0.006)
      this.deformar(1.3, 0.7, 60, 200)
      this.estado = 'perseguindo'
      return
    }
    if (tipo === 'investida') {
      this.estado = 'atacando'
      this.fimDaInvestida = agora + ficha.msDaInvestida
      this.atingidos = new Set()
      this.andar(velocidadeDoMovimento(Math.cos(this.direcao), Math.sin(this.direcao), ficha.comprimento / (ficha.msDaInvestida / 1000)))
      return
    }
    // Espinhos: um leque de tiros na direção marcada
    for (let i = 0; i < ficha.quantos; i++) {
      const angulo = this.direcao + (i - (ficha.quantos - 1) / 2) * (ficha.abertura / Math.max(1, ficha.quantos - 1))
      this.cena.adicionarProjetil(new TiroInimigo(this.cena, { x: this.x, y: this.y, tamanho: this.tamanho, config: ficha }, angulo))
    }
    this.deformar(0.85, 1.15, 50, 180)
    this.estado = 'perseguindo'
  }

  // Durante a investida, acerta quem encostar (uma vez cada)
  continuarAtaque(agora) {
    const ficha = this.config.investida
    for (const membro of this.cena.membrosDePe) {
      if (this.atingidos.has(membro)) continue
      if (circuloTocaRetangulo({ x: this.x, y: this.y, raio: this.tamanho / 2 + 10 }, membro.retangulo())) {
        this.atingidos.add(membro)
        this.cena.inimigoAcerta(this, membro, ficha.dano, ficha.empurrao)
      }
    }
    if (agora >= this.fimDaInvestida) {
      this.parar()
      this.estado = 'perseguindo'
    }
  }

  desistir(agora) {
    this.apagarAviso()
    super.desistir(agora)
  }

  atualizarDesenho(agora, delta) {
    if (this.estado === 'avisando') this.quadrado.setFillStyle(Math.floor(agora / 100) % 2 ? 0xffd0c0 : this.cor)
    else if (!this.fimDoPiscar) this.quadrado.setFillStyle(this.cor)
    super.atualizarDesenho(agora, delta)
  }

  morrer() {
    this.apagarAviso()
    particulas(this.cena, this.x, this.y, 0x4f8f3a, 30, 380)
    super.morrer()
  }
}
