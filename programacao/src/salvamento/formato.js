// Versão do FORMATO do arquivo salvo (a estrutura dele), diferente da versão do estado.
// Campos novos não precisam de formato novo: normalizarProgresso preenche o que faltar.
// Suba o formato só quando um campo mudar de nome ou de lugar, e escreva a migração abaixo.
export const formatoAtual = 1

// migracoes[n] transforma um save do formato n num save do formato n + 1. Exemplo:
// 1: (dados) => ({ ...dados, formato: 2, progresso: { ...dados.progresso, nomeNovo: dados.progresso.nomeAntigo } }),
const migracoes = {}

export function migrarParaFormatoAtual(dados) {
  let atual = dados
  while (atual.formato < formatoAtual) {
    const migrar = migracoes[atual.formato]
    if (!migrar) throw new Error(`Não existe migração do formato ${atual.formato}`)
    atual = migrar(atual)
  }
  return atual
}
