import { urlDaArte } from '../../arte/indice.js'
import { camadasDoMapa, camadasDoReino } from '../../dados/arte.js'
import { posicoes } from '../../dados/posicoes.js'

// As imagens do Reino e do Mapa (as peças do Pablo, sem perda: uns 14 MB e 10 MB) carregam antes de a tela abrir:
// as do Reino enquanto o jogador está nas outras telas (a de entrada, o login...); as do Mapa a partir do Reino.
// Ficam guardadas aqui para o navegador não jogar fora; cada uma é pedida uma vez só. Na partida, nada (o jogo pesa).
const { reino, mapa } = posicoes
const doReino = [camadasDoReino.fundo, ...Object.keys(reino.pecas).map(camadasDoReino.peca), ...reino.animacoes.nuvens.lista.map((_, i) => camadasDoReino.nuvem(i))]
const doMapa = [
  camadasDoMapa.oceano,
  ...[mapa.biomas, mapa.enfeites, mapa.planalto].flatMap((grupo) => Object.values(grupo).map((lugar) => lugar.peca)),
  mapa.animacoes.fumaca.peca,
]
const guardadas = new Map()

function pedir(nomes) {
  for (const url of nomes.map(urlDaArte)) {
    if (!url || guardadas.has(url)) continue
    const imagem = new Image()
    imagem.decoding = 'async'
    imagem.src = url
    guardadas.set(url, imagem)
  }
}

export function preCarregarCenario(tela) {
  if (tela === 'partida') return
  const nomes = tela === 'reino' ? doMapa : doReino
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => pedir(nomes), { timeout: 3000 })
  else window.setTimeout(() => pedir(nomes), 500)
}
