// RF01: no modo convidado, o jogo fica aberto em uma única aba por navegador.
// Usa a trava do navegador (Web Locks): a primeira aba que entra como convidado fica com ela
// até fechar ou recarregar, e o navegador solta a trava sozinho, mesmo se a aba travar.
const nomeDaTrava = 'jogo-rpg:aba-do-convidado'
let estaAbaTemATrava = false

// Devolve 'ok', 'ocupada' (outra aba já está como convidado) ou 'semSuporte'.
// Sem suporte, o jogo segue sem a trava; a versão do salvamento ainda impede uma aba de
// apagar o que a outra gravou (RNF06).
export function travarAbaDoConvidado() {
  if (estaAbaTemATrava) return Promise.resolve('ok')
  const travas = globalThis.navigator?.locks
  if (!travas) return Promise.resolve('semSuporte')

  return new Promise((responder) => {
    travas
      .request(nomeDaTrava, { ifAvailable: true }, (trava) => {
        if (!trava) {
          responder('ocupada')
          return undefined
        }
        estaAbaTemATrava = true
        responder('ok')
        return new Promise(() => {}) // segura a trava enquanto a aba existir
      })
      .catch(() => responder('semSuporte'))
  })
}
