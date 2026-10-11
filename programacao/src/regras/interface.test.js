import { describe, expect, it } from 'vitest'
import { acoes, coresDasRaridades, filtrosDeItens } from '../dados/interface.js'
import { itens, nomesDasRaridades } from '../dados/itens.js'
import { ajudaDasTelas } from '../dados/ajuda.js'
import { telas } from '../dados/telas.js'
import {
  catalogoDoBeta,
  comparacaoDeEquipamento,
  contarPorFiltro,
  filtrarItens,
  itemPassaNoFiltro,
  ordenarItens,
  origensDoItem,
  registrarItensVistos,
} from './interface.js'

const arqueiro = {
  classe: 'arqueiro',
  atributos: { vitalidade: 6, forca: 10, sabedoria: 6, inteligencia: 6, agilidade: 22 },
  equipamento: {},
}

describe('interface: dados do padrão visual (Fase 4.5)', () => {
  it('toda ação tem cor e símbolo, e as cores não se repetem entre ações diferentes (menos equipar e tirar)', () => {
    for (const [id, acao] of Object.entries(acoes)) expect(acao.cor && acao.simbolo, id).toBeTruthy()
    const cores = Object.entries(acoes)
      .filter(([id]) => !['tirar', 'entregar'].includes(id))
      .map(([, acao]) => acao.cor)
    expect(new Set(cores).size).toBe(cores.length)
  })

  it('toda raridade do catálogo tem cor de borda', () => {
    for (const raridade of Object.keys(nomesDasRaridades)) expect(coresDasRaridades[raridade], raridade).toBeTruthy()
  })

  it('o "?" só existe para telas que existem, com pelo menos uma frase', () => {
    for (const [id, linhas] of Object.entries(ajudaDasTelas)) {
      expect(telas[id], id).toBeDefined()
      expect(linhas.length).toBeGreaterThan(0)
    }
  })
})

describe('interface: filtros e ordem das grades', () => {
  const mochila = [{ id: 'madeira' }, { id: 'pocaoDeVida' }, { id: 'coroaDeRaizes' }, { id: 'pergaminhoDeRedefinicao' }, { id: 'peleDeLobo' }, { id: 'itemQueSumiu' }]

  it('cada filtro pega o seu tipo; "Especiais" pega o utilitário e a raridade especial', () => {
    expect(filtrarItens(mochila, 'consumiveis').map((item) => item.id)).toEqual(['pocaoDeVida'])
    expect(filtrarItens(mochila, 'materiais').map((item) => item.id)).toEqual(['madeira', 'peleDeLobo'])
    expect(filtrarItens(mochila, 'equipamentos').map((item) => item.id)).toEqual(['coroaDeRaizes'])
    expect(filtrarItens(mochila, 'especiais').map((item) => item.id)).toEqual(['coroaDeRaizes', 'pergaminhoDeRedefinicao'])
  })

  it('item fora do catálogo (save antigo) aparece só em "Todos", sem travar', () => {
    expect(filtrarItens(mochila, 'todos')).toHaveLength(6)
    expect(itemPassaNoFiltro(null, 'consumiveis')).toBe(false)
    expect(contarPorFiltro(mochila)).toEqual({ todos: 6, consumiveis: 1, materiais: 2, equipamentos: 1, especiais: 2 })
  })

  it('todo filtro tem nome', () => {
    for (const filtro of filtrosDeItens) expect(filtro.nome).toBeTruthy()
  })

  it('ordem: consumíveis, utilitários, equipamento, materiais e recursos; no mesmo tipo, pelo nome', () => {
    expect(ordenarItens([{ id: 'madeira' }, { id: 'peleDeLobo' }, { id: 'pocaoDeMana' }, { id: 'pocaoDeVida' }, { id: 'coroaDeRaizes' }]).map((item) => item.id)).toEqual([
      'pocaoDeMana',
      'pocaoDeVida',
      'coroaDeRaizes',
      'peleDeLobo',
      'madeira',
    ])
  })
})

describe('interface: comparação antes de equipar (Forja)', () => {
  it('mostra o atributo antes e depois e a defesa', () => {
    const comparacao = comparacaoDeEquipamento(arqueiro, 'capacete', 'coroaDeRaizes')
    const linha = (id) => comparacao.linhas.find((uma) => uma.id === id)
    expect(linha('vitalidade')).toMatchObject({ antes: 6, depois: 12 })
    expect(linha('agilidade')).toMatchObject({ antes: 22, depois: 22 })
    expect(linha('defesa')).toMatchObject({ antes: 0, depois: 4 })
    expect(comparacao.substitui).toBeNull()
    expect(comparacao.serve.ok).toBe(true)
  })

  it('trocar uma peça pode descer um atributo; tirar mostra o que se perde', () => {
    const comCoroa = { ...arqueiro, equipamento: { capacete: 'coroaDeRaizes' } }
    const troca = comparacaoDeEquipamento(comCoroa, 'capacete', 'capuzDeCouro')
    expect(troca.substitui).toBe('coroaDeRaizes')
    expect(troca.linhas.find((linha) => linha.id === 'vitalidade').depois).toBeLessThan(12)
    const tirar = comparacaoDeEquipamento(comCoroa, 'capacete', null)
    expect(tirar.linhas.find((linha) => linha.id === 'defesa')).toMatchObject({ antes: 4, depois: 0 })
  })

  it('arma de outra classe: a comparação diz que não serve, com o motivo da regra', () => {
    const espada = comparacaoDeEquipamento(arqueiro, 'arma', 'espadaCurta')
    expect(espada.serve).toMatchObject({ ok: false, motivo: 'Espada curta é só para Guerreiro.' })
  })

  it('não muda o personagem (só mostra)', () => {
    const antes = JSON.stringify(arqueiro)
    comparacaoDeEquipamento(arqueiro, 'capacete', 'coroaDeRaizes')
    expect(JSON.stringify(arqueiro)).toBe(antes)
  })
})

describe('interface: Catálogo (de onde vem e o que já foi visto)', () => {
  it('cada item do beta diz de onde vem', () => {
    for (const { id } of catalogoDoBeta()) expect(origensDoItem(id).length, id).toBeGreaterThan(0)
    expect(origensDoItem('peleDeLobo')).toContain('Lobo (Floresta)')
    expect(origensDoItem('coroaDeRaizes')).toContain('Guardião da Floresta (raro)')
    expect(origensDoItem('cristal')).toContain('Minijogo: Mina (raro)')
    expect(origensDoItem('pocaoDeVida')).toContain('Mercado (sempre à venda)')
  })

  it('o catálogo não tem o equipamento de teste', () => {
    const ids = catalogoDoBeta().map((item) => item.id)
    expect(ids.some((id) => itens[id].raridade === 'teste')).toBe(false)
    expect(ids.length).toBe(Object.values(itens).filter((item) => item.raridade !== 'teste').length)
  })

  it('o que esteve na Mochila ou equipado fica visto (e continua visto depois de vender)', () => {
    const progresso = { mochila: [{ id: 'madeira', quantidade: 2 }, { id: 'naoExiste', quantidade: 1 }], personagens: [{ equipamento: { arma: 'arcoDeCaca' } }] }
    const visto = registrarItensVistos(progresso)
    expect(visto.itensVistos.sort()).toEqual(['arcoDeCaca', 'madeira'])
    const vendeu = registrarItensVistos({ ...visto, mochila: [] })
    expect(vendeu).toBe(registrarItensVistos(vendeu)) // nada novo: o mesmo objeto
    expect(vendeu.itensVistos).toContain('madeira')
  })
})
