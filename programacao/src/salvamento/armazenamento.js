// Acesso seguro ao localStorage: nunca lança erro, sempre devolve { ok, ... }.
// Erros possíveis: 'indisponivel' (navegador bloqueou) e 'cheio' (acabou o espaço).
export function criarArmazenamento(storage) {
  return {
    ler(chave) {
      try {
        return { ok: true, valor: storage.getItem(chave) }
      } catch {
        return { ok: false, erro: 'indisponivel' }
      }
    },
    gravar(chave, valor) {
      try {
        storage.setItem(chave, valor)
        return { ok: true }
      } catch (erro) {
        return { ok: false, erro: faltouEspaco(erro) ? 'cheio' : 'indisponivel' }
      }
    },
    apagar(chave) {
      try {
        storage.removeItem(chave)
        return { ok: true }
      } catch {
        return { ok: false, erro: 'indisponivel' }
      }
    },
  }
}

function faltouEspaco(erro) {
  return (
    erro?.name === 'QuotaExceededError' ||
    erro?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    erro?.code === 22 ||
    erro?.code === 1014
  )
}

// O localStorage deste navegador, ou null quando não dá para usar
// (dados bloqueados nas configurações do navegador, ou fora do navegador).
export function armazenamentoDoNavegador() {
  try {
    const storage = globalThis.localStorage
    if (!storage) return null
    storage.getItem('jogo-rpg:teste') // lança erro se o navegador bloquear o acesso
    return criarArmazenamento(storage)
  } catch {
    return null
  }
}
