// ITEM NA MÃO (ajustes da partida, 14/10/2026): mexer nos itens como no inventário do Minecraft, com o mouse.
// A grade é só da tela: a partida guarda a mochila como uma lista por item ({ id, quantidade }, regras/mochila.js), e a
// tela arruma essa lista em quadradinhos (slots), que o jogador pode dividir, juntar e trocar de lugar. O item na mão
// continua contando na mochila (o peso não muda) até ser jogado fora.
// - clique esquerdo: mão vazia pega a pilha inteira; com item na mão, põe no quadradinho vazio, junta com o mesmo item
//   ou troca com o que está lá;
// - clique direito: mão vazia pega a metade (a maior); com item na mão, põe 1;
// - clique fora da janela com item na mão: ele vai para o chão (a partida faz o descarte; regras/itensNoChao.js);
// - fechar a janela com item na mão: ele volta para a mochila.
// Na Mochila do Reino (sem chão), o item na mão vai para a lixeira, com confirmação; cancelar guarda de volta.
// estado: { slots: [{ id, quantidade } | null, ...], mao: { id, quantidade } | null }

const copiar = (estado) => ({ slots: [...estado.slots], mao: estado.mao ? { ...estado.mao } : null })

// A grade a partir da lista da mochila, na ordem dela, com pelo menos "total" quadradinhos (nenhum item fica de fora)
export function slotsDaLista(itens, total) {
  const lista = (itens ?? []).filter((item) => item?.quantidade > 0)
  const slots = Array.from({ length: Math.max(total, lista.length) }, () => null)
  lista.forEach((item, i) => {
    slots[i] = { id: item.id, quantidade: item.quantidade }
  })
  return slots
}

// A grade nunca fica sem quadradinho vazio: pelo menos "minimo" quadradinhos e, se encher, mais uma fileira ("passo")
export function completarGrade(estado, { minimo, passo = 1 }) {
  const slots = [...estado.slots]
  while (slots.length < minimo || !slots.some((slot) => !slot)) for (let i = 0; i < Math.max(1, passo); i++) slots.push(null)
  return slots.length === estado.slots.length ? estado : { ...estado, slots }
}

// Guarda um item na grade: junta na pilha do mesmo item ou vai para o primeiro quadradinho vazio (a mão não muda)
export function guardar(estado, item) {
  const novo = copiar(estado)
  if (!item || item.quantidade <= 0) return novo
  const mesmo = novo.slots.findIndex((slot) => slot?.id === item.id)
  const vazio = novo.slots.findIndex((slot) => !slot)
  const onde = mesmo >= 0 ? mesmo : vazio
  if (onde >= 0) novo.slots[onde] = { id: item.id, quantidade: (novo.slots[onde]?.quantidade ?? 0) + item.quantidade }
  else novo.slots.push({ id: item.id, quantidade: item.quantidade })
  return novo
}

export function cliqueEsquerdo(estado, indice) {
  const novo = copiar(estado)
  const slot = novo.slots[indice]
  const { mao } = novo
  if (!mao && !slot) return novo
  if (!mao) {
    novo.mao = { ...slot }
    novo.slots[indice] = null
    return novo
  }
  if (!slot) {
    novo.slots[indice] = { ...mao }
    novo.mao = null
    return novo
  }
  if (slot.id === mao.id) {
    novo.slots[indice] = { id: slot.id, quantidade: slot.quantidade + mao.quantidade }
    novo.mao = null
    return novo
  }
  novo.slots[indice] = { ...mao }
  novo.mao = { ...slot }
  return novo
}

export function cliqueDireito(estado, indice) {
  const novo = copiar(estado)
  const slot = novo.slots[indice]
  const { mao } = novo
  if (!mao) {
    if (!slot) return novo
    const pega = Math.ceil(slot.quantidade / 2)
    novo.mao = { id: slot.id, quantidade: pega }
    novo.slots[indice] = slot.quantidade - pega > 0 ? { id: slot.id, quantidade: slot.quantidade - pega } : null
    return novo
  }
  if (slot && slot.id !== mao.id) return novo
  novo.slots[indice] = { id: mao.id, quantidade: (slot?.quantidade ?? 0) + 1 }
  novo.mao = mao.quantidade > 1 ? { id: mao.id, quantidade: mao.quantidade - 1 } : null
  return novo
}

// Jogar fora (clique fora da janela): devolve o estado sem a mão e o que vai para o chão
export function soltarFora(estado) {
  const novo = copiar(estado)
  const noChao = novo.mao
  novo.mao = null
  return { estado: novo, noChao }
}

// Fechar a janela com item na mão: volta para a pilha do mesmo item ou para o primeiro quadradinho vazio
export function devolverAoFechar(estado) {
  if (!estado.mao) return copiar(estado)
  return { ...guardar(estado, estado.mao), mao: null }
}

// Quanto de cada item há na grade e na mão
function totais(estado) {
  const soma = {}
  for (const slot of estado.slots) if (slot) soma[slot.id] = (soma[slot.id] ?? 0) + slot.quantidade
  if (estado.mao) soma[estado.mao.id] = (soma[estado.mao.id] ?? 0) + estado.mao.quantidade
  return soma
}

// A partida mudou a mochila (usou uma poção, pegou do chão...): a grade acompanha, sem mexer no que o jogador arrumou.
// Faltou: tira primeiro do quadradinho "preferido" (o que está embaixo do mouse, onde o E foi apertado), depois das
// últimas pilhas e por fim da mão; sobrou: soma na pilha do mesmo item ou no primeiro quadradinho vazio; item que acabou
// some da grade e da mão.
export function acompanharMochila(estado, itens, preferido = null) {
  const novo = copiar(estado)
  const daPartida = Object.fromEntries((itens ?? []).filter((item) => item.quantidade > 0).map((item) => [item.id, item.quantidade]))
  const naTela = totais(novo)
  for (const id of new Set([...Object.keys(daPartida), ...Object.keys(naTela)])) {
    let diferenca = (daPartida[id] ?? 0) - (naTela[id] ?? 0)
    if (diferenca < 0) {
      const ordem = [...novo.slots.keys()].reverse()
      if (preferido !== null && novo.slots[preferido]?.id === id) ordem.unshift(preferido)
      for (const i of ordem) {
        const slot = novo.slots[i]
        if (diferenca >= 0) break
        if (slot?.id !== id) continue
        const tira = Math.min(slot.quantidade, -diferenca)
        novo.slots[i] = slot.quantidade - tira > 0 ? { id, quantidade: slot.quantidade - tira } : null
        diferenca += tira
      }
      if (diferenca < 0 && novo.mao?.id === id) {
        const tira = Math.min(novo.mao.quantidade, -diferenca)
        novo.mao = novo.mao.quantidade - tira > 0 ? { id, quantidade: novo.mao.quantidade - tira } : null
      }
    } else if (diferenca > 0) {
      novo.slots = guardar(novo, { id, quantidade: diferenca }).slots
    }
  }
  return novo
}
