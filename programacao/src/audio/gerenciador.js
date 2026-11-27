import { partituras } from '../dados/musicas.js'
import { audio, efeitos, efeitosDasOperacoes, efeitosDosMinijogos, instrumentos, musicas } from '../dados/sons.js'
import { duracaoDaMusica, eventosDaMusica } from '../regras/partitura.js'
import { arquivoDoSom, efeitoDaOperacao, msDaTroca, podeTocarDeNovo, volumesDasPreferencias } from '../regras/som.js'
import { arquivosDeSom } from './arquivos.js'
import { criarSintetizador, criarTocador } from './sintetizador.js'

// GERENCIADOR DE ÁUDIO (Fase 4, TASK-105; Parte 13): o único lugar que toca som. Música por tela (tocarMusica),
// efeitos dos acontecimentos do jogo (tocarEfeito) e os volumes das Configurações e do mudo (aplicarPreferencias).
// Sem arquivo em src/assets/audio/, a música e os efeitos são feitos na hora (audio/sintetizador.js, pelas partituras
// de dados/musicas.js e as receitas de dados/sons.js); com arquivo, toca o arquivo.
// Os navegadores só deixam tocar depois que a pessoa clica ou aperta uma tecla: até lá, nada toca (nem existe o áudio),
// e a música pedida começa no primeiro clique. Com a aba escondida, o áudio para. Fora do navegador (nos testes), nada
// aqui faz nada.

let contexto = null
let ganhoDaMusica = null
let ganhoDosEfeitos = null
let analisador = null
let sintetizador = null
let tocador = null
let volumes = { musica: 1, efeitos: 1 }
let musicaPedida = null
let musicaTocando = null // { id, parar(ms) }
const decodificados = new Map() // url → AudioBuffer (ou a promessa de decodificar)
const partiturasProntas = new Map() // id → { eventos, duracao }
const ultimos = {}
const contagem = { efeitos: {}, musicas: {} } // para os roteiros (npm run dev): o que já tocou

const haAudio = () => typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext)

function destravar() {
  if (contexto || !haAudio()) return
  const Contexto = window.AudioContext || window.webkitAudioContext
  contexto = new Contexto()
  // música e efeitos passam por um compressor (nada estoura quando muita coisa toca junto) e pelo medidor dos roteiros
  const compressor = contexto.createDynamicsCompressor()
  compressor.threshold.value = -14
  compressor.ratio.value = 4
  analisador = contexto.createAnalyser()
  analisador.fftSize = 2048
  compressor.connect(analisador).connect(contexto.destination)
  ganhoDaMusica = contexto.createGain()
  ganhoDosEfeitos = contexto.createGain()
  ganhoDaMusica.connect(compressor)
  ganhoDosEfeitos.connect(compressor)
  aplicarVolumes(true)
  sintetizador = criarSintetizador(contexto, instrumentos)
  tocador = criarTocador(contexto, sintetizador, audio)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) contexto.suspend().catch(() => {})
    else contexto.resume().catch(() => {})
  })
  if (musicaPedida) tocarMusica(musicaPedida)
}

// Chamado uma vez ao abrir o jogo: espera o primeiro clique ou tecla e toca o clique dos botões (menos nos que têm o som
// próprio, data-som="proprio": os canteiros, a pedra e a boia dos minijogos)
export function prepararAudio() {
  if (!haAudio() || prepararAudio.feito) return
  prepararAudio.feito = true
  window.addEventListener('pointerdown', destravar, { capture: true })
  window.addEventListener('keydown', destravar, { capture: true })
  window.addEventListener(
    'click',
    (evento) => {
      const botao = evento.target instanceof Element ? evento.target.closest('button') : null
      if (botao && botao.dataset.som !== 'proprio') tocarEfeito('clique')
    },
    { capture: true },
  )
  if (import.meta.env.DEV) window.__somDoJogo = { situacao: situacaoDoSom, tocarEfeito }
}

function aplicarVolumes(agora = false) {
  if (!contexto) return
  const tempo = agora ? 0.001 : 0.05
  ganhoDaMusica.gain.setTargetAtTime(audio.volumeDaMusica * volumes.musica, contexto.currentTime, tempo)
  ganhoDosEfeitos.gain.setTargetAtTime(audio.volumeDosEfeitos * volumes.efeitos, contexto.currentTime, tempo)
}

// Música e Som das Configurações e o mudo (tecla M)
export function aplicarPreferencias(preferencias) {
  volumes = volumesDasPreferencias(preferencias)
  aplicarVolumes()
}

function partituraPronta(id) {
  if (!partiturasProntas.has(id)) partiturasProntas.set(id, { eventos: eventosDaMusica(partituras[id]), duracao: duracaoDaMusica(partituras[id]) })
  return partiturasProntas.get(id)
}

// O arquivo de música (se existir), pelo mesmo caminho de volume da música feita em código
function tocarArquivoDeMusica(url, laco, msDeEntrada) {
  const elemento = new Audio(url)
  elemento.loop = laco
  const ganho = contexto.createGain()
  ganho.gain.setValueAtTime(0, contexto.currentTime)
  ganho.gain.linearRampToValueAtTime(1, contexto.currentTime + msDeEntrada / 1000)
  contexto.createMediaElementSource(elemento).connect(ganho).connect(ganhoDaMusica)
  elemento.play().catch(() => {})
  return {
    parar(ms) {
      ganho.gain.cancelScheduledValues(contexto.currentTime)
      ganho.gain.setValueAtTime(ganho.gain.value, contexto.currentTime)
      ganho.gain.linearRampToValueAtTime(0, contexto.currentTime + ms / 1000)
      setTimeout(() => {
        elemento.pause()
        ganho.disconnect()
      }, ms + 100)
    },
  }
}

// A música de um momento (dados/sons.js, musicas; qual em cada tela: regras/som.js, musicaDaTela). A mesma que já toca
// continua (a fanfarra que acabou não recomeça); a troca dentro da partida (Floresta ↔ combate ↔ chefe) é devagar.
export function tocarMusica(id) {
  musicaPedida = id
  if (!contexto || !musicas[id] || musicaTocando?.id === id) return
  const troca = msDaTroca(musicaTocando?.id, id, audio)
  musicaTocando?.parar(troca)
  const { arquivo, laco } = musicas[id]
  const url = arquivoDoSom(arquivo, arquivosDeSom)
  let tocando
  if (url) tocando = tocarArquivoDeMusica(url, laco, troca)
  else {
    const { eventos, duracao } = partituraPronta(id)
    tocando = tocador.tocar(eventos, duracao, laco, ganhoDaMusica, troca)
  }
  musicaTocando = { id, parar: tocando.parar }
  contagem.musicas[id] = (contagem.musicas[id] ?? 0) + 1
}

async function tocarArquivo(url) {
  if (!decodificados.has(url)) {
    decodificados.set(
      url,
      fetch(url)
        .then((resposta) => resposta.arrayBuffer())
        .then((dados) => contexto.decodeAudioData(dados)),
    )
  }
  const buffer = await decodificados.get(url)
  const fonte = contexto.createBufferSource()
  fonte.buffer = buffer
  fonte.connect(ganhoDosEfeitos)
  fonte.start()
}

// Carregamento da partida (ajustes de 14/10): decodifica antes os efeitos que têm arquivo, avisando o andamento (de 0 a
// 1). Sem arquivos (ou sem som no navegador), termina na hora. Nunca falha: o efeito que não carregar é feito em código.
export async function prepararSonsDaPartida(aoAndar = () => {}) {
  const urls = [...new Set(Object.values(efeitos).map((efeito) => arquivoDoSom(efeito.arquivo, arquivosDeSom)).filter(Boolean))]
  if (!contexto || urls.length === 0) {
    aoAndar(1)
    return
  }
  let prontos = 0
  await Promise.all(
    urls.map((url) => {
      if (!decodificados.has(url)) {
        decodificados.set(
          url,
          fetch(url)
            .then((resposta) => resposta.arrayBuffer())
            .then((dados) => contexto.decodeAudioData(dados)),
        )
      }
      return decodificados
        .get(url)
        .catch(() => null)
        .then(() => aoAndar(++prontos / urls.length))
    }),
  )
}

// Um efeito (dados/sons.js, efeitos): o arquivo, se existir; senão, o feito em código. O mesmo efeito não repete em
// menos de msEntreIguais (um golpe em área acerta vários de uma vez).
export function tocarEfeito(id) {
  const efeito = efeitos[id]
  if (!contexto || !efeito || volumes.efeitos === 0) return
  const agora = performance.now()
  if (!podeTocarDeNovo(ultimos, id, agora, audio.msEntreIguais)) return
  ultimos[id] = agora
  contagem.efeitos[id] = (contagem.efeitos[id] ?? 0) + 1
  const url = arquivoDoSom(efeito.arquivo, arquivosDeSom)
  const emCodigo = () => sintetizador.efeito(efeito.receita, ganhoDosEfeitos)
  if (url) tocarArquivo(url).catch(emCodigo)
  else emCodigo()
}

// O efeito de uma ação do Reino que deu certo (comprar e vender: a moeda) e o de cada jogada dos minijogos
export const tocarEfeitoDaOperacao = (operacao) => tocarEfeito(efeitoDaOperacao(operacao, efeitosDasOperacoes))
export const tocarEfeitoDoMinijogo = (jogo) => tocarEfeito(efeitosDosMinijogos[jogo])

// Para os roteiros (npm run dev, window.__somDoJogo): se o áudio já existe, o que toca e o nível do som que sai agora
function situacaoDoSom() {
  let nivel = 0
  if (analisador) {
    const amostras = new Float32Array(analisador.fftSize)
    analisador.getFloatTimeDomainData(amostras)
    for (const amostra of amostras) nivel = Math.max(nivel, Math.abs(amostra))
  }
  return {
    destravado: Boolean(contexto),
    estado: contexto?.state ?? null,
    musica: musicaTocando?.id ?? null,
    pedida: musicaPedida,
    volumes: { ...volumes },
    ganhoDaMusica: ganhoDaMusica?.gain.value ?? null,
    efeitos: { ...contagem.efeitos },
    musicas: { ...contagem.musicas },
    notas: tocador?.notasTocadas() ?? 0,
    nivel,
  }
}
