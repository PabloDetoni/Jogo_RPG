// INTERFACE (Fase 4.5): as contas puras das telas novas. Nenhuma regra do jogo muda aqui: é só o que mostrar (filtros,
// ordem, comparação antes e depois, de onde vem cada item e o que o jogador já viu). As ações continuam as de
// regras/reino.js, regras/guilda.js e regras/missoes.js.

import { mundo } from '../dados/balanceamento.js'
import { atributos } from '../dados/classes.js'
import { aVendaNaForja, receitas } from '../dados/forja.js'
import { filtrosDeItens, ordemDosTipos } from '../dados/interface.js'
import { itemDoCatalogo, itens } from '../dados/itens.js'
import { ofertasFixas, ofertasRotativas, trocas } from '../dados/mercado.js'
import { dadosDosMinijogos } from '../dados/minijogos.js'
import { floresta } from '../dados/mundo/floresta.js'
import { telas } from '../dados/telas.js'
import { atributosComEquipamento, bonusDoEquipamento, podeEquipar } from './equipamento.js'

// O item passa no filtro? (o tipo ou a raridade está na lista do filtro; "todos" deixa tudo)
export function itemPassaNoFiltro(item, idDoFiltro) {
  const filtro = filtrosDeItens.find((um) => um.id === idDoFiltro)
  if (!filtro || filtro.id === 'todos') return true
  if (!item) return false
  return Boolean(filtro.tipos?.includes(item.tipo) || filtro.raridades?.includes(item.raridade))
}

// Os itens ({ id, ... }) que passam no filtro; item fora do catálogo (save antigo) só aparece em "todos"
export function filtrarItens(lista, idDoFiltro) {
  return lista.filter((entrada) => itemPassaNoFiltro(itemDoCatalogo(entrada.id), idDoFiltro) || (idDoFiltro === 'todos' && !itemDoCatalogo(entrada.id)))
}

// Quantos itens há em cada filtro (para mostrar no botão do filtro)
export function contarPorFiltro(lista) {
  return Object.fromEntries(filtrosDeItens.map((filtro) => [filtro.id, filtrarItens(lista, filtro.id).length]))
}

// Ordem das grades: o que se usa primeiro (consumíveis), depois equipamento, materiais e recursos; dentro do tipo, pelo nome
export function ordenarItens(lista) {
  const posicao = (id) => {
    const indice = ordemDosTipos.indexOf(itemDoCatalogo(id)?.tipo)
    return indice < 0 ? ordemDosTipos.length : indice
  }
  const nome = (id) => itemDoCatalogo(id)?.nome ?? id
  return [...lista].sort((a, b) => posicao(a.id) - posicao(b.id) || nome(a.id).localeCompare(nome(b.id), 'pt-BR'))
}

// Equipar (ou tirar, com id null) uma peça num espaço: os atributos, a defesa e a recarga antes e depois, para a Forja
// mostrar em verde (sobe) ou vermelho (desce) antes de confirmar. "serve" diz se a classe pode usar (arma e escudo).
export function comparacaoDeEquipamento(personagem, espaco, id) {
  const atual = personagem.equipamento ?? {}
  const novo = { ...atual }
  if (id) novo[espaco] = id
  else delete novo[espaco]
  const antes = atributosComEquipamento(personagem.atributos, atual)
  const depois = atributosComEquipamento(personagem.atributos, novo)
  const bonusAntes = bonusDoEquipamento(atual)
  const bonusDepois = bonusDoEquipamento(novo)
  const linhas = [
    ...atributos.map((atributo) => ({ id: atributo.id, nome: atributo.nome, antes: antes[atributo.id], depois: depois[atributo.id] })),
    { id: 'defesa', nome: 'Defesa', antes: bonusAntes.defesa, depois: bonusDepois.defesa },
  ]
  if (bonusAntes.reducaoDeRecarga || bonusDepois.reducaoDeRecarga) {
    const porcento = (fracao) => Math.round(fracao * 100)
    linhas.push({ id: 'recarga', nome: 'Recarga mais curta (%)', antes: porcento(bonusAntes.reducaoDeRecarga), depois: porcento(bonusDepois.reducaoDeRecarga) })
  }
  return {
    linhas,
    substitui: id ? (atual[espaco] ?? null) : null,
    serve: id ? podeEquipar(itemDoCatalogo(id), personagem.classe) : { ok: true },
  }
}

const comMaiuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

// De onde vem um item (para o Catálogo): lojas, receitas, drops, o chão da Floresta, minijogos e trocas
export function origensDoItem(id) {
  const origens = []
  if (ofertasFixas.includes(id)) origens.push('Mercado (sempre à venda)')
  if (ofertasRotativas.includes(id)) origens.push('Mercado (às vezes, nas ofertas ★)')
  if (aVendaNaForja.includes(id)) origens.push('Forja (à venda)')
  if (receitas.some((receita) => receita.resultado === id)) origens.push('Forja (receita)')
  for (const [tipo, ficha] of Object.entries(mundo.mobs)) if (ficha.drops?.some((drop) => drop.item === id)) origens.push(`${comMaiuscula(tipo)} (Floresta)`)
  if (mundo.boss.drops?.some((drop) => drop.item === id)) origens.push(mundo.boss.nome)
  if (mundo.boss.especial?.item === id) origens.push(`${mundo.boss.nome} (raro)`)
  if (Object.values(floresta.recursos ?? {}).some((recursos) => id in recursos)) origens.push('Chão da Floresta (E para pegar)')
  for (const minijogo of Object.values(dadosDosMinijogos)) {
    if (minijogo.item === id) origens.push(`Minijogo: ${minijogo.nome}`)
    if (minijogo.raro === id) origens.push(`Minijogo: ${minijogo.nome} (raro)`)
  }
  if (trocas.some((troca) => id in troca.receber)) origens.push('Troca no Mercado')
  return origens
}

// Tudo o que existe no beta (o equipamento de teste fica de fora), na ordem das grades
export function catalogoDoBeta() {
  return ordenarItens(Object.values(itens).filter((item) => item.raridade !== 'teste').map((item) => ({ id: item.id })))
}

// O que o jogador já teve: os itens da Mochila e os equipados entram na lista "itensVistos" do progresso (o Catálogo
// mostra os outros apagados). Devolve o mesmo progresso quando não há nada novo.
export function registrarItensVistos(progresso) {
  if (!progresso) return progresso
  const vistos = new Set(progresso.itensVistos ?? [])
  const antes = vistos.size
  for (const { id } of progresso.mochila ?? []) if (itemDoCatalogo(id)) vistos.add(id)
  for (const personagem of progresso.personagens ?? []) for (const id of Object.values(personagem.equipamento ?? {})) if (itemDoCatalogo(id)) vistos.add(id)
  return vistos.size === antes ? progresso : { ...progresso, itensVistos: [...vistos] }
}

// Uma cor de dados/ (número, como 0xd9604c) como cor de CSS ("#d9604c")
export function corCss(numero) {
  return Number.isInteger(numero) ? `#${numero.toString(16).padStart(6, '0')}` : undefined
}

// ---------- Trilha e Esc (ajustes de 14/10/2026) ----------

// A tela de cima (dados/telas.js, "pai"): para onde o Voltar e o Esc levam. '*' é a tela de onde se veio. null: o Esc não
// sai desta tela (Tela inicial, Reino, partida, a narrativa e a escolha da classe do começo).
export function telaDeCima(tela, anteriores = []) {
  const pai = telas[tela]?.pai ?? null
  if (pai !== '*') return pai
  const anterior = anteriores.at(-1)
  return anterior && anterior !== tela ? anterior : 'reino'
}

// A trilha do alto da tela, da de cima para a atual: [{ id, nome }] (a última é a atual). "aba" (a aba aberta, como
// "Equipar") entra no fim, sem id. Nunca passa de 5 passos (protege de um ciclo nos dados).
export function trilhaDaTela(tela, anteriores = [], aba = null) {
  if (!telas[tela]) return []
  const trilha = [{ id: tela, nome: telas[tela].nome }]
  let atual = tela
  let resto = anteriores
  for (let passo = 0; passo < 5; passo++) {
    const pai = telaDeCima(atual, resto)
    if (!pai || !telas[pai] || trilha.some((item) => item.id === pai)) break
    trilha.unshift({ id: pai, nome: telas[pai].nome })
    // Ao subir pelo '*', o caminho de antes também sobe um passo
    resto = telas[atual].pai === '*' ? resto.slice(0, -1) : resto
    atual = pai
  }
  if (aba) trilha.push({ id: null, nome: aba })
  return trilha
}

// A dica da primeira visita aparece? (a tela tem dica e ainda não foi fechada neste navegador, ou o "?" reabriu)
export function dicaVisivel(tela, dicasVistas = [], reaberta = null, temDica = true) {
  if (!temDica) return false
  return reaberta === tela || !dicasVistas.includes(tela)
}
