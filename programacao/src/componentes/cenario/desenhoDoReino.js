// As animações do Reino (20/10/2026), desenhadas em dois canvas do tamanho da imagem original: o de trás (por baixo
// das peças: nuvens, a copa do canto, os estandartes, as pás do moinho, a lanterna, os brilhos na água e a fumaça das
// casas) e o da frente (por cima das peças: as flâmulas do castelo e a fumaça da Forja). As contas são de
// regras/cenario.js; as velocidades, de dados/animacoesDoCenario.js; as posições, de dados/posicoes.js.
// Parado (animações desligadas): só o que saiu do fundo limpo para poder andar (as nuvens e as pás), no lugar da imagem.
import { urlDaArte } from '../../arte/indice.js'
import { camadasDoReino } from '../../dados/arte.js'
import { animacoesDoCenario as A } from '../../dados/animacoesDoCenario.js'
import { posicoes } from '../../dados/posicoes.js'
import { anguloDasPas, balanco, brilhoDaLanterna, brilhoNaAgua, desvioDoPano, particulaDeFumaca, posicaoDaNuvem, sorteioFixo } from '../../regras/cenario.js'

const { largura: L, altura: H } = posicoes.reino.imagem
const anim = posicoes.reino.animacoes
const faixaDoCeu = 270 // o céu nunca desce abaixo disto (as nuvens andam aqui)

export const imagensDoReino = {
  ceu: urlDaArte(camadasDoReino.mascaraDoCeu),
  agua: urlDaArte(camadasDoReino.mascaraDaAgua),
  pas: urlDaArte(camadasDoReino.pasDoMoinho),
  copa: urlDaArte(camadasDoReino.copa),
  ...Object.fromEntries(anim.nuvens.map((_, i) => [`nuvem${i}`, urlDaArte(camadasDoReino.nuvem(i))])),
  ...Object.fromEntries(anim.estandartes.map((_, i) => [`estandarte${i}`, urlDaArte(camadasDoReino.estandarte(i))])),
  ...Object.fromEntries(anim.flamulas.map((_, i) => [`flamula${i}`, urlDaArte(camadasDoReino.flamula(i))])),
}

// Os pontos de brilho na água: sorteados (sempre os mesmos) dentro da máscara da água
function pontosNaAgua(mascara, quantos) {
  if (!mascara) return []
  const tela = document.createElement('canvas')
  tela.width = L
  tela.height = H
  const contexto = tela.getContext('2d', { willReadFrequently: true })
  contexto.drawImage(mascara, 0, 0)
  const pixels = contexto.getImageData(0, 0, L, H).data
  const dentro = []
  for (let i = 3; i < pixels.length; i += 4 * 3) if (pixels[i] > 128) dentro.push((i - 3) / 4)
  if (dentro.length === 0) return []
  return Array.from({ length: quantos }, (_, k) => {
    const indice = dentro[Math.floor(sorteioFixo(k + 31) * dentro.length)]
    return { x: indice % L, y: Math.floor(indice / L) }
  })
}

export function prepararReino(imagens) {
  const ceu = document.createElement('canvas')
  ceu.width = L
  ceu.height = faixaDoCeu
  return { imagens, ceu, pontos: pontosNaAgua(imagens.agua, A.agua.quantos) }
}

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

// Um pano preso em cima (estandarte): cada faixa de 2 px desliza para o lado; a ponta de baixo balança mais
function estandarte(contexto, imagem, r, t, fase) {
  for (let linha = 0; linha < r.altura; linha += 2) {
    const dx = desvioDoPano(linha, r.altura, t, A.estandartes, fase)
    contexto.drawImage(imagem, 0, linha, r.largura, 2, r.x + dx, r.y + linha, r.largura, 2)
  }
}

// Uma flâmula presa no mastro (à esquerda): cada coluna sobe e desce; a ponta solta balança mais
function flamula(contexto, imagem, r, t, fase) {
  for (let coluna = 0; coluna < r.largura; coluna++) {
    const dy = desvioDoPano(coluna, r.largura, t, A.flamulas, fase)
    contexto.drawImage(imagem, coluna, 0, 1, r.altura, r.x + coluna, r.y + dy, 1, r.altura)
  }
}

export function desenharReinoAtras(contexto, t, { imagens, ceu, pontos }, ligada) {
  contexto.clearRect(0, 0, L, H)
  // As nuvens, só onde é céu (passam atrás das montanhas, das árvores e do castelo)
  if (imagens.ceu) {
    const c = ceu.getContext('2d')
    c.globalCompositeOperation = 'source-over'
    c.clearRect(0, 0, L, faixaDoCeu)
    anim.nuvens.forEach((nuvem, i) => {
      const imagem = imagens[`nuvem${i}`]
      if (imagem) c.drawImage(imagem, ligada ? posicaoDaNuvem(nuvem, t, A.nuvens.velocidade, L) : nuvem.x, nuvem.y)
    })
    c.globalCompositeOperation = 'destination-in'
    c.drawImage(imagens.ceu, 0, 0)
    contexto.drawImage(ceu, 0, 0)
  }
  // A copa da árvore grande do canto: o alto vai um pouco para o lado e volta (a base fica)
  if (ligada && imagens.copa) {
    const { copa } = anim
    const s = balanco(t, A.copa.inclinacao, A.copa.periodo) / copa.ancora.y
    contexto.setTransform(1, 0, -s, 1, s * copa.ancora.y, 0)
    contexto.drawImage(imagens.copa, copa.x, copa.y)
    contexto.setTransform(1, 0, 0, 1, 0, 0)
  }
  if (ligada) anim.estandartes.forEach((r, i) => imagens[`estandarte${i}`] && estandarte(contexto, imagens[`estandarte${i}`], r, t, i * 1.3))
  // As pás do moinho (paradas no ângulo da imagem quando a animação está desligada)
  if (imagens.pas) {
    const { pasDoMoinho: p } = anim
    contexto.save()
    contexto.translate(p.eixo.x, p.eixo.y)
    contexto.rotate(ligada ? anguloDasPas(t, A.pasDoMoinho.voltasPorMinuto) : 0)
    contexto.drawImage(imagens.pas, p.x - p.eixo.x, p.y - p.eixo.y)
    contexto.restore()
  }
  if (!ligada) return
  // A luz da lanterna
  const { lanterna } = anim
  const luz = contexto.createRadialGradient(lanterna.x, lanterna.y, 0, lanterna.x, lanterna.y, lanterna.raio)
  const forca = brilhoDaLanterna(t, A.lanterna)
  luz.addColorStop(0, `rgba(${A.lanterna.cor}, ${forca})`)
  luz.addColorStop(1, `rgba(${A.lanterna.cor}, 0)`)
  contexto.globalCompositeOperation = 'lighter'
  contexto.fillStyle = luz
  contexto.fillRect(lanterna.x - lanterna.raio, lanterna.y - lanterna.raio, lanterna.raio * 2, lanterna.raio * 2)
  // Os brilhos na água do lago e da fonte
  pontos.forEach((ponto, i) => {
    const alfa = brilhoNaAgua(t, i, A.agua)
    if (alfa <= 0) return
    contexto.fillStyle = `rgba(255, 255, 255, ${alfa})`
    contexto.fillRect(ponto.x - 1, ponto.y, A.agua.comprimento, 1)
  })
  contexto.globalCompositeOperation = 'source-over'
  // A fumaça das chaminés das casas
  anim.chamines.filter((chamine) => !chamine.frente).forEach((chamine) => fumaca(contexto, t, chamine, A.fumaca, '235, 235, 240'))
}

export function desenharReinoFrente(contexto, t, { imagens }, ligada) {
  contexto.clearRect(0, 0, L, H)
  if (!ligada) return
  anim.flamulas.forEach((r, i) => imagens[`flamula${i}`] && flamula(contexto, imagens[`flamula${i}`], r, t, i * 0.9))
  anim.chamines.filter((chamine) => chamine.frente).forEach((chamine) => fumaca(contexto, t, chamine, A.fumaca, '225, 225, 230'))
}
