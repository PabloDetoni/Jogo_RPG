import { normalizarPreferencias } from '../estado/preferencias.js'
import { chaves } from './chaves.js'

const formatoDasPreferencias = 1

// Som e tema ficam no navegador e funcionam antes do login (RF18).
export function carregarPreferencias(armazenamento) {
  if (!armazenamento) return normalizarPreferencias(null)
  const lido = armazenamento.ler(chaves.preferencias)
  if (!lido.ok || lido.valor === null) return normalizarPreferencias(null)
  try {
    return normalizarPreferencias(JSON.parse(lido.valor))
  } catch {
    return normalizarPreferencias(null)
  }
}

export function salvarPreferencias(armazenamento, preferencias) {
  if (!armazenamento) return
  armazenamento.gravar(chaves.preferencias, JSON.stringify({ formato: formatoDasPreferencias, ...preferencias }))
}
