// Ajudantes só dos testes (nada daqui entra no jogo).

// localStorage de mentira. "cheio" simula o navegador sem espaço; "bloqueado", o acesso negado.
export function storageFalso({ bloqueado = false } = {}) {
  const dados = new Map()
  return {
    dados,
    cheio: false,
    getItem(chave) {
      if (bloqueado) throw new Error('SecurityError')
      return dados.has(chave) ? dados.get(chave) : null
    },
    setItem(chave, valor) {
      if (bloqueado) throw new Error('SecurityError')
      if (this.cheio) {
        const erro = new Error('sem espaço')
        erro.name = 'QuotaExceededError'
        throw erro
      }
      dados.set(chave, String(valor))
    },
    removeItem(chave) {
      dados.delete(chave)
    },
  }
}

// Relógio que anda um segundo a cada leitura
export function relogioFalso() {
  let segundos = 0
  return () => new Date(Date.UTC(2026, 9, 5, 12, 0, segundos++))
}
