import { describe, expect, it } from 'vitest'
import { conquistas } from '../dados/conquistas.js'
import { floresta } from '../dados/mundo/floresta.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { aplicarConquistas, avisoDaConquista, conquistaConcluida, progressoDaConquista } from './conquistas.js'

const conquista = (id) => conquistas.find((uma) => uma.id === id)
const com = (mudancas) => ({ ...progressoInicial(), personagens: [novoPersonagem('mago')], ...mudancas })
const estatisticas = (mudancas) => ({ ...progressoInicial().estatisticas, ...mudancas })

describe('lista de conquistas (TASK-103, provisória até a TASK-015)', () => {
  it('ids únicos, metas positivas e recompensa sem números absurdos; inclui os exemplos do Conceito §13', () => {
    expect(new Set(conquistas.map((uma) => uma.id)).size).toBe(conquistas.length)
    for (const uma of conquistas) {
      expect(uma.condicao.meta > 0, uma.id).toBe(true)
      expect((uma.recompensa?.ouro ?? 0) <= 5000, uma.id).toBe(true)
    }
    expect(conquista('quedaDoGuardiao').condicao).toMatchObject({ campo: 'bossesDerrotados', meta: 1 })
    expect(conquista('lendaDaFloresta').condicao.meta).toBe(10000)
    expect(conquista('mestre').condicao).toEqual({ tipo: 'nivel', meta: 100 })
  })

  it('o Explorador pede todas as áreas da Floresta', () => {
    expect(conquista('explorador').condicao.meta).toBe(floresta.areas.length)
  })
})

describe('progresso e conclusão (TASK-103)', () => {
  it('o progresso sai das estatísticas, do nível, das áreas, das classes e do ouro', () => {
    expect(progressoDaConquista(com({ estatisticas: estatisticas({ monstrosDerrotados: 37 }) }), conquista('cacador'))).toEqual({ atual: 37, meta: 50 })
    expect(progressoDaConquista(com({ estatisticas: estatisticas({ monstrosDerrotados: 99 }) }), conquista('cacador'))).toEqual({ atual: 50, meta: 50 })
    expect(progressoDaConquista(com({ personagens: [{ ...novoPersonagem('mago'), nivel: 7 }] }), conquista('aventureiro')).atual).toBe(7)
    expect(progressoDaConquista(com({ mapasDescobertos: { floresta: { nevoa: '', areas: ['a', 'b'] } } }), conquista('explorador')).atual).toBe(2)
    expect(progressoDaConquista(com({ ouro: 1500 }), conquista('cofreCheio')).atual).toBe(1500)
  })

  it('critério do card: derrotar um Boss conclui a conquista, a recompensa entra uma vez só', () => {
    const antes = com({ ouro: 10, estatisticas: estatisticas({ bossesDerrotados: 1 }) })
    const { progresso, novas } = aplicarConquistas(antes)
    expect(novas.map((uma) => uma.id)).toEqual(['quedaDoGuardiao'])
    expect(conquistaConcluida(progresso, 'quedaDoGuardiao')).toBe(true)
    expect(progresso.ouro).toBe(10 + 200)
    const deNovo = aplicarConquistas(progresso)
    expect(deNovo.novas).toEqual([])
    expect(deNovo.progresso).toBe(progresso) // nada muda
    expect(avisoDaConquista(conquista('quedaDoGuardiao'))).toBe('Conquista: Queda do Guardião (+200 de ouro)')
    expect(avisoDaConquista(conquista('cofreCheio'))).toBe('Conquista: Cofre cheio')
  })

  it('várias de uma vez somam as recompensas', () => {
    const { novas, progresso } = aplicarConquistas(com({ ouro: 0, estatisticas: estatisticas({ partidasJogadas: 1, monstrosDerrotados: 60 }) }))
    expect(novas.map((uma) => uma.id).sort()).toEqual(['cacador', 'primeirosPassos'])
    expect(progresso.ouro).toBe(120)
  })
})
