// As animações do Mapa (20/10/2026), num canvas do tamanho da imagem original por cima das peças: a lava pulsando, a
// água das cachoeiras correndo, a neve caindo na Tundra, a fumaça do vulcão e o vento passando pelas copas da Floresta.
// As ondas do oceano são CSS (a camada do oceano vai e volta um pouco). Parado: nada (a imagem já é o quadro parado).
import { urlDaArte } from '../../arte/indice.js'
import { camadasDoMapa } from '../../dados/arte.js'
import { animacoesDoCenario as A } from '../../dados/animacoesDoCenario.js'
import { posicoes } from '../../dados/posicoes.js'
import { faixaDeVento, flocoDeNeve, particulaDeFumaca, pulsoDaLava } from '../../regras/cenario.js'

const { largura: L, altura: H } = posicoes.mapa.imagem
const anim = posicoes.mapa.animacoes
const { tundra, floresta } = posicoes.mapa.biomas

export const imagensDoMapa = {
  lava: urlDaArte(camadasDoMapa.lava),
  tundra: urlDaArte(tundra.peca),
  floresta: urlDaArte(floresta.peca),
  ...Object.fromEntries(anim.cachoeiras.map((_, i) => [`cachoeira${i}`, urlDaArte(camadasDoMapa.cachoeira(i))])),
}

const telaDoTamanho = (r) => {
  const tela = document.createElement('canvas')
  tela.width = r.largura
  tela.height = r.altura
  return tela
}

export function prepararMapa(imagens) {
  return { imagens, neve: telaDoTamanho(tundra), vento: telaDoTamanho(floresta), agua: anim.cachoeiras.map(telaDoTamanho) }
}

// Desenha numa tela à parte e recorta pelo formato da peça (a neve só na Tundra, o vento só na Floresta)
function recortadoPela(tela, peca, desenho) {
  const c = tela.getContext('2d')
  c.globalCompositeOperation = 'source-over'
  c.clearRect(0, 0, tela.width, tela.height)
  desenho(c)
  c.globalCompositeOperation = 'destination-in'
  c.drawImage(peca, 0, 0, tela.width, tela.height)
  return tela
}

export function desenharMapa(contexto, t, { imagens, neve, vento, agua }, ligada) {
  contexto.clearRect(0, 0, L, H)
  if (!ligada) return
  // A lava clareia e escurece devagar
  if (imagens.lava) {
    contexto.globalCompositeOperation = 'lighter'
    contexto.globalAlpha = pulsoDaLava(t, A.lava)
    contexto.drawImage(imagens.lava, anim.lava.x, anim.lava.y)
    contexto.globalAlpha = 1
  }
  // A água das cachoeiras descendo: faixas claras que correm para baixo, só onde há água
  anim.cachoeiras.forEach((r, i) => {
    const sprite = imagens[`cachoeira${i}`]
    if (!sprite) return
    recortadoPela(agua[i], sprite, (c) => {
      c.fillStyle = 'rgba(255, 255, 255, 0.9)'
      const { espaco } = A.cachoeiras
      const desce = (t * A.cachoeiras.velocidade) % espaco
      for (let y = -espaco + desce; y < r.altura; y += espaco) c.fillRect(0, Math.round(y), r.largura, 2)
    })
    contexto.globalAlpha = A.cachoeiras.alfa
    contexto.drawImage(agua[i], r.x, r.y)
    contexto.globalAlpha = 1
  })
  contexto.globalCompositeOperation = 'source-over'
  // A neve caindo na Tundra
  if (imagens.tundra) {
    recortadoPela(neve, imagens.tundra, (c) => {
      c.fillStyle = 'rgba(255, 255, 255, 0.85)'
      const area = { x: 0, y: 0, largura: tundra.largura, altura: tundra.altura }
      for (let i = 0; i < A.neve.quantos; i++) {
        const floco = flocoDeNeve(t, i, area, A.neve)
        c.fillRect(Math.round(floco.x), Math.round(floco.y), i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1)
      }
    })
    contexto.drawImage(neve, tundra.x, tundra.y)
  }
  // O vento passando pelas copas da Floresta: uma faixa de luz bem fraca, da esquerda para a direita
  if (imagens.floresta) {
    const area = { x: 0, y: 0, largura: floresta.largura, altura: floresta.altura }
    const meio = faixaDeVento(t, A.vento, area)
    recortadoPela(vento, imagens.floresta, (c) => {
      const faixa = c.createLinearGradient(meio - A.vento.largura / 2, 0, meio + A.vento.largura / 2, 0)
      faixa.addColorStop(0, 'rgba(255, 255, 210, 0)')
      faixa.addColorStop(0.5, 'rgba(255, 255, 210, 1)')
      faixa.addColorStop(1, 'rgba(255, 255, 210, 0)')
      c.fillStyle = faixa
      c.fillRect(0, 0, floresta.largura, floresta.altura)
    })
    contexto.globalCompositeOperation = 'lighter'
    contexto.globalAlpha = A.vento.alfa
    contexto.drawImage(vento, floresta.x, floresta.y)
    contexto.globalAlpha = 1
    contexto.globalCompositeOperation = 'source-over'
  }
  // A fumaça saindo do vulcão
  const f = A.fumacaDoVulcao
  for (let i = 0; i < f.quantas; i++) {
    const bolinha = particulaDeFumaca(t, i, f)
    if (bolinha.alfa <= 0) continue
    contexto.fillStyle = `rgba(110, 104, 110, ${bolinha.alfa})`
    contexto.beginPath()
    contexto.arc(anim.cratera.x + bolinha.dx, anim.cratera.y + bolinha.dy, bolinha.raio, 0, Math.PI * 2)
    contexto.fill()
  }
}
