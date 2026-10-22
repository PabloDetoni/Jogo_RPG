// As animações do Mapa (21/10/2026, com as peças do Pablo), num canvas do tamanho do oceano dele, por cima das peças:
// a fumaça do vulcão (a peça 12, subindo devagar), a lava pulsando, a água das cachoeiras descendo, a neve caindo na
// Tundra e o vento passando pelas copas da Floresta. A lava e a água das cachoeiras são os pixels da própria peça
// (pela cor), sem imagem a mais. As ondas do oceano são CSS (a camada do oceano vai e volta um pouco).
// Parado (animações desligadas): só a fumaça, no lugar dela (é uma peça, não some).
import { urlDaArte } from '../../arte/indice.js'
import { animacoesDoCenario as A } from '../../dados/animacoesDoCenario.js'
import { posicoes } from '../../dados/posicoes.js'
import { faixaDeVento, flocoDeNeve, fumacaQueSobe, pulsoDaLava } from '../../regras/cenario.js'

const { largura: L, altura: H } = posicoes.mapa.imagem
const anim = posicoes.mapa.animacoes
const { tundra, floresta, vulcanico } = posicoes.mapa.biomas
const pecasDasCachoeiras = { lago: posicoes.mapa.planalto.lago, floresta }
// A ponta de baixo da fumaça (de onde ela cresce): na peça 12, a 13,5% da largura, embaixo
const ponta = { x: anim.fumaca.x + anim.fumaca.largura * 0.135, y: anim.fumaca.y + anim.fumaca.altura }

export const imagensDoMapa = {
  fumaca: urlDaArte(anim.fumaca.peca),
  vulcanico: urlDaArte(vulcanico.peca),
  tundra: urlDaArte(tundra.peca),
  floresta: urlDaArte(floresta.peca),
  lago: urlDaArte(posicoes.mapa.planalto.lago.peca),
}

// A lava (do laranja da beira ao amarelo do meio) e a água que cai (o azul claro e a espuma branca)
const eLava = (r, g, b) => r > 200 && b < 150 && r - b > 90
const eAguaClara = (r, g, b) => (b > 200 && g > 140 && r < 235) || (r > 200 && g > 220 && b > 220)

const telaDoTamanho = (r) => {
  const tela = document.createElement('canvas')
  tela.width = Math.max(1, Math.round(r.largura))
  tela.height = Math.max(1, Math.round(r.altura))
  return tela
}

// Uma parte da peça (no tamanho da tela) só com os pixels que seguem a regra; o resto fica transparente
function soOsPixels(imagem, peca, area, regra) {
  if (!imagem) return null
  const tela = telaDoTamanho(area)
  const c = tela.getContext('2d', { willReadFrequently: true })
  c.drawImage(imagem, peca.x - area.x, peca.y - area.y, peca.largura, peca.altura)
  const dados = c.getImageData(0, 0, tela.width, tela.height)
  const p = dados.data
  for (let i = 0; i < p.length; i += 4) if (p[i + 3] < 200 || !regra(p[i], p[i + 1], p[i + 2])) p[i + 3] = 0
  c.putImageData(dados, 0, 0)
  return tela
}

export function prepararMapa(imagens) {
  return {
    imagens,
    lava: soOsPixels(imagens.vulcanico, vulcanico, vulcanico, eLava),
    cachoeiras: anim.cachoeiras.map((area) => ({ area, mascara: soOsPixels(imagens[area.peca], pecasDasCachoeiras[area.peca], area, eAguaClara), tela: telaDoTamanho(area) })),
    neve: telaDoTamanho(tundra),
    vento: telaDoTamanho(floresta),
  }
}

// Desenha numa tela à parte e recorta pelo formato (a neve só na Tundra, a água só nos pixels de água...)
function recortadoPela(tela, forma, desenho) {
  const c = tela.getContext('2d')
  c.globalCompositeOperation = 'source-over'
  c.clearRect(0, 0, tela.width, tela.height)
  desenho(c)
  c.globalCompositeOperation = 'destination-in'
  c.drawImage(forma, 0, 0, tela.width, tela.height)
  return tela
}

// A fumaça do vulcão: as cópias sobem, crescem um pouco a partir da ponta e somem; nada desce abaixo da cratera
function fumacaDoVulcao(contexto, imagem, t, ligada) {
  if (!imagem) return
  const f = anim.fumaca
  const copias = ligada ? Array.from({ length: A.fumacaDoVulcao.copias }, (_, i) => fumacaQueSobe(t, i, A.fumacaDoVulcao)) : [{ dy: 0, escala: 1, alfa: 1 }]
  contexto.save()
  contexto.beginPath()
  contexto.rect(0, 0, L, f.cratera)
  contexto.clip()
  for (const copia of copias) {
    if (copia.alfa <= 0) continue
    contexto.globalAlpha = copia.alfa
    // sobe dy e cresce em volta da ponta (já subida)
    contexto.setTransform(copia.escala, 0, 0, copia.escala, ponta.x * (1 - copia.escala), copia.dy + ponta.y * (1 - copia.escala))
    contexto.drawImage(imagem, f.x, f.y, f.largura, f.altura)
  }
  contexto.restore()
}

export function desenharMapa(contexto, t, { imagens, lava, cachoeiras, neve, vento }, ligada) {
  contexto.clearRect(0, 0, L, H)
  fumacaDoVulcao(contexto, imagens.fumaca, t, ligada)
  if (!ligada) return
  // A lava clareia e escurece devagar
  if (lava) {
    contexto.globalCompositeOperation = 'lighter'
    contexto.globalAlpha = pulsoDaLava(t, A.lava)
    contexto.drawImage(lava, vulcanico.x, vulcanico.y)
    contexto.globalAlpha = 1
    contexto.globalCompositeOperation = 'source-over'
  }
  // A água das cachoeiras descendo: faixas claras que correm para baixo, só nos pixels de água
  for (const { area, mascara, tela } of cachoeiras) {
    if (!mascara) continue
    recortadoPela(tela, mascara, (c) => {
      c.fillStyle = 'rgba(255, 255, 255, 0.9)'
      const { espaco } = A.cachoeiras
      const desce = (t * A.cachoeiras.velocidade) % espaco
      for (let y = -espaco + desce; y < tela.height; y += espaco) c.fillRect(0, Math.round(y), tela.width, 2)
    })
    contexto.globalAlpha = A.cachoeiras.alfa
    contexto.drawImage(tela, area.x, area.y)
    contexto.globalAlpha = 1
  }
  // A neve caindo na Tundra
  if (imagens.tundra) {
    recortadoPela(neve, imagens.tundra, (c) => {
      c.fillStyle = 'rgba(255, 255, 255, 0.85)'
      const area = { x: 0, y: 0, largura: neve.width, altura: neve.height }
      for (let i = 0; i < A.neve.quantos; i++) {
        const floco = flocoDeNeve(t, i, area, A.neve)
        c.fillRect(Math.round(floco.x), Math.round(floco.y), i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1)
      }
    })
    contexto.drawImage(neve, tundra.x, tundra.y)
  }
  // O vento passando pelas copas da Floresta: uma faixa de luz bem fraca, da esquerda para a direita
  if (imagens.floresta) {
    const area = { x: 0, y: 0, largura: vento.width, altura: vento.height }
    const meio = faixaDeVento(t, A.vento, area)
    recortadoPela(vento, imagens.floresta, (c) => {
      const faixa = c.createLinearGradient(meio - A.vento.largura / 2, 0, meio + A.vento.largura / 2, 0)
      faixa.addColorStop(0, 'rgba(255, 255, 210, 0)')
      faixa.addColorStop(0.5, 'rgba(255, 255, 210, 1)')
      faixa.addColorStop(1, 'rgba(255, 255, 210, 0)')
      c.fillStyle = faixa
      c.fillRect(0, 0, vento.width, vento.height)
    })
    contexto.globalCompositeOperation = 'lighter'
    contexto.globalAlpha = A.vento.alfa
    contexto.drawImage(vento, floresta.x, floresta.y)
    contexto.globalAlpha = 1
    contexto.globalCompositeOperation = 'source-over'
  }
}
