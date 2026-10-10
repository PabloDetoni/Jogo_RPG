import { mercado } from '../dados/balanceamento.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { ofertasFixas, ofertasRotativas, trocas } from '../dados/mercado.js'
import { oQueFalta, porNaMochila, quantidadeNaMochila, tirarDaMochila } from './mochila.js'
import { listarItens, nomeDoItem, textoDaFalta } from './textosDosItens.js'

// MERCADO (Fase 4, TASK-074; RF21, UC16): comprar, vender e trocar item por item com os NPCs. Não vende nem compra
// equipamento (isso é na Forja, RF22). As ofertas estão em dados/mercado.js; os números, em balanceamento.js.

// Ofertas à venda agora: as fixas e algumas rotativas, que mudam a cada "partidasPorRotacao" partidas jogadas
// (PROVISÓRIO: a regra da rotação é a decisão em aberto da TASK-014). A escolha é fixa para cada rodada da rotação
// (todo mundo vê as mesmas) e passa por todas as rotativas com o tempo.
export function ofertasDoMomento(partidasJogadas = 0) {
  const rodada = Math.floor(Math.max(0, partidasJogadas) / mercado.partidasPorRotacao)
  const quantas = Math.min(mercado.rotativasAVenda, ofertasRotativas.length)
  const inicio = (rodada * quantas) % ofertasRotativas.length
  const rotativas = Array.from({ length: quantas }, (_, indice) => ofertasRotativas[(inicio + indice) % ofertasRotativas.length])
  const partidasParaMudar = mercado.partidasPorRotacao - (Math.max(0, partidasJogadas) % mercado.partidasPorRotacao)
  return { fixas: [...ofertasFixas], rotativas, partidasParaMudar }
}

// Quanto o Mercado (ou a Forja) paga por uma unidade: uma parte do preço, para baixo
export function precoDeVenda(id) {
  const item = itemDoCatalogo(id)
  return item ? Math.floor(item.preco * mercado.fracaoDaVenda) : 0
}

const quantidadeValida = (quantidade) => Number.isInteger(quantidade) && quantidade > 0

// Comprar "quantidade" de um item à venda agora. Sem ouro, explica quanto custa e quanto há.
export function comprarNoMercado(progresso, id, quantidade = 1) {
  if (!quantidadeValida(quantidade)) return { ok: false, motivo: 'Quantidade inválida.' }
  const { fixas, rotativas } = ofertasDoMomento(progresso.estatisticas?.partidasJogadas)
  if (![...fixas, ...rotativas].includes(id)) return { ok: false, motivo: `${nomeDoItem(id)} não está à venda agora.` }
  const custo = itemDoCatalogo(id).preco * quantidade
  if (progresso.ouro < custo) return { ok: false, motivo: `Ouro insuficiente: custa ${custo} e você tem ${progresso.ouro}.` }
  return {
    ok: true,
    progresso: { ...progresso, ouro: progresso.ouro - custo, mochila: porNaMochila(progresso.mochila, { [id]: quantidade }) },
    mensagem: `Comprou ${quantidade} ${nomeDoItem(id)} por ${custo} de ouro.`,
  }
}

// Vender "quantidade" de um item da Mochila (equipamento só na Forja)
export function venderNoMercado(progresso, id, quantidade = 1) {
  if (!quantidadeValida(quantidade)) return { ok: false, motivo: 'Quantidade inválida.' }
  const item = itemDoCatalogo(id)
  if (!item) return { ok: false, motivo: 'O Mercado não compra este item.' }
  if (item.tipo === 'equipamento') return { ok: false, motivo: 'Equipamento se vende na Forja.' }
  const tirou = tirarDaMochila(progresso.mochila, { [id]: quantidade })
  if (!tirou.ok) return { ok: false, motivo: `Você não tem ${quantidade} ${item.nome} na Mochila.` }
  const ganho = precoDeVenda(id) * quantidade
  return {
    ok: true,
    progresso: { ...progresso, ouro: progresso.ouro + ganho, mochila: tirou.mochila },
    mensagem: `Vendeu ${quantidade} ${item.nome} por ${ganho} de ouro.`,
  }
}

export function trocaDoMercado(idDaTroca) {
  return trocas.find((troca) => troca.id === idDaTroca) ?? null
}

// Trocar item por item: entrega "dar" e recebe "receber". Sem os itens, diz o que falta.
export function trocarNoMercado(progresso, idDaTroca) {
  const troca = trocaDoMercado(idDaTroca)
  if (!troca) return { ok: false, motivo: 'Esta troca não existe.' }
  const falta = oQueFalta(progresso.mochila, troca.dar)
  if (falta.length > 0) return { ok: false, motivo: textoDaFalta(falta) }
  const { mochila } = tirarDaMochila(progresso.mochila, troca.dar)
  return {
    ok: true,
    progresso: { ...progresso, mochila: porNaMochila(mochila, troca.receber) },
    mensagem: `Trocou ${listarItens(troca.dar)} por ${listarItens(troca.receber)}.`,
  }
}

// Quantos de cada item da troca o jogador tem agora (para a tela mostrar "tem 2 de 3")
export function situacaoDaTroca(progresso, troca) {
  return Object.entries(troca.dar).map(([id, quantidade]) => ({ id, quantidade, tem: quantidadeNaMochila(progresso.mochila, id) }))
}
