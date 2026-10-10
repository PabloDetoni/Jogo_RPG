import { audio, efeitos, musicas } from '../dados/sons.js'
import { arquivoDoSom, podeTocarDeNovo, volumesDasPreferencias } from '../regras/som.js'
import { arquivosDeSom } from './arquivos.js'

// GERENCIADOR DE ÁUDIO (Fase 4, TASK-105): o único lugar que toca som. Música por tela (tocarMusica), efeitos dos
// acontecimentos do jogo (tocarEfeito) e os volumes das Configurações e do mudo (aplicarPreferencias).
// Os navegadores só deixam tocar depois que a pessoa clica ou aperta uma tecla: até lá, nada toca, e a música pedida
// começa no primeiro clique. Fora do navegador (nos testes), tudo aqui não faz nada.

let contexto = null
let ganhoDosEfeitos = null
let volumes = { musica: 1, efeitos: 1 }
let musicaPedida = null
let musicaTocando = null // { id, elemento }
const decodificados = new Map() // url → AudioBuffer (ou a promessa de decodificar)
const ultimos = {}

const haAudio = () => typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext)

function destravar() {
  if (contexto || !haAudio()) return
  const Contexto = window.AudioContext || window.webkitAudioContext
  contexto = new Contexto()
  ganhoDosEfeitos = contexto.createGain()
  ganhoDosEfeitos.gain.value = audio.volumeDosEfeitos * volumes.efeitos
  ganhoDosEfeitos.connect(contexto.destination)
  if (musicaPedida) tocarMusica(musicaPedida)
}

// Chamado uma vez ao abrir o jogo: espera o primeiro clique ou tecla e toca o clique dos botões
export function prepararAudio() {
  if (!haAudio() || prepararAudio.feito) return
  prepararAudio.feito = true
  window.addEventListener('pointerdown', destravar, { capture: true })
  window.addEventListener('keydown', destravar, { capture: true })
  window.addEventListener(
    'click',
    (evento) => {
      if (evento.target instanceof Element && evento.target.closest('button')) tocarEfeito('clique')
    },
    { capture: true },
  )
}

// Música e Som das Configurações e o mudo (tecla M)
export function aplicarPreferencias(preferencias) {
  volumes = volumesDasPreferencias(preferencias)
  if (ganhoDosEfeitos) ganhoDosEfeitos.gain.value = audio.volumeDosEfeitos * volumes.efeitos
  if (musicaTocando) musicaTocando.elemento.volume = audio.volumeDaMusica * volumes.musica
}

function pararMusica() {
  if (!musicaTocando) return
  const { elemento } = musicaTocando
  musicaTocando = null
  const inicio = elemento.volume
  const passos = 10
  let passo = 0
  const relogio = setInterval(() => {
    passo++
    elemento.volume = Math.max(0, inicio * (1 - passo / passos))
    if (passo >= passos) {
      clearInterval(relogio)
      elemento.pause()
    }
  }, audio.msDaTrocaDeMusica / passos)
}

// A música de um momento (dados/sons.js, musicas). Sem arquivo, fica em silêncio (a do Boss, opcional, cai na da Floresta).
export function tocarMusica(id) {
  musicaPedida = id
  if (!contexto) return
  let url = arquivoDoSom(musicas[id], arquivosDeSom)
  let tocar = id
  if (!url && id === 'boss') {
    tocar = 'floresta'
    url = arquivoDoSom(musicas.floresta, arquivosDeSom)
  }
  if (musicaTocando?.id === tocar) return
  pararMusica()
  if (!url) return
  const elemento = new Audio(url)
  elemento.loop = tocar !== 'derrota'
  elemento.volume = audio.volumeDaMusica * volumes.musica
  elemento.play().catch(() => {}) // se o navegador ainda não deixar, tenta de novo na próxima troca
  musicaTocando = { id: tocar, elemento }
}

function tocarBipe({ hz, ms, onda }) {
  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()
  const agora = contexto.currentTime
  oscilador.type = onda
  oscilador.frequency.value = hz
  ganho.gain.setValueAtTime(audio.volumeDoBipe, agora)
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + ms / 1000)
  oscilador.connect(ganho).connect(ganhoDosEfeitos)
  oscilador.start(agora)
  oscilador.stop(agora + ms / 1000 + 0.02)
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

// Um efeito (dados/sons.js, efeitos): o arquivo, se existir; senão, o bipe provisório. O mesmo efeito não repete em
// menos de msEntreIguais (um golpe em área acerta vários de uma vez).
export function tocarEfeito(id) {
  const efeito = efeitos[id]
  if (!contexto || !efeito || volumes.efeitos === 0) return
  const agora = performance.now()
  if (!podeTocarDeNovo(ultimos, id, agora, audio.msEntreIguais)) return
  ultimos[id] = agora
  const url = arquivoDoSom(efeito.arquivo, arquivosDeSom)
  if (url) tocarArquivo(url).catch(() => tocarBipe(efeito.bipe))
  else tocarBipe(efeito.bipe)
}
