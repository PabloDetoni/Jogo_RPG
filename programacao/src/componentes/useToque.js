import { useSyncExternalStore } from 'react'
import { precisaGirar, usaToque } from '../regras/toque.js'

// O jogo no toque (Parte 14, 28/11/2026): olha o jeito principal de apontar (o dedo = "pointer: coarse"), não o tamanho
// da tela, e se o aparelho está em pé. Muda sozinho quando o aparelho gira ou quando um tablet ganha um mouse.
const consultas = { toque: '(pointer: coarse)', emPe: '(orientation: portrait)' }
const fora = { toque: false, emPe: false, girar: false }

function bate(consulta) {
  try {
    return Boolean(typeof window !== 'undefined' && window.matchMedia?.(consulta).matches)
  } catch {
    return false
  }
}

let ultimo = fora
function retrato() {
  const toque = usaToque({ ponteiroGrosso: bate(consultas.toque) })
  const emPe = bate(consultas.emPe)
  if (ultimo.toque !== toque || ultimo.emPe !== emPe) ultimo = { toque, emPe, girar: precisaGirar({ toque, emPe }) }
  return ultimo
}

function assinar(aoMudar) {
  if (typeof window === 'undefined') return () => {}
  const listas = Object.values(consultas)
    .map((consulta) => {
      try {
        return window.matchMedia?.(consulta) ?? null
      } catch {
        return null
      }
    })
    .filter(Boolean)
  for (const lista of listas) lista.addEventListener?.('change', aoMudar)
  window.addEventListener('resize', aoMudar)
  window.addEventListener('orientationchange', aoMudar)
  return () => {
    for (const lista of listas) lista.removeEventListener?.('change', aoMudar)
    window.removeEventListener('resize', aoMudar)
    window.removeEventListener('orientationchange', aoMudar)
  }
}

// { toque, emPe, girar }
export function useToque() {
  return useSyncExternalStore(assinar, retrato, () => fora)
}

// Fora do React (a tela cheia, o giro da tela)
export function estaNoToque() {
  return retrato().toque
}
