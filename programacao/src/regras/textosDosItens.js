import { itemDoCatalogo } from '../dados/itens.js'

// Textos com nomes de itens, para as mensagens do Reino (Mochila, Mercado, Forja, Guilda)

// Nome do item; um id fora do catálogo aparece como ele mesmo
export function nomeDoItem(id) {
  return itemDoCatalogo(id)?.nome ?? id
}

// "2 Pele de lobo, 1 Minério de ferro e 3 Madeira"
export function listarItens(pedidos) {
  const partes = Object.entries(pedidos).map(([id, quantidade]) => `${quantidade} ${nomeDoItem(id)}`)
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}` : (partes[0] ?? '')
}

// "Faltam 2 Pele de lobo." a partir de [{ id, falta }]
export function textoDaFalta(falta) {
  return `Falta${falta.length > 1 || falta[0]?.falta > 1 ? 'm' : ''} ${listarItens(Object.fromEntries(falta.map((item) => [item.id, item.falta])))}.`
}
