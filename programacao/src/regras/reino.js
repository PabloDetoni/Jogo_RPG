import { distribuirPontos, usarPergaminho } from './arvores.js'
import { comprarNaForja, desequipar, equipar, fabricar, venderNaForja } from './forja.js'
import { evoluirHabilidade, porNaTecla, tirarDaTecla, trocarNaTecla } from './habilidadesDaArvore.js'
import { comprarNoMercado, trocarNoMercado, venderNoMercado } from './mercado.js'
import { tirarDaMochila } from './mochila.js'
import { nomeDoItem } from './textosDosItens.js'

// OPERAÇÕES DO REINO (Fase 4): tudo o que muda o progresso nas telas do Reino (Mochila, Mercado, Forja, Árvores e
// Guilda) é uma regra pura daqui, chamada pelo nome. A tela roda a regra antes para mostrar o motivo quando não dá
// (sem ouro, sem o item...), e o estado roda a mesma regra para mudar o progresso (estadoDoJogo.js, "noReino").
// Cada regra recebe o progresso e devolve { ok: true, progresso, mensagem } ou { ok: false, motivo }, sem mudar nada
// do que recebeu. Fora do Reino (durante a partida) o estado não aplica nenhuma (RF12).

export { listarItens, nomeDoItem, textoDaFalta } from './textosDosItens.js'

const quantidadeValida = (quantidade) => Number.isInteger(quantidade) && quantidade > 0

// Mochila (TASK-072, RF20): descarta itens para sempre (a tela pede confirmação antes)
export function descartar(progresso, id, quantidade = 1) {
  if (!quantidadeValida(quantidade)) return { ok: false, motivo: 'Quantidade inválida.' }
  const tirou = tirarDaMochila(progresso.mochila, { [id]: quantidade })
  if (!tirou.ok) return { ok: false, motivo: `Você não tem ${quantidade} ${nomeDoItem(id)} na Mochila.` }
  return { ok: true, progresso: { ...progresso, mochila: tirou.mochila }, mensagem: `${quantidade} ${nomeDoItem(id)} descartado${quantidade > 1 ? 's' : ''}.` }
}

// Todas as operações pelo nome
export const operacoesDoReino = {
  descartar,
  comprarNoMercado,
  venderNoMercado,
  trocarNoMercado,
  equipar,
  desequipar,
  comprarNaForja,
  venderNaForja,
  fabricar,
  distribuirPontos,
  usarPergaminho,
  evoluirHabilidade,
  porNaTecla,
  trocarNaTecla,
  tirarDaTecla,
}

export function aplicarNoReino(progresso, operacao, argumentos = []) {
  const regra = Object.hasOwn(operacoesDoReino, operacao) ? operacoesDoReino[operacao] : null
  if (!regra) return { ok: false, motivo: 'Operação desconhecida.' }
  return regra(progresso, ...argumentos)
}
