import { conquistas } from '../dados/conquistas.js'

// CONQUISTAS (Fase 4, TASK-103; RF17): o progresso de cada uma sai do progresso do jogo; ao concluir, ela fica marcada
// em progresso.conquistas ({ id: true }) e a recompensa entra uma vez só. A lista fica em dados/conquistas.js.

// Quanto já foi feito: { atual, meta } (atual nunca passa da meta)
export function progressoDaConquista(progresso, conquista) {
  const { condicao } = conquista
  let atual = 0
  if (condicao.tipo === 'estatistica') atual = progresso.estatisticas?.[condicao.campo] ?? 0
  if (condicao.tipo === 'nivel') atual = Math.max(0, ...progresso.personagens.map((personagem) => personagem.nivel))
  if (condicao.tipo === 'areas') atual = progresso.mapasDescobertos?.[condicao.bioma]?.areas?.length ?? 0
  if (condicao.tipo === 'classes') atual = progresso.personagens.length
  if (condicao.tipo === 'ouro') atual = progresso.ouro
  return { atual: Math.min(atual, condicao.meta), meta: condicao.meta }
}

export function conquistaConcluida(progresso, id) {
  return progresso.conquistas?.[id] === true
}

// Marca as que acabaram de ser cumpridas e dá as recompensas (uma vez só). Devolve o progresso e a lista das novas.
// Quando não há nenhuma nova, devolve o mesmo progresso (sem mudar nada).
export function aplicarConquistas(progresso) {
  const novas = conquistas.filter((conquista) => {
    if (conquistaConcluida(progresso, conquista.id)) return false
    const { atual, meta } = progressoDaConquista(progresso, conquista)
    return atual >= meta
  })
  if (novas.length === 0) return { progresso, novas }
  const ouro = novas.reduce((soma, conquista) => soma + (conquista.recompensa?.ouro ?? 0), 0)
  return {
    progresso: {
      ...progresso,
      ouro: progresso.ouro + ouro,
      conquistas: { ...progresso.conquistas, ...Object.fromEntries(novas.map((conquista) => [conquista.id, true])) },
    },
    novas,
  }
}

// O aviso de uma conquista nova: "Conquista: Caçador (+100 de ouro)"
export function avisoDaConquista(conquista) {
  return `Conquista: ${conquista.nome}${conquista.recompensa?.ouro ? ` (+${conquista.recompensa.ouro} de ouro)` : ''}`
}
