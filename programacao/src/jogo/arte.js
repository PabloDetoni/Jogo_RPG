import * as Phaser from 'phaser'
import { arquivosDeArte } from '../arte/indice.js'
import { animacoes, bonecos } from '../dados/arte.js'
import { chaveDaArte, escolherAnimacao, idDaArte, quadrosDaFaixa, temArteDoBoneco } from '../regras/arte.js'

// A arte na partida (TASK-110 a TASK-116). Carrega as imagens achadas em src/assets/arte/ (arte/indice.js), corta as
// faixas em quadros e cria as animações. Sem imagem, nada muda: cada entidade continua o quadrado de hoje.
// Só desenho: a hitbox continua a zona de física invisível (jogo/entidades/Entidade.js).

// As imagens das telas (React) não entram na partida
const soDasTelas = ['fundo', 'retrato', 'derrota', 'atributo', 'habilidade', 'ouro']

export const texturaDaArte = (chave) => `arte:${chave}`

// preload: pede ao Phaser todas as imagens da partida que existem
export function carregarArte(cena) {
  for (const [chave, url] of Object.entries(arquivosDeArte)) {
    if (soDasTelas.some((prefixo) => chave.startsWith(prefixo))) continue
    if (!cena.textures.exists(texturaDaArte(chave))) cena.load.image(texturaDaArte(chave), url)
  }
}

// create: o que carregou de verdade (uma imagem estragada fica de fora, e ali continua o quadrado), sem borrar os pixels
export function prepararArte(cena) {
  const disponiveis = new Set()
  for (const chave of Object.keys(arquivosDeArte)) {
    if (!cena.textures.exists(texturaDaArte(chave))) continue
    disponiveis.add(chave)
    cena.textures.get(texturaDaArte(chave)).setFilter(Phaser.Textures.FilterMode.NEAREST)
  }
  cena.arte = { disponiveis }
  return cena.arte
}

// A textura (e o quadro) de um nome da lista, se existe: { textura, quadro, largura, altura }
export function imagemDaArte(cena, nome) {
  const chave = chaveDaArte(nome)
  if (!cena.arte?.disponiveis.has(chave)) return null
  const quadro = cena.textures.getFrame(texturaDaArte(chave))
  return { textura: texturaDaArte(chave), largura: quadro.width, altura: quadro.height }
}

// Os quadros de uma escolha (regras/arte.js, escolherAnimacao): a faixa cortada em quadrados, ou os quadros soltos
function quadrosDaEscolha(cena, chaves) {
  if (chaves.length > 1) return chaves.map((chave) => ({ key: texturaDaArte(chave) }))
  const textura = cena.textures.get(texturaDaArte(chaves[0]))
  const base = textura.get()
  const quantos = quadrosDaFaixa(base.width, base.height)
  if (quantos === 1) return [{ key: texturaDaArte(chaves[0]) }]
  const largura = base.width / quantos
  return Array.from({ length: quantos }, (_, indice) => {
    const nome = `q${indice}`
    if (!textura.has(nome)) textura.add(nome, 0, Math.round(indice * largura), 0, Math.round(largura), base.height)
    return { key: texturaDaArte(chaves[0]), frame: nome }
  })
}

// O desenho de um boneco (classe, mob ou Boss): um sprite com a animação e a direção de cada momento. A entidade diz o
// que está fazendo (mostrar) e se pisca ou está apagada (tinta); o tamanho na tela vem de dados/arte.js.
export class DesenhoDoBoneco {
  // null quando o boneco não tem nenhuma imagem (continua o quadrado)
  static criar(cena, id) {
    if (!cena.arte || !temArteDoBoneco(cena.arte.disponiveis, id)) return null
    return new DesenhoDoBoneco(cena, id)
  }

  constructor(cena, id) {
    this.cena = cena
    this.id = id
    this.tamanho = bonecos[idDaArte(id)]?.tamanhoNaTela ?? 48
    this.escolhas = new Map()
    this.atual = null
    this.preenchimento = null // piscar: a imagem inteira de uma cor
    this.escuro = null // caído sem imagem de desmaiado: mais escuro
    this.sprite = cena.add.sprite(0, 0, '__DEFAULT')
    this.mostrar('parado', 'baixo')
  }

  // A animação de verdade para (animação, direção), com a chave da animação do Phaser e o lado do quadro (para a escala)
  escolha(animacao, direcao) {
    const chave = `${animacao}:${direcao}`
    if (this.escolhas.has(chave)) return this.escolhas.get(chave)
    let resultado = null
    const escolhida = escolherAnimacao(this.cena.arte.disponiveis, this.id, animacao, direcao)
    if (escolhida) {
      const quadros = quadrosDaEscolha(this.cena, escolhida.chaves)
      const ficha = animacoes[escolhida.animacao] ?? { quadrosPorSegundo: 6, repetir: true }
      const nomeDaAnimacao = `arte:${escolhida.chaves.join('+')}`
      if (!this.cena.anims.exists(nomeDaAnimacao)) {
        this.cena.anims.create({ key: nomeDaAnimacao, frames: quadros, frameRate: ficha.quadrosPorSegundo, repeat: ficha.repetir ? -1 : 0 })
      }
      const primeiro = this.cena.textures.getFrame(quadros[0].key, quadros[0].frame)
      resultado = { animacao: escolhida.animacao, chave: nomeDaAnimacao, espelhar: escolhida.espelhar, lado: Math.max(1, primeiro.height) }
    }
    this.escolhas.set(chave, resultado)
    return resultado
  }

  // Tem esta animação de verdade (não a da reserva)?
  tem(animacao) {
    return this.escolha(animacao, 'baixo')?.animacao === animacao
  }

  // Mostra a animação na direção (sem reiniciar se já está nela). "reiniciar": começa de novo (um ataque novo).
  // Sem imagem própria: o desmaiado usa a parada, sem mexer (a entidade deita e escurece o desenho); o parado usa o
  // primeiro quadro do andando.
  mostrar(animacao, direcao, reiniciar = false) {
    let escolha = this.escolha(animacao, direcao)
    let congelar = false
    if (!escolha && animacao === 'desmaiado') {
      escolha = this.escolha('parado', direcao)
      congelar = true
    }
    if (!escolha) {
      escolha = this.escolha('andando', direcao)
      congelar = true
    }
    if (!escolha) return
    const mesma = this.atual?.chave === escolha.chave && this.atual.congelar === congelar
    this.sprite.setFlipX(escolha.espelhar)
    this.sprite.setScale(this.tamanho / escolha.lado)
    if (mesma && !reiniciar) return
    this.sprite.play(escolha.chave)
    if (congelar) this.sprite.anims.pause(this.sprite.anims.currentAnim.frames[0])
    this.atual = { chave: escolha.chave, congelar }
  }

  // Pisca de uma cor (null: volta ao normal)
  preencher(cor) {
    if (this.preenchimento === cor) return
    this.preenchimento = cor
    this.aplicarTinta()
  }

  // Mais escuro (caído sem imagem de desmaiado); null: normal
  escurecer(cor) {
    if (this.escuro === cor) return
    this.escuro = cor
    this.aplicarTinta()
  }

  aplicarTinta() {
    if (this.preenchimento !== null) this.sprite.setTint(this.preenchimento).setTintMode(Phaser.TintModes.FILL)
    else if (this.escuro !== null) this.sprite.setTint(this.escuro).setTintMode(Phaser.TintModes.MULTIPLY)
    else this.sprite.clearTint()
  }
}
