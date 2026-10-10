import { capacidadePorPontoDeForca } from '../dados/balanceamento.js'
import { itemDoCatalogo, usavelNaPartida } from '../dados/itens.js'

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

// ---------- MOCHILA DA PARTIDA NA PREPARAÇÃO (Fase 4, TASK-073) ----------
// "levar" = { id: quantidade }: o que vai da Mochila do Reino para a mochila da partida. Só vai o que se usa na partida
// (poções e aceleradores), e o peso conta na capacidade (a Força do grupo, RF33). Os itens só saem da Mochila do Reino
// no fim da partida, já descontado o que foi usado (regras/ganhosDaPartida.js): se a página fechar no meio, nada some.

const pesoDoItem = (id) => itemDoCatalogo(id)?.peso ?? 0

export function pesoDeLevar(levar) {
  return Object.entries(levar).reduce((soma, [id, quantidade]) => soma + pesoDoItem(id) * quantidade, 0)
}

// Põe mais "quantidade" de um item no que vai. Devolve { ok, levar } ou { ok: false, motivo }.
export function levarNaPartida(levar, mochilaDoReino, id, quantidade, capacidade) {
  const item = itemDoCatalogo(id)
  if (!usavelNaPartida(item)) return { ok: false, motivo: 'Só dá para levar o que se usa na partida (poções e aceleradores).' }
  if (!Number.isInteger(quantidade) || quantidade < 1) return { ok: false, motivo: 'Quantidade inválida.' }
  const jaVai = levar[id] ?? 0
  if (jaVai + quantidade > quantidadeNaMochila(mochilaDoReino, id)) return { ok: false, motivo: `Você não tem mais ${item.nome} na Mochila.` }
  const livre = capacidade - pesoDeLevar(levar)
  if (item.peso * quantidade > livre) {
    return { ok: false, motivo: `Não cabe: a mochila da partida tem ${livre} de peso livre e ${item.nome} pesa ${item.peso}.` }
  }
  return { ok: true, levar: { ...levar, [id]: jaVai + quantidade } }
}

// Tira "quantidade" de um item do que vai (volta a ficar só na Mochila do Reino)
export function deixarNoReino(levar, id, quantidade) {
  const fica = (levar[id] ?? 0) - quantidade
  const resto = { ...levar }
  delete resto[id]
  return fica > 0 ? { ...resto, [id]: fica } : resto
}

// O que vai de verdade ao começar a partida: só o que se usa nela, até a quantidade que ainda existe na Mochila e até
// caber na capacidade (a escolha fica guardada entre partidas, e a Mochila pode ter mudado no meio)
export function ajustarLevar(levar, mochilaDoReino, capacidade) {
  let ajustado = {}
  for (const [id, quantidade] of Object.entries(levar ?? {})) {
    if (!usavelNaPartida(itemDoCatalogo(id)) || !Number.isInteger(quantidade)) continue
    const possivel = Math.min(quantidade, quantidadeNaMochila(mochilaDoReino, id))
    for (let quantos = possivel; quantos > 0; quantos--) {
      const tentativa = levarNaPartida(ajustado, mochilaDoReino, id, quantos, capacidade)
      if (tentativa.ok) {
        ajustado = tentativa.levar
        break
      }
    }
  }
  return ajustado
}

// O que vai, como itens da mochila da partida (com o peso de uma unidade)
export function itensLevados(levar) {
  return Object.entries(levar ?? {})
    .filter(([id, quantidade]) => itemDoCatalogo(id) && quantidade > 0)
    .map(([id, quantidade]) => ({ id, peso: pesoDoItem(id), quantidade }))
}
