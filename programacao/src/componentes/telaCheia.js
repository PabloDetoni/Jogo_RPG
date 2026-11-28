import { devePedirTelaCheia } from '../regras/telaCheia.js'
import { estaNoToque } from './useToque.js'

// Tela cheia no navegador (ajustes de 14/10/2026). Nada aqui lança erro: se o navegador recusar ou não tiver tela cheia,
// o jogo segue como estava. No Chrome e no Edge, o Esc fica "travado" na tela cheia (Keyboard Lock): ele chega ao jogo
// (pausa e fecha janelas) em vez de sair; segurar o Esc ainda sai, como o navegador manda.

let saidaPedida = false

export function telaCheiaSuportada() {
  return typeof document !== 'undefined' && Boolean(document.fullscreenEnabled && document.documentElement?.requestFullscreen)
}

export function estaEmTelaCheia() {
  return typeof document !== 'undefined' && Boolean(document.fullscreenElement)
}

function travarEsc() {
  try {
    const lock = navigator.keyboard?.lock?.(['Escape'])
    lock?.catch?.(() => {})
  } catch {
    // sem Keyboard Lock (Firefox, Safari): o Esc do navegador sai da tela cheia, e o jogo trata isso
  }
}

// No celular (Parte 14), em tela cheia o jogo fica deitado (o Android deixa travar; o iPhone não tem, e o app instalado
// já abre deitado pelo manifesto)
function travarDeitado() {
  try {
    if (estaNoToque()) screen.orientation?.lock?.('landscape')?.catch?.(() => {})
  } catch {
    // sem trava de orientação: segue como está
  }
}

// Chamar dentro do clique. preferencia: a das Configurações (telaCheia).
export function pedirTelaCheia(preferencia) {
  if (!devePedirTelaCheia({ preferencia, suportada: telaCheiaSuportada(), emTelaCheia: estaEmTelaCheia() })) return
  try {
    saidaPedida = false
    const pedido = document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    pedido?.then?.(() => {
      travarEsc()
      travarDeitado()
    }, () => {})
  } catch {
    // recusada: segue sem tela cheia
  }
}

// O X do canto e o "desligar" das Configurações
export function sairDaTelaCheia() {
  if (!estaEmTelaCheia()) return
  saidaPedida = true
  try {
    navigator.keyboard?.unlock?.()
    document.exitFullscreen?.()?.catch?.(() => {})
  } catch {
    // nada a fazer
  }
}

// Ouve as entradas e saídas: aoMudar({ emTelaCheia, saidaPedida })
export function ouvirTelaCheia(aoMudar) {
  if (typeof document === 'undefined') return () => {}
  const aoTrocar = () => {
    const emTelaCheia = estaEmTelaCheia()
    aoMudar({ emTelaCheia, saidaPedida })
    if (!emTelaCheia) saidaPedida = false
    else travarEsc()
  }
  document.addEventListener('fullscreenchange', aoTrocar)
  return () => document.removeEventListener('fullscreenchange', aoTrocar)
}
