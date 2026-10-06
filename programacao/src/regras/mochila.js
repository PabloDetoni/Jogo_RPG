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
