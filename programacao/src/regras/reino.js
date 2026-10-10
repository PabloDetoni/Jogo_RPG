import { itemDoCatalogo } from '../dados/itens.js'
import { tirarDaMochila } from './mochila.js'

// OPERAÇÕES DO REINO (Fase 4): tudo o que muda o progresso nas telas do Reino (Mochila, Mercado, Forja, Árvores e
// Guilda) é uma regra pura daqui, chamada pelo nome. A tela roda a regra antes para mostrar o motivo quando não dá
// (sem ouro, sem o item...), e o estado roda a mesma regra para mudar o progresso (estadoDoJogo.js, "noReino").
// Cada regra recebe o progresso e devolve { ok: true, progresso, mensagem } ou { ok: false, motivo }, sem mudar nada
// do que recebeu. Fora do Reino (durante a partida) o estado não aplica nenhuma (RF12).

// Nome do item para as mensagens; um id fora do catálogo aparece como ele mesmo
export function nomeDoItem(id) {
  return itemDoCatalogo(id)?.nome ?? id
}

// "2 Pele de lobo e 1 Minério de ferro"
export function listarItens(pedidos) {
  const partes = Object.entries(pedidos).map(([id, quantidade]) => `${quantidade} ${nomeDoItem(id)}`)
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}` : (partes[0] ?? '')
}

// "Faltam 2 Pele de lobo." a partir de [{ id, falta }]
export function textoDaFalta(falta) {
  return `Falta${falta.length > 1 || falta[0]?.falta > 1 ? 'm' : ''} ${listarItens(Object.fromEntries(falta.map((item) => [item.id, item.falta])))}.`
}

const quantidadeValida = (quantidade) => Number.isInteger(quantidade) && quantidade > 0

// Mochila (TASK-072, RF20): descarta itens para sempre (a tela pede confirmação antes)
export function descartar(progresso, id, quantidade = 1) {
  if (!quantidadeValida(quantidade)) return { ok: false, motivo: 'Quantidade inválida.' }
  const tirou = tirarDaMochila(progresso.mochila, { [id]: quantidade })
  if (!tirou.ok) return { ok: false, motivo: `Você não tem ${quantidade} ${nomeDoItem(id)} na Mochila.` }
  return { ok: true, progresso: { ...progresso, mochila: tirou.mochila }, mensagem: `${quantidade} ${nomeDoItem(id)} descartado${quantidade > 1 ? 's' : ''}.` }
}

// Todas as operações pelo nome (as das outras telas entram nas partes seguintes da Fase 4)
export const operacoesDoReino = { descartar }

export function aplicarNoReino(progresso, operacao, argumentos = []) {
  const regra = Object.hasOwn(operacoesDoReino, operacao) ? operacoesDoReino[operacao] : null
  if (!regra) return { ok: false, motivo: 'Operação desconhecida.' }
  return regra(progresso, ...argumentos)
}
