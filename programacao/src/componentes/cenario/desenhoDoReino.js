// As animações do Reino (21/10/2026, com as peças do Pablo), em dois canvas do tamanho do fundo dele: o de trás (por
// baixo das peças: as nuvens, só no céu, os brilhos na água do lago e da fonte e a fumaça das chaminés das casas do
// fundo) e o da frente (por cima das peças: a luz da lanterna do estandarte e a fumaça da chaminé da Forja). As pás do
// moinho giram pelo CSS (index.css). Bandeiras e árvores ficam paradas (o Pablo anima depois).
// As contas são de regras/cenario.js; as velocidades, de dados/animacoesDoCenario.js; as posições, de dados/posicoes.js.
// Parado (animações desligadas): só as nuvens, no lugar delas (são peças, não somem).
import { urlDaArte } from '../../arte/indice.js'
import { camadasDoReino } from '../../dados/arte.js'
import { animacoesDoCenario as A } from '../../dados/animacoesDoCenario.js'
import { posicoes } from '../../dados/posicoes.js'
import { brilhoDaLanterna, brilhoNaAgua, particulaDeFumaca, posicaoDaNuvem, sorteioFixo } from '../../regras/cenario.js'

const { largura: L, altura: H } = posicoes.reino.imagem
const anim = posicoes.reino.animacoes

const { nuvens } = anim
export const imagensDoReino = {
  fundo: urlDaArte(camadasDoReino.fundo),
  ...Object.fromEntries(nuvens.lista.map((_, i) => [`nuvem${i}`, urlDaArte(camadasDoReino.nuvem(i))])),
}
export const imagensDaFrenteDoReino = {}

// Água no fundo do Pablo: o azul do lago e da fonte (o céu fica fora das áreas). Céu: o azul do alto, mais claro
// para baixo (as montanhas são de outro azul, e a neve e as copas param a procura)
const eAgua = (r, g, b) => b > 150 && b > r + 70 && b > g + 15
const eCeu = (r, g, b) => b >= 235 && g >= 150 && g - r >= 140 && r <= 70

// Onde as nuvens aparecem: em cada coluna do fundo, de cima para baixo, até o primeiro pixel que não é céu
function mascaraDoCeu(fundo) {
  const tela = document.createElement('canvas')
  tela.width = L
  tela.height = nuvens.ceu
  if (!fundo) return tela
  const contexto = tela.getContext('2d', { willReadFrequently: true })
  contexto.drawImage(fundo, 0, 0, L, H)
  const dados = contexto.getImageData(0, 0, L, nuvens.ceu)
  const p = dados.data
  for (let x = 0; x < L; x++) {
    let ceu = true
    for (let y = 0; y < nuvens.ceu; y++) {
      const i = (y * L + x) * 4
      ceu = ceu && eCeu(p[i], p[i + 1], p[i + 2])
      p[i + 3] = ceu ? 255 : 0
    }
  }
  contexto.putImageData(dados, 0, 0)
  return tela
}

// Os pontos de brilho na água: sorteados (sempre os mesmos) entre os pixels de água de cada área
function pontosNaAgua(fundo) {
  if (!fundo) return []
  const tela = document.createElement('canvas')
  tela.width = L
  tela.height = H
  const contexto = tela.getContext('2d', { willReadFrequently: true })
  contexto.drawImage(fundo, 0, 0, L, H)
  return anim.agua.flatMap((area, a) => {
    const pixels = contexto.getImageData(area.x, area.y, area.largura, area.altura).data
    const dentro = []
    for (let i = 0; i < pixels.length; i += 4 * 3) if (eAgua(pixels[i], pixels[i + 1], pixels[i + 2])) dentro.push(i / 4)
    if (dentro.length === 0) return []
    return Array.from({ length: area.quantos }, (_, k) => {
      const indice = dentro[Math.floor(sorteioFixo(a * 100 + k + 31) * dentro.length)]
      return { x: area.x + (indice % area.largura), y: area.y + Math.floor(indice / area.largura) }
    })
  })
}

export function prepararReino(imagens) {
  const ceu = document.createElement('canvas')
  ceu.width = L
  ceu.height = nuvens.ceu
  return { imagens, pontos: pontosNaAgua(imagens.fundo), mascaraDoCeu: mascaraDoCeu(imagens.fundo), ceu }
}
export const prepararReinoFrente = () => ({})

function fumaca(contexto, t, chamine, parametros, cor) {
  for (let i = 0; i < parametros.quantas; i++) {
    const bolinha = particulaDeFumaca(t, i, parametros)
    if (bolinha.alfa <= 0) continue
    contexto.fillStyle = `rgba(${cor}, ${bolinha.alfa})`
    contexto.beginPath()
    contexto.arc(chamine.x + bolinha.dx, chamine.y + bolinha.dy, bolinha.raio, 0, Math.PI * 2)
    contexto.fill()
  }
}

// As nuvens numa tela à parte, recortadas pelo céu (passam atrás das montanhas e da copa do canto)
function desenharNuvens(contexto, t, { imagens, mascaraDoCeu, ceu }, ligada) {
  const c = ceu.getContext('2d')
  c.globalCompositeOperation = 'source-over'
  c.clearRect(0, 0, L, nuvens.ceu)
  nuvens.lista.forEach((nuvem, i) => {
    const imagem = imagens[`nuvem${i}`]
    if (!imagem) return
    const x = ligada ? posicaoDaNuvem(nuvem, t, A.nuvens.velocidade, nuvens.voltaEm, L) : nuvem.x
    c.drawImage(imagem, x, nuvem.y, nuvem.largura, nuvem.altura)
  })
  c.globalCompositeOperation = 'destination-in'
  c.drawImage(mascaraDoCeu, 0, 0)
  contexto.drawImage(ceu, 0, 0)
}

export function desenharReinoAtras(contexto, t, recursos, ligada) {
  contexto.clearRect(0, 0, L, H)
  desenharNuvens(contexto, t, recursos, ligada)
  if (!ligada) return
  const { pontos } = recursos
  // Os brilhos na água do lago e da fonte
  contexto.globalCompositeOperation = 'lighter'
  pontos.forEach((ponto, i) => {
    const alfa = brilhoNaAgua(t, i, A.agua)
    if (alfa <= 0) return
    contexto.fillStyle = `rgba(255, 255, 255, ${alfa})`
    contexto.fillRect(ponto.x - 1, ponto.y, A.agua.comprimento, 1)
  })
  contexto.globalCompositeOperation = 'source-over'
  // A fumaça das chaminés das casas do fundo
  anim.chamines.filter((chamine) => !chamine.frente).forEach((chamine) => fumaca(contexto, t, chamine, A.fumaca, '235, 235, 240'))
}

export function desenharReinoFrente(contexto, t, _recursos, ligada) {
  contexto.clearRect(0, 0, L, H)
  if (!ligada) return
  // A luz da lanterna do estandarte, tremulando de leve
  const { lanterna } = anim
  const luz = contexto.createRadialGradient(lanterna.x, lanterna.y, 0, lanterna.x, lanterna.y, lanterna.raio)
  const forca = brilhoDaLanterna(t, A.lanterna)
  luz.addColorStop(0, `rgba(${A.lanterna.cor}, ${forca})`)
  luz.addColorStop(1, `rgba(${A.lanterna.cor}, 0)`)
  contexto.globalCompositeOperation = 'lighter'
  contexto.fillStyle = luz
  contexto.fillRect(lanterna.x - lanterna.raio, lanterna.y - lanterna.raio, lanterna.raio * 2, lanterna.raio * 2)
  contexto.globalCompositeOperation = 'source-over'
  // A fumaça da chaminé da Forja
  anim.chamines.filter((chamine) => chamine.frente).forEach((chamine) => fumaca(contexto, t, chamine, A.fumaca, '225, 225, 230'))
}
