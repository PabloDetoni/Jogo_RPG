import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { msDoAtaqueNaTela } from '../../dados/arte.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { podeUsar, velocidadeDoMovimento } from '../../regras/combate.js'
import TiroInimigo from '../ataques/tiroInimigo.js'
import Inimigo from './Inimigo.js'

// Atirador (vermelho escuro): fica longe de quem persegue, entre a distância mínima e a máxima,
// e atira bolinhas lentas. Antes de cada tiro, pisca (o aviso). Serve para testar o escudo do Tanque.
// Na Floresta (Fase 3), a aranha é este mesmo mob com outra ficha (balanceamento.js, mundo.mobs).
export default class Atirador extends Inimigo {
  constructor(cena, x, y, config = combateDeTeste.atirador, cor = coresDaArena.atirador) {
    super(cena, x, y, config, cor)
    this.ultimoTiro = null
    this.usarArte(config.tipo ?? 'atirador') // na Floresta, a aranha
  }

  atualizar(agora) {
    const { config } = this
    if (this.morto || this.estaSendoEmpurrado(agora)) return

    if (this.estado === 'mirando') {
      this.parar()
      if (agora >= this.fimDoAviso) this.atirar(agora)
      return
    }

    const alvo = this.decidirAlvo(agora)
    if (!alvo) {
      this.passear(agora)
      return
    }

    const ate = this.distanciaAte(alvo)
    if (ate <= config.alcanceDoTiro && podeUsar(agora, this.ultimoTiro, config.msEntreTiros)) {
      this.estado = 'mirando'
      this.fimDoAviso = agora + config.msDeAviso
      return
    }

    // Mantém a distância: foge se o alvo chega perto, chega mais perto se ele está longe
    let velocidade = { x: 0, y: 0 }
    if (ate < config.distanciaMinima) velocidade = velocidadeDoMovimento(this.x - alvo.x, this.y - alvo.y, config.velocidade)
    else if (ate > config.distanciaMaxima) velocidade = this.velocidadeAte(alvo, config.velocidade)
    this.andar(velocidade)
  }

  atirar(agora) {
    this.estado = 'perseguindo'
    this.ultimoTiro = agora
    const alvo = this.alvo
    if (!alvo || alvo.caido) return
    const angulo = Math.atan2(alvo.y - this.y, alvo.x - this.x)
    this.cena.adicionarProjetil(new TiroInimigo(this.cena, this, angulo))
    this.deformar(0.8, 0.8, 50, 150)
  }

  // Um empurrão cancela o tiro que estava mirando
  empurrar(vetor, ms) {
    super.empurrar(vetor, ms)
    if (this.estado === 'mirando') this.estado = 'perseguindo'
  }

  // Na arte: mirando (o aviso) e o tiro, olhando para o alvo
  animacaoDoMomento(agora, andando) {
    const paraOAlvo = this.alvo ? { x: this.alvo.x - this.x, y: this.alvo.y - this.y } : null
    if (this.estado === 'mirando') return { animacao: 'aviso', olharPara: paraOAlvo }
    if (this.ultimoTiro !== null && agora - this.ultimoTiro < msDoAtaqueNaTela) return { animacao: 'atacando', olharPara: paraOAlvo, desde: this.ultimoTiro }
    return super.animacaoDoMomento(agora, andando)
  }

  atualizarDesenho(agora, delta) {
    if (this.estado === 'mirando') this.destacar(Math.floor(agora / 70) % 2 ? 0xffffff : null)
    else if (!this.fimDoPiscar) this.destacar(null)
    super.atualizarDesenho(agora, delta)
  }
}
