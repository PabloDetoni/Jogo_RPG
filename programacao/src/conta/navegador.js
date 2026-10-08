import { chaves } from '../salvamento/chaves.js'

// O que o caminho das contas usa do navegador (sessionStorage e recarregar a página). Nunca lança erro.

let sessaoNaMemoria = null

// O código da sessão desta aba (RF05). Fica no sessionStorage: o mesmo depois de recarregar, outro em cada aba nova.
export function sessaoDaAba() {
  try {
    const guardada = globalThis.sessionStorage.getItem(chaves.sessaoDaAba)
    if (guardada) return guardada
    const nova = novoCodigo()
    globalThis.sessionStorage.setItem(chaves.sessaoDaAba, nova)
    return nova
  } catch {
    sessaoNaMemoria ??= novoCodigo()
    return sessaoNaMemoria
  }
}

// Recarrega a página e, na página nova, mostra a mensagem ({ texto, tipo, onde: 'login' | 'aviso' })
export function recarregarCom(mensagem) {
  try {
    if (mensagem) globalThis.sessionStorage.setItem(chaves.mensagemAoAbrir, JSON.stringify(mensagem))
  } catch {
    // sem sessionStorage, a página só recarrega sem a mensagem
  }
  globalThis.location.reload()
}

// A mensagem deixada antes de recarregar (uma vez só)
export function lerMensagemAoAbrir() {
  try {
    const texto = globalThis.sessionStorage.getItem(chaves.mensagemAoAbrir)
    globalThis.sessionStorage.removeItem(chaves.mensagemAoAbrir)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}

// Um uuid (o banco guarda a sessão como uuid). randomUUID só existe em https e no localhost.
function novoCodigo() {
  const cripto = globalThis.crypto
  if (cripto?.randomUUID) return cripto.randomUUID()
  const bytes = new Uint8Array(16)
  if (cripto?.getRandomValues) cripto.getRandomValues(bytes)
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
