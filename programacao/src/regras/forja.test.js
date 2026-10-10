import { describe, expect, it } from 'vitest'
import { equipamentoDosTemporarios } from '../dados/forja.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { podeEquipar } from './equipamento.js'
import { comprarNaForja, desequipar, equipar, espacosDoPersonagem, fabricar, venderNaForja } from './forja.js'
import { precoDeVenda } from './mercado.js'

const com = (mudancas) => ({ ...progressoInicial(), personagens: [novoPersonagem('guerreiro'), novoPersonagem('mago')], ...mudancas })

describe('Forja: equipar (TASK-075)', () => {
  it('equipa da Mochila; a peça antiga volta para ela', () => {
    let p = com({ mochila: [{ id: 'capuzDeCouro', quantidade: 1 }, { id: 'elmoDeFerro', quantidade: 1 }] })
    p = equipar(p, 'guerreiro', 'capuzDeCouro').progresso
    expect(p.personagens[0].equipamento).toEqual({ capacete: 'capuzDeCouro' })
    expect(p.mochila).toEqual([{ id: 'elmoDeFerro', quantidade: 1 }])
    const troca = equipar(p, 'guerreiro', 'elmoDeFerro')
    expect(troca.progresso.personagens[0].equipamento).toEqual({ capacete: 'elmoDeFerro' })
    expect(troca.progresso.mochila).toEqual([{ id: 'capuzDeCouro', quantidade: 1 }])
    expect(troca.mensagem).toBe('Guerreiro equipou Elmo de ferro (Capuz de couro voltou para a Mochila).')
  })

  it('critério do card: arma de Mago no Guerreiro não dá', () => {
    const p = com({ mochila: [{ id: 'cajadoDeCarvalho', quantidade: 1 }] })
    expect(equipar(p, 'guerreiro', 'cajadoDeCarvalho')).toEqual({ ok: false, motivo: 'Cajado de carvalho é só para Mago.' })
    expect(equipar(p, 'mago', 'cajadoDeCarvalho').ok).toBe(true)
  })

  it('sem o item na Mochila, ou sem o personagem permanente, não dá', () => {
    expect(equipar(com({}), 'guerreiro', 'espadaCurta').ok).toBe(false)
    expect(equipar(com({ mochila: [{ id: 'espadaCurta', quantidade: 1 }] }), 'tanque', 'espadaCurta').motivo).toContain('permanentes')
  })

  it('tirar devolve para a Mochila', () => {
    const p = { ...com({}), personagens: [{ ...novoPersonagem('guerreiro'), equipamento: { arma: 'espadaCurta' } }] }
    const r = desequipar(p, 'guerreiro', 'arma')
    expect(r.progresso.personagens[0].equipamento).toEqual({})
    expect(r.progresso.mochila).toEqual([{ id: 'espadaCurta', quantidade: 1 }])
    expect(desequipar(r.progresso, 'guerreiro', 'arma').ok).toBe(false)
  })

  it('os espaços do personagem, com o que está em cada um', () => {
    const espacos = espacosDoPersonagem({ ...novoPersonagem('guerreiro'), equipamento: { arma: 'espadaCurta' } })
    expect(espacos).toHaveLength(7)
    expect(espacos.find((espaco) => espaco.id === 'arma').item).toBe('espadaCurta')
    expect(espacos.find((espaco) => espaco.id === 'botas').item).toBeNull()
  })
})

describe('Forja: comprar, vender e fabricar (TASK-075)', () => {
  it('comprar desconta o ouro; sem ouro ou fora da loja, não', () => {
    const r = comprarNaForja(com({ ouro: 200 }), 'espadaCurta')
    expect(r.progresso.ouro).toBe(80)
    expect(r.progresso.mochila).toEqual([{ id: 'espadaCurta', quantidade: 1 }])
    expect(comprarNaForja(com({ ouro: 50 }), 'espadaCurta').motivo).toBe('Ouro insuficiente: custa 120 e você tem 50.')
    expect(comprarNaForja(com({ ouro: 9999 }), 'peitoralDeFerro').ok).toBe(false) // só por receita
  })

  it('vender só equipamento da Mochila (o equipado precisa ser tirado antes)', () => {
    const r = venderNaForja(com({ ouro: 0, mochila: [{ id: 'espadaCurta', quantidade: 1 }] }), 'espadaCurta')
    expect(r.progresso.ouro).toBe(precoDeVenda('espadaCurta'))
    expect(r.progresso.mochila).toEqual([])
    expect(venderNaForja(com({ mochila: [{ id: 'pocaoDeVida', quantidade: 1 }] }), 'pocaoDeVida').ok).toBe(false)
    expect(venderNaForja(com({}), 'espadaCurta').motivo).toContain('tirado antes')
  })

  it('critério do card: com os materiais, fabricar consome materiais e ouro e o equipamento aparece', () => {
    const p = com({ ouro: 100, mochila: [{ id: 'minerioDeFerro', quantidade: 4 }, { id: 'peleDeLobo', quantidade: 1 }] })
    const r = fabricar(p, 'elmoDeFerro')
    expect(r.ok).toBe(true)
    expect(r.progresso.ouro).toBe(20)
    expect(r.progresso.mochila).toEqual([{ id: 'minerioDeFerro', quantidade: 1 }, { id: 'elmoDeFerro', quantidade: 1 }])
  })

  it('sem materiais diz o que falta; sem ouro, quanto falta', () => {
    expect(fabricar(com({ ouro: 100, mochila: [{ id: 'minerioDeFerro', quantidade: 1 }] }), 'elmoDeFerro').motivo).toBe(
      'Faltam 2 Minério de ferro e 1 Pele de lobo.',
    )
    expect(fabricar(com({ ouro: 10, mochila: [{ id: 'minerioDeFerro', quantidade: 3 }, { id: 'peleDeLobo', quantidade: 1 }] }), 'elmoDeFerro').motivo).toBe(
      'Ouro insuficiente: a receita pede 80 e você tem 10.',
    )
    expect(fabricar(com({}), 'naoExiste').ok).toBe(false)
  })

  it('o equipamento fixo dos temporários existe e serve para a classe', () => {
    for (const [classe, kit] of Object.entries(equipamentoDosTemporarios)) {
      for (const [espaco, id] of Object.entries(kit)) {
        const item = itemDoCatalogo(id)
        expect(item?.espaco, `${classe}: ${id}`).toBe(espaco)
        expect(podeEquipar(item, classe).ok, `${classe}: ${id}`).toBe(true)
      }
    }
  })
})
