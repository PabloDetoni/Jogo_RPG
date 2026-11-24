// Os NPCs do Reino (RF57, Parte 9 de 11/2026). Funções puras.

// O que o NPC diz agora: na primeira visita (ele ainda não é conhecido), a apresentação, parte por parte; depois, uma
// fala sorteada que não repete a última. Devolve { apresentacao: boolean, texto, parte, partes, indice }.
// sorteio(): número de 0 a 1 (Math.random no jogo, fixo nos testes).
export function falaDaVez(npc, { conhecido, parte = 0, ultima = null }, sorteio = Math.random) {
  if (!conhecido) {
    const partes = npc.apresentacao.length
    const i = Math.min(Math.max(0, parte), partes - 1)
    return { apresentacao: true, texto: npc.apresentacao[i], parte: i, partes, indice: null }
  }
  const total = npc.falas.length
  let indice = Math.min(total - 1, Math.floor(sorteio() * total))
  if (total > 1 && indice === ultima) indice = (indice + 1) % total
  return { apresentacao: false, texto: npc.falas[indice], parte: 0, partes: 1, indice }
}

// O NPC passa a ser conhecido (a apresentação não volta). Devolve o progresso novo; já conhecido, o mesmo.
export function conhecerNpc(progresso, id) {
  const conhecidos = progresso.npcsConhecidos ?? []
  if (!id || conhecidos.includes(id)) return { ok: true, progresso }
  return { ok: true, progresso: { ...progresso, npcsConhecidos: [...conhecidos, id] } }
}
