import { capacidadePorPontoDeForca } from '../dados/balanceamento.js'

// Capacidade da mochila da partida: soma da Força de todo o grupo que vai, permanentes e contratados (RF33).
// É calculada ao começar a partida e não muda durante ela.
export function capacidadeDaMochila(forcasDoGrupo) {
  return forcasDoGrupo.reduce((soma, forca) => soma + Math.max(0, forca), 0) * capacidadePorPontoDeForca
}

// Itens: { id, peso, quantidade }, com o peso de UMA unidade em número inteiro
export function pesoTotal(itens) {
  return itens.reduce((soma, item) => soma + item.peso * item.quantidade, 0)
}

// Guarda um item na mochila: entra o que cabe, o resto cai no chão (RF40). Itens iguais ficam juntos.
// Devolve { itens, noChao }, com noChao = null quando coube tudo.
export function guardarNaMochila(itens, novo, capacidade) {
  const quantidade = Math.max(0, Math.floor(novo.quantidade))
  if (quantidade === 0) return { itens, noChao: null }
  const livre = capacidade - pesoTotal(itens)
  const cabem = novo.peso <= 0 ? quantidade : Math.max(0, Math.min(quantidade, Math.floor(livre / novo.peso)))
  const sobram = quantidade - cabem

  let resultado = itens
  if (cabem > 0) {
    const jaTem = itens.some((item) => item.id === novo.id)
    resultado = jaTem
      ? itens.map((item) => (item.id === novo.id ? { ...item, quantidade: item.quantidade + cabem } : item))
      : [...itens, { ...novo, quantidade: cabem }]
  }
  return { itens: resultado, noChao: sobram > 0 ? { ...novo, quantidade: sobram } : null }
}

// ---------- MOCHILA DO REINO (Fase 4, TASK-072) ----------
// Lista de { id, quantidade }, praticamente ilimitada (RF20). Os nomes vêm do catálogo (dados/itens.js).

// Junta itens repetidos (um save antigo pode ter o mesmo id duas vezes) e tira as quantidades zeradas
export function juntarItens(lista) {
  const total = new Map()
  for (const item of lista) total.set(item.id, (total.get(item.id) ?? 0) + item.quantidade)
  return [...total].filter(([, quantidade]) => quantidade > 0).map(([id, quantidade]) => ({ id, quantidade }))
}

export function quantidadeNaMochila(mochila, id) {
  return mochila.reduce((soma, item) => (item.id === id ? soma + item.quantidade : soma), 0)
}

// Põe itens ({ id: quantidade }) na mochila
export function porNaMochila(mochila, pedidos) {
  return juntarItens([...mochila, ...Object.entries(pedidos).map(([id, quantidade]) => ({ id, quantidade }))])
}

// O que falta para ter todos os itens pedidos ({ id: quantidade }): [{ id, falta }] (vazio = tem tudo)
export function oQueFalta(mochila, pedidos) {
  return Object.entries(pedidos)
    .map(([id, quantidade]) => ({ id, falta: quantidade - quantidadeNaMochila(mochila, id) }))
    .filter((item) => item.falta > 0)
}

// Tira itens ({ id: quantidade }) da mochila. Sem o bastante, nada muda: { ok: false, falta }
export function tirarDaMochila(mochila, pedidos) {
  const falta = oQueFalta(mochila, pedidos)
  if (falta.length > 0) return { ok: false, falta }
  return { ok: true, mochila: juntarItens([...mochila, ...Object.entries(pedidos).map(([id, quantidade]) => ({ id, quantidade: -quantidade }))]) }
}
