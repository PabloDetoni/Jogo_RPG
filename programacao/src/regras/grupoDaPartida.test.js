import { describe, expect, it, vi } from 'vitest'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { capacidadeDaPartida, classesQueFaltam, membroDeTeste, montarGrupoDaPartida, trocarClasseDoLider } from './grupoDaPartida.js'
import { capacidadeDaMochila } from './mochila.js'
import { manaMaxima, manaPorSegundo } from './habilidades.js'

vi.mock('../dados/balanceamento.js', async (importarOriginal) => {
  const original = await importarOriginal()
  return { ...original, combateDeTeste: { ...original.combateDeTeste, vidaPorPontoDeVitalidade: 10 } }
})

const comVitalidade = (classe, vitalidade) => {
  const personagem = novoPersonagem(classe)
  return { ...personagem, atributos: { ...personagem.atributos, vitalidade } }
}

describe('montarGrupoDaPartida (RF34)', () => {
  it('todos os permanentes e os temporários vão, com o Líder primeiro', () => {
    const progresso = {
      ...progressoInicial(),
      personagens: [comVitalidade('mago', 8), comVitalidade('tanque', 20)],
      contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }],
    }
    const grupo = montarGrupoDaPartida(progresso, 'tanque')
    expect(grupo.map(({ classe, vidaMaxima, lider, temporario }) => ({ classe, vidaMaxima, lider, temporario }))).toEqual([
      { classe: 'tanque', vidaMaxima: 200, lider: true, temporario: false },
      { classe: 'mago', vidaMaxima: 80, lider: false, temporario: false },
      { classe: 'arqueiro', vidaMaxima: 60, lider: false, temporario: true },
    ])
  })

  it('a vida vem da Vitalidade do personagem, não da classe', () => {
    const progresso = { ...progressoInicial(), personagens: [comVitalidade('mago', 25)] }
    expect(montarGrupoDaPartida(progresso, 'mago')[0].vidaMaxima).toBe(250)
  })

  it('a mana vem da Inteligência e a volta dela, da Sabedoria (TASK-046)', () => {
    const mago = novoPersonagem('mago')
    const sabio = { ...mago, atributos: { ...mago.atributos, inteligencia: 30, sabedoria: 40 } }
    const [membro] = montarGrupoDaPartida({ ...progressoInicial(), personagens: [sabio] }, 'mago')
    expect(membro.manaMaxima).toBe(manaMaxima(30))
    expect(membro.manaPorSegundo).toBeCloseTo(manaPorSegundo(40))
    const [doMago] = montarGrupoDaPartida({ ...progressoInicial(), personagens: [mago] }, 'mago')
    expect(membro.manaMaxima).toBeGreaterThan(doMago.manaMaxima)
  })

  it('cada membro leva o nível e o XP do save (para o aviso de "subiu de nível") e o crítico pela Agilidade', () => {
    const guerreiro = { ...novoPersonagem('guerreiro'), nivel: 29, xp: 2899 }
    const arqueiro = novoPersonagem('arqueiro')
    const progresso = { ...progressoInicial(), personagens: [guerreiro, arqueiro], contratosTemporarios: [] }
    const [lider, aliado] = montarGrupoDaPartida(progresso, 'guerreiro')
    expect(lider).toMatchObject({ classe: 'guerreiro', nivel: 29, xp: 2899 })
    expect(lider.chanceDeCritico).toBeCloseTo(0.05 + 13 * 0.005)
    expect(aliado.chanceDeCritico).toBeCloseTo(0.05 + 22 * 0.005) // Arqueiro: o crítico mais alto
    expect(membroDeTeste('mago')).toMatchObject({ nivel: 1, xp: 0 })
  })

  it('sem nenhum personagem (painel de desenvolvimento), entra um Líder de teste', () => {
    expect(montarGrupoDaPartida(progressoInicial(), null)).toEqual([membroDeTeste('guerreiro', true)])
  })

  it('Líder que não está no grupo: o primeiro vira o Líder', () => {
    const progresso = { ...progressoInicial(), personagens: [novoPersonagem('mago')] }
    expect(montarGrupoDaPartida(progresso, 'tanque')[0]).toMatchObject({ classe: 'mago', lider: true })
  })
})

describe('barra de teste: encher o grupo e trocar o Líder', () => {
  const grupo = [membroDeTeste('mago', true), membroDeTeste('tanque')]

  it('classesQueFaltam: as classes que ainda não estão no grupo', () => {
    expect(classesQueFaltam(grupo)).toEqual(['guerreiro', 'sacerdote', 'arqueiro'])
  })

  it('trocar para a classe de um aliado: os dois trocam de papel', () => {
    const trocado = trocarClasseDoLider(grupo, 'tanque')
    expect(trocado.map((m) => [m.classe, m.lider])).toEqual([
      ['mago', false],
      ['tanque', true],
    ])
  })

  it('trocar para uma classe fora do grupo: o Líder só muda de classe', () => {
    const trocado = trocarClasseDoLider(grupo, 'arqueiro')
    expect(trocado.map((m) => [m.classe, m.lider])).toEqual([
      ['arqueiro', true],
      ['tanque', false],
    ])
  })

  it('trocar para a mesma classe não muda nada', () => {
    expect(trocarClasseDoLider(grupo, 'mago')).toBe(grupo)
  })
})

describe('nível de cada um na partida (decide a IA, 5b.1)', () => {
  it('permanente com o nível do save; temporário com o do contrato; de teste no nível 1', () => {
    const mago = { ...novoPersonagem('mago'), nivel: 42 }
    const progresso = { ...progressoInicial(), personagens: [mago], contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }] }
    const grupo = montarGrupoDaPartida(progresso, 'mago')
    expect(grupo.map((membro) => [membro.classe, membro.nivel])).toEqual([
      ['mago', 42],
      ['arqueiro', 5],
    ])
    expect(membroDeTeste('tanque').nivel).toBe(1)
  })
})

describe('Força de cada membro (capacidade da mochila, RF33)', () => {
  it('cada membro leva a Força dele (a do save, ou a inicial da classe)', () => {
    const progresso = { ...progressoInicial(), personagens: [{ ...novoPersonagem('tanque'), atributos: { ...novoPersonagem('tanque').atributos, forca: 30 } }], lider: 'tanque' }
    const [tanque] = montarGrupoDaPartida(progresso, 'tanque')
    expect(tanque.forca).toBe(30)
  })
})

describe('capacidade da mochila da partida na Preparação (TASK-073)', () => {
  it('é a Força de todo o grupo que vai (permanentes e temporários) × a capacidade por ponto', () => {
    const progresso = {
      ...progressoInicial(),
      personagens: [novoPersonagem('mago'), novoPersonagem('tanque')],
      contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }],
      lider: 'tanque',
    }
    const forcas = ['mago', 'tanque', 'arqueiro'].map((classe) => atributosIniciaisDaClasse(classe).forca)
    expect(capacidadeDaPartida(progresso, 'tanque')).toBe(capacidadeDaMochila(forcas))
  })
})
