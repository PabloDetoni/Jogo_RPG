import { nomeDaClasse } from '../dados/classes.js'
import { espacosDeEquipamento } from '../dados/equipamento.js'
import { aVendaNaForja, receitas } from '../dados/forja.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { podeEquipar } from './equipamento.js'
import { precoDeVenda } from './mercado.js'
import { oQueFalta, porNaMochila, tirarDaMochila } from './mochila.js'
import { nomeDoItem, textoDaFalta } from './textosDosItens.js'

// FORJA (Fase 4, TASK-075; RF22, RF23, UC17, UC18): o único lugar para equipar e para comprar, vender e fabricar
// equipamento. Só os personagens permanentes aparecem aqui (o temporário tem equipamento fixo, RF29).
// A peça equipada sai da Mochila; a que ela substitui (ou a que é tirada) volta para a Mochila.

function trocarPersonagem(progresso, classe, mudar) {
  return progresso.personagens.map((personagem) => (personagem.classe === classe ? mudar(personagem) : personagem))
}

export function equipar(progresso, classe, id) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  if (!personagem) return { ok: false, motivo: 'Só os personagens permanentes usam a Forja.' }
  const item = itemDoCatalogo(id)
  const pode = podeEquipar(item, classe)
  if (!pode.ok) return pode
  const tirou = tirarDaMochila(progresso.mochila, { [id]: 1 })
  if (!tirou.ok) return { ok: false, motivo: `${item.nome} não está na Mochila.` }
  const antigo = personagem.equipamento[item.espaco] ?? null
  const mochila = antigo ? porNaMochila(tirou.mochila, { [antigo]: 1 }) : tirou.mochila
  return {
    ok: true,
    progresso: {
      ...progresso,
      mochila,
      personagens: trocarPersonagem(progresso, classe, (um) => ({ ...um, equipamento: { ...um.equipamento, [item.espaco]: id } })),
    },
    mensagem: `${nomeDaClasse(classe)} equipou ${item.nome}${antigo ? ` (${nomeDoItem(antigo)} voltou para a Mochila)` : ''}.`,
  }
}

export function desequipar(progresso, classe, espaco) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  const id = personagem?.equipamento[espaco]
  if (!id) return { ok: false, motivo: 'Não há nada equipado aí.' }
  const equipamento = { ...personagem.equipamento }
  delete equipamento[espaco]
  return {
    ok: true,
    progresso: {
      ...progresso,
      mochila: porNaMochila(progresso.mochila, { [id]: 1 }),
      personagens: trocarPersonagem(progresso, classe, (um) => ({ ...um, equipamento })),
    },
    mensagem: `${nomeDoItem(id)} voltou para a Mochila.`,
  }
}

export function comprarNaForja(progresso, id) {
  if (!aVendaNaForja.includes(id)) return { ok: false, motivo: `A Forja não vende ${nomeDoItem(id)}.` }
  const { preco, nome } = itemDoCatalogo(id)
  if (progresso.ouro < preco) return { ok: false, motivo: `Ouro insuficiente: custa ${preco} e você tem ${progresso.ouro}.` }
  return {
    ok: true,
    progresso: { ...progresso, ouro: progresso.ouro - preco, mochila: porNaMochila(progresso.mochila, { [id]: 1 }) },
    mensagem: `Comprou ${nome} por ${preco} de ouro. Está na Mochila: equipe na aba Equipar.`,
  }
}

export function venderNaForja(progresso, id, quantidade = 1) {
  const item = itemDoCatalogo(id)
  if (item?.tipo !== 'equipamento') return { ok: false, motivo: 'A Forja só compra equipamento.' }
  if (!Number.isInteger(quantidade) || quantidade < 1) return { ok: false, motivo: 'Quantidade inválida.' }
  const tirou = tirarDaMochila(progresso.mochila, { [id]: quantidade })
  if (!tirou.ok) return { ok: false, motivo: `${item.nome} não está na Mochila (o equipado precisa ser tirado antes).` }
  const ganho = precoDeVenda(id) * quantidade
  return {
    ok: true,
    progresso: { ...progresso, ouro: progresso.ouro + ganho, mochila: tirou.mochila },
    mensagem: `Vendeu ${quantidade} ${item.nome} por ${ganho} de ouro.`,
  }
}

export function receitaDe(resultado) {
  return receitas.find((receita) => receita.resultado === resultado) ?? null
}

// Fabricar por receita (RF23): consome os materiais e o ouro; o equipamento vai para a Mochila
export function fabricar(progresso, resultado) {
  const receita = receitaDe(resultado)
  if (!receita) return { ok: false, motivo: 'Esta receita não existe.' }
  const falta = oQueFalta(progresso.mochila, receita.materiais)
  if (falta.length > 0) return { ok: false, motivo: textoDaFalta(falta) }
  if (progresso.ouro < receita.ouro) return { ok: false, motivo: `Ouro insuficiente: a receita pede ${receita.ouro} e você tem ${progresso.ouro}.` }
  const { mochila } = tirarDaMochila(progresso.mochila, receita.materiais)
  return {
    ok: true,
    progresso: { ...progresso, ouro: progresso.ouro - receita.ouro, mochila: porNaMochila(mochila, { [resultado]: 1 }) },
    mensagem: `Fabricou ${nomeDoItem(resultado)}. Está na Mochila: equipe na aba Equipar.`,
  }
}

// Os espaços de um personagem com o que está em cada um (para a aba Equipar)
export function espacosDoPersonagem(personagem) {
  return espacosDeEquipamento.map((espaco) => ({ ...espaco, item: personagem?.equipamento[espaco.id] ?? null }))
}
