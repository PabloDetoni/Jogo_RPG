import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { corDaClasse } from '../../dados/classes.js'
import { habilidadesNasTeclas } from '../../dados/habilidades.js'
import { camadas } from '../efeitos.js'
import Entidade, { BarraDeVida } from './Entidade.js'

const { tamanho } = combateDeTeste.personagem
const distanciaDaMira = tamanho * 0.95
const fonte = 'system-ui, "Segoe UI", sans-serif'

// Contorno colorido em volta de quem está sob um efeito (o primeiro da lista ganha)
const marcas = [
  { efeito: 'provocando', cor: 0xff4d4d },
  { efeito: 'fortalecido', cor: 0xffd700 },
  { efeito: 'fragil', cor: 0xff9ec4 },
]

// Líder ou aliado: quadrado da cor da classe, com barra de vida e de mana. Só o Líder tem o contorno branco
// grosso e a mira (o triângulo que gira para o mouse). Quem desmaia tomba, fica cinza e mostra a contagem
// dos 30 s e o anel da ajuda (TASK-044).
export default class Personagem extends Entidade {
  constructor(cena, membro, x, y) {
    super(cena, { x, y, tamanho, cor: corDaClasse(membro.classe) })
    this.contornoEscuro = cena.add.rectangle(0, 0, tamanho + 10, tamanho + 10).setStrokeStyle(2, coresDaArena.contorno)
    this.contornoDoLider = cena.add.rectangle(0, 0, tamanho - 4, tamanho - 4).setStrokeStyle(5, 0xffffff)
    this.marca = cena.add.rectangle(0, 0, tamanho + 18, tamanho + 18).setVisible(false)
    this.visual.addAt(this.contornoEscuro, 0)
    this.visual.addAt(this.marca, 0)
    this.visual.add(this.contornoDoLider)
    this.mira = cena.add.triangle(0, 0, 0, -8, 16, 0, 0, 8, 0xffffff).setStrokeStyle(2, coresDaArena.contorno)
    this.barra = new BarraDeVida(cena, tamanho + 8)
    this.barraDeMana = new BarraDeVida(cena, tamanho + 8, 0x5ab4ff, 2)
    this.anelDaAjuda = cena.add.graphics().setDepth(camadas.textos - 3)
    this.textoDoDesmaio = cena.add
      .text(x, y, '', { fontFamily: fonte, fontSize: '22px', fontStyle: 'bold', color: '#ffffff', stroke: '#1c2230', strokeThickness: 5, align: 'center' })
      .setOrigin(0.5, 1)
      .setDepth(camadas.textos - 1)
      .setVisible(false)

    this.caido = false
    this.caidoDesde = 0
    this.progressoDaAjuda = 0
    this.perdido = false
    this.anguloDaMira = 0
    this.fimDaImunidade = 0
    this.fimDaFragilidade = 0
    this.fimDoFortalecimento = 0
    this.provocandoAte = 0
    this.ultimoAtaque = null
    this.ultimoUsoDaHabilidade = [null, null, null]
    this.escudo = null // o Tanque tem um (jogo/ataques/escudo.js)
    this.ia = { voltando: false } // memória da IA quando é aliado
    this.definirMembro(membro)
  }

  // Classe, vida, mana e papel (Líder ou aliado). Trocar de classe mantém a fração da vida e da mana
  // e zera as recargas (cada classe tem as suas).
  definirMembro(membro) {
    const fracaoDaVida = this.membro ? this.vida / this.vidaMaxima : 1
    const fracaoDaMana = this.membro ? this.mana / this.manaMaxima : 1
    if (this.membro && this.membro.classe !== membro.classe) {
      this.ultimoAtaque = null
      this.ultimoUsoDaHabilidade = [null, null, null]
    }
    this.membro = membro
    this.classe = membro.classe
    this.nivel = membro.nivel ?? 1 // decide a IA quando é aliado
    this.chanceDeCritico = membro.chanceDeCritico ?? 0 // pela Agilidade (regras/combate.js)
    this.defesa = membro.defesa ?? 0 // do equipamento (Fase 4): tira uma parte do dano recebido
    this.reducaoDeRecarga = membro.reducaoDeRecarga ?? 0 // do equipamento (Fase 4): recargas mais curtas
    this.vidaMaxima = membro.vidaMaxima
    this.vida = Math.max(1, Math.round(fracaoDaVida * membro.vidaMaxima))
    this.manaMaxima = membro.manaMaxima
    this.mana = fracaoDaMana * membro.manaMaxima
    this.manaPorSegundo = membro.manaPorSegundo
    this.habilidades = habilidadesNasTeclas(membro.classe)
    this.lider = membro.lider
    // O Líder é mais pesado na separação (os aliados saem da frente dele) e é o jogador quem anda com ele
    this.peso = membro.lider ? combateDeTeste.separacao.pesoDoLider : 1
    this.andaSozinho = !membro.lider
    if (!this.caido) this.definirCor(corDaClasse(membro.classe))
    this.contornoEscuro.setVisible(this.lider)
    this.contornoDoLider.setVisible(this.lider)
    this.mira.setVisible(this.lider && !this.caido)
  }

  get provocando() {
    return this.cena.agora < this.provocandoAte
  }

  get fragil() {
    return this.cena.agora < this.fimDaFragilidade
  }

  get fortalecido() {
    return this.cena.agora < this.fimDoFortalecimento
  }

  // Caído, não se mexe na separação: os outros saem de cima dele
  get fixo() {
    return this.caido
  }

  atualizarMira(angulo) {
    this.mira.setPosition(this.x + Math.cos(angulo) * distanciaDaMira, this.y + Math.sin(angulo) * distanciaDaMira)
    this.mira.setRotation(angulo)
    this.mira.setDepth(this.y + 2)
  }

  atualizarDesenho(agora, delta) {
    super.atualizarDesenho(agora, delta)
    const topo = this.y - tamanho * 0.5
    this.barra.atualizar(this.x, topo - 16, this.vida / this.vidaMaxima)
    this.barraDeMana.atualizar(this.x, topo - 10, this.mana / this.manaMaxima)
    // Caído fica apagado; imune depois de apanhar, pisca
    const imune = agora < this.fimDaImunidade
    this.visual.setAlpha(this.caido ? 0.7 : imune && Math.floor(agora / 60) % 2 ? 0.35 : 1)
    const marca = this.caido ? null : marcas.find(({ efeito }) => this[efeito])
    this.marca.setVisible(Boolean(marca))
    if (marca) this.marca.setStrokeStyle(4, marca.cor, 0.5 + 0.5 * Math.abs(Math.sin(agora / 140)))
  }

  // Contagem dos 30 s em cima de quem caiu e o anel da ajuda enchendo (verde com a área limpa)
  mostrarDesmaio({ segundos, fracaoDaAjuda, ajudando, limpa }) {
    const linhaDeBaixo = ajudando ? (limpa ? 'levantando...' : 'inimigos perto!') : ''
    this.textoDoDesmaio
      .setVisible(true)
      .setText(linhaDeBaixo ? `${segundos}\n${linhaDeBaixo}` : String(segundos))
      .setColor(segundos <= 10 ? '#ff8f8f' : '#ffffff')
      .setFontSize(linhaDeBaixo ? 18 : 22)
      .setPosition(this.x, this.y - tamanho * 0.5 - 22)
    const anel = this.anelDaAjuda
    anel.clear()
    anel.lineStyle(5, 0x1c2230, 0.35).strokeCircle(this.x, this.y, tamanho * 0.85)
    if (fracaoDaAjuda > 0) {
      anel.lineStyle(5, 0x7dff7d, 1)
      anel.beginPath()
      anel.arc(this.x, this.y, tamanho * 0.85, -Math.PI / 2, -Math.PI / 2 + fracaoDaAjuda * Math.PI * 2, false)
      anel.strokePath()
    } else if (ajudando && !limpa) {
      anel.lineStyle(5, 0xffa040, 0.9).strokeCircle(this.x, this.y, tamanho * 0.85)
    }
  }

  // Sem vida: o quadrado tomba e fica cinza
  cair() {
    this.caido = true
    this.progressoDaAjuda = 0
    this.parar()
    this.corpo.body.setVelocity(0, 0)
    this.corpo.body.setImmovable(true)
    this.definirCor(0x777777)
    this.mira.setVisible(false)
    this.cena.tweens.add({ targets: this.visual, angle: 90, duration: 400, ease: 'Bounce.Out' })
  }

  // Levantado (pela ajuda ou pela Ressurreição): volta de pé, com a vida dada
  levantar(vida) {
    this.caido = false
    this.vida = Math.min(this.vidaMaxima, Math.max(1, vida))
    this.progressoDaAjuda = 0
    this.corpo.body.setImmovable(false)
    this.definirCor(corDaClasse(this.classe))
    this.mira.setVisible(this.lider)
    this.textoDoDesmaio.setVisible(false)
    this.anelDaAjuda.clear()
    this.travamento = null
    this.manobra = null
    this.cena.tweens.add({ targets: this.visual, angle: 0, duration: 300, ease: 'Back.Out' })
    this.deformar(1.25, 1.25, 80, 200)
  }

  destruir() {
    super.destruir()
    this.mira.destroy()
    this.barra.destruir()
    this.barraDeMana.destruir()
    this.anelDaAjuda.destroy()
    this.textoDoDesmaio.destroy()
  }
}
