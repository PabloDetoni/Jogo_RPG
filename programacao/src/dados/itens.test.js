import { describe, expect, it } from 'vitest'
import { mercado } from './balanceamento.js'
import { classes } from './classes.js'
import { espacosDeEquipamento } from './equipamento.js'
import { aVendaNaForja, receitas } from './forja.js'
import { funcaoDoItem, itemDoCatalogo, itens, nomesDasRaridades, usavelNaPartida } from './itens.js'
import { ofertasFixas, ofertasRotativas, trocas } from './mercado.js'

const todos = Object.values(itens)
const tipos = ['recurso', 'material', 'consumivel', 'utilitario', 'equipamento']
const atributosValidos = new Set(['vitalidade', 'forca', 'sabedoria', 'inteligencia', 'agilidade'])
const venda = (id, quantidade = 1) => Math.floor(itemDoCatalogo(id).preco * mercado.fracaoDaVenda) * quantidade
const compraveis = new Set([...ofertasFixas, ...ofertasRotativas, ...aVendaNaForja])

describe('catálogo do beta (TASK-070, provisório)', () => {
  it('busca por id: nome, peso e preço; id inexistente devolve null sem travar', () => {
    expect(itemDoCatalogo('peleDeLobo')).toMatchObject({ id: 'peleDeLobo', nome: 'Pele de lobo', peso: 2, preco: 8 })
    expect(itemDoCatalogo('naoExiste')).toBeNull()
    expect(itemDoCatalogo('toString')).toBeNull()
    expect(itemDoCatalogo(undefined)).toBeNull()
    expect(itemDoCatalogo(42)).toBeNull()
  })

  it('todo item tem nome, tipo, raridade, descrição, função, peso inteiro e preço sem números absurdos', () => {
    for (const item of todos) {
      expect(item.nome.length, item.id).toBeGreaterThan(2)
      expect(tipos, item.id).toContain(item.tipo)
      expect(Object.keys(nomesDasRaridades), item.id).toContain(item.raridade)
      expect(item.descricao.length, item.id).toBeGreaterThan(5)
      expect(funcaoDoItem(item).length, item.id).toBeGreaterThan(5)
      expect(Number.isInteger(item.peso) && item.peso >= 1 && item.peso <= 20, item.id).toBe(true)
      expect(Number.isInteger(item.preco) && item.preco >= 1 && item.preco <= 10000, item.id).toBe(true)
    }
  })

  it('consumível e utilitário têm efeito com números razoáveis; só o consumível é usado na partida', () => {
    for (const item of todos.filter((um) => um.tipo === 'consumivel' || um.tipo === 'utilitario')) {
      expect(item.efeito, item.id).toBeDefined()
      const { efeito } = item
      if (efeito.tipo === 'vida' || efeito.tipo === 'mana') expect(efeito.fracao > 0 && efeito.fracao <= 1, item.id).toBe(true)
      if (efeito.tipo === 'velocidade') expect(efeito.multiplicador > 1 && efeito.multiplicador <= 2 && efeito.ms <= 60000, item.id).toBe(true)
      if (efeito.tipo === 'recarga') expect(efeito.multiplicador >= 0.4 && efeito.multiplicador < 1 && efeito.ms <= 60000, item.id).toBe(true)
      expect(usavelNaPartida(item), item.id).toBe(item.tipo === 'consumivel')
    }
    expect(usavelNaPartida(itemDoCatalogo('peleDeLobo'))).toBe(false)
    expect(usavelNaPartida(null)).toBe(false)
  })

  it('equipamento: espaço que existe, armadura para todas as classes, arma e escudo só de classes que existem', () => {
    const ids = new Set(classes.map((classe) => classe.id))
    for (const item of todos.filter((um) => um.tipo === 'equipamento')) {
      const espaco = espacosDeEquipamento.find((um) => um.id === item.espaco)
      expect(espaco, item.id).toBeDefined()
      if (espaco.armadura) expect(item.classes, item.id).toBe('todas')
      else expect(item.classes.length > 0 && item.classes.every((classe) => ids.has(classe)), item.id).toBe(true)
      for (const [atributo, valor] of Object.entries(item.bonus ?? {})) {
        expect(atributosValidos.has(atributo), `${item.id}: ${atributo}`).toBe(true)
        expect(Number.isInteger(valor) && valor >= 1 && valor <= 15, item.id).toBe(true)
      }
      expect((item.defesa ?? 0) >= 0 && (item.defesa ?? 0) <= 15, item.id).toBe(true)
      expect((item.reducaoDeRecarga ?? 0) >= 0 && (item.reducaoDeRecarga ?? 0) <= 0.2, item.id).toBe(true)
    }
  })

  it('cada classe tem pelo menos uma arma, e há armadura comum para todos os espaços de armadura', () => {
    for (const classe of classes) {
      expect(todos.some((item) => item.espaco === 'arma' && item.raridade !== 'teste' && item.classes.includes?.(classe.id)), classe.id).toBe(true)
    }
    for (const espaco of espacosDeEquipamento.filter((um) => um.armadura)) {
      expect(todos.some((item) => item.espaco === espaco.id && item.raridade === 'comum'), espaco.id).toBe(true)
    }
  })

  it('o equipamento de teste cobre todos os espaços (para testar a Forja)', () => {
    const deTeste = todos.filter((item) => item.raridade === 'teste')
    expect(deTeste.map((item) => item.espaco).sort()).toEqual(espacosDeEquipamento.map((espaco) => espaco.id).sort())
  })

  it('a função de cada item fala o que ele faz', () => {
    expect(funcaoDoItem(itemDoCatalogo('pocaoDeVida'))).toContain('40% da vida')
    expect(funcaoDoItem(itemDoCatalogo('pocaoDeVida'))).toContain('Não levanta quem desmaiou')
    expect(funcaoDoItem(itemDoCatalogo('tonicoLigeiro'))).toContain('25% mais rápido por 20 s')
    expect(funcaoDoItem(itemDoCatalogo('elixirDoFoco'))).toContain('30% mais rápidas')
    expect(funcaoDoItem(itemDoCatalogo('botasDeVento'))).toBe('Botas · Agilidade +3 · Recarga −5% · todas as classes')
    expect(funcaoDoItem(itemDoCatalogo('cajadoDeCarvalho'))).toBe('Arma · Inteligência +3 · só Mago')
    expect(funcaoDoItem(null)).toBe('')
  })
})

describe('Forja e Mercado usam só itens que existem, sem ouro infinito', () => {
  it('a Forja vende só equipamento, e as receitas fabricam equipamento com materiais que existem', () => {
    for (const id of aVendaNaForja) expect(itemDoCatalogo(id)?.tipo, id).toBe('equipamento')
    const resultados = receitas.map((receita) => receita.resultado)
    expect(new Set(resultados).size).toBe(resultados.length)
    for (const receita of receitas) {
      expect(itemDoCatalogo(receita.resultado)?.tipo, receita.resultado).toBe('equipamento')
      expect(Object.keys(receita.materiais).length, receita.resultado).toBeGreaterThan(0)
      for (const [id, quantidade] of Object.entries(receita.materiais)) {
        expect(itemDoCatalogo(id), `${receita.resultado}: ${id}`).not.toBeNull()
        expect(Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= 20).toBe(true)
      }
      expect(Number.isInteger(receita.ouro) && receita.ouro >= 0).toBe(true)
    }
  })

  it('o Mercado não vende equipamento (só a Forja), e as ofertas e trocas citam itens que existem', () => {
    for (const id of [...ofertasFixas, ...ofertasRotativas]) {
      expect(itemDoCatalogo(id), id).not.toBeNull()
      expect(itemDoCatalogo(id).tipo, id).not.toBe('equipamento')
    }
    expect(ofertasRotativas.length).toBeGreaterThanOrEqual(mercado.rotativasAVenda)
    expect(ofertasFixas).toContain('pergaminhoDeRedefinicao')
    for (const troca of trocas) {
      for (const id of [...Object.keys(troca.dar), ...Object.keys(troca.receber)]) {
        expect(itemDoCatalogo(id), `${troca.id}: ${id}`).not.toBeNull()
        expect(itemDoCatalogo(id).tipo, `${troca.id}: ${id}`).not.toBe('equipamento')
      }
    }
  })

  it('vender sempre rende menos que comprar', () => {
    expect(mercado.fracaoDaVenda).toBeGreaterThan(0)
    expect(mercado.fracaoDaVenda).toBeLessThan(1)
  })

  it('nenhuma troca dá lucro: comprar o que ela pede custa pelo menos o que se ganha vendendo o que ela dá', () => {
    for (const troca of trocas) {
      const pedeSoCompraveis = Object.keys(troca.dar).every((id) => compraveis.has(id))
      if (!pedeSoCompraveis) continue
      const custo = Object.entries(troca.dar).reduce((soma, [id, quantidade]) => soma + itemDoCatalogo(id).preco * quantidade, 0)
      const ganho = Object.entries(troca.receber).reduce((soma, [id, quantidade]) => soma + venda(id, quantidade), 0)
      expect(custo, troca.id).toBeGreaterThanOrEqual(ganho)
    }
  })

  it('nenhuma receita dá lucro: comprar os materiais e pagar o ouro custa pelo menos a venda do equipamento', () => {
    for (const receita of receitas) {
      const materiaisCompraveis = Object.keys(receita.materiais).every((id) => compraveis.has(id))
      if (!materiaisCompraveis) continue
      const custo = receita.ouro + Object.entries(receita.materiais).reduce((soma, [id, quantidade]) => soma + itemDoCatalogo(id).preco * quantidade, 0)
      expect(custo, receita.resultado).toBeGreaterThanOrEqual(venda(receita.resultado))
    }
  })
})
