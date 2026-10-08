import { describe, expect, it } from 'vitest'
import {
  areaLimpa,
  avancarAjuda,
  escolherAjudantes,
  estaAjudando,
  fimPorDesmaio,
  prazoAcabou,
  segundosRestantes,
  vidaAoLevantar,
} from './desmaio.js'

const prazo = 30000

describe('área limpa (decisão de 06/10)', () => {
  const caido = { x: 0, y: 0 }

  it('nenhum inimigo vivo a menos de 250 px: limpa', () => {
    expect(areaLimpa(caido, [{ x: 300, y: 0 }, { x: 0, y: 260 }], 250)).toBe(true)
  })

  it('um inimigo vivo dentro do raio: suja', () => {
    expect(areaLimpa(caido, [{ x: 200, y: 100 }], 250)).toBe(false)
  })

  it('inimigo morto não conta', () => {
    expect(areaLimpa(caido, [{ x: 10, y: 0, morto: true }], 250)).toBe(true)
  })
})

describe('os 30 segundos (RF43)', () => {
  it('a contagem desce de 30 a 0, arredondando para cima', () => {
    expect(segundosRestantes(1000, 1000, prazo)).toBe(30)
    expect(segundosRestantes(1000, 1001, prazo)).toBe(30)
    expect(segundosRestantes(1000, 7500, prazo)).toBe(24)
    expect(segundosRestantes(1000, 99999, prazo)).toBe(0)
  })

  it('o prazo acaba exatamente em 30 s', () => {
    expect(prazoAcabou(1000, 30999, prazo)).toBe(false)
    expect(prazoAcabou(1000, 31000, prazo)).toBe(true)
  })
})

describe('ajuda de 5 segundos', () => {
  const caido = { x: 0, y: 0, caido: true }
  const opcoes = (velocidadeQuerida) => ({ raioDaAjuda: 60, velocidadeQuerida })

  it('ajuda quem está de pé, parado e perto', () => {
    expect(estaAjudando({ x: 50, y: 0 }, caido, opcoes({ x: 0, y: 0 }))).toBe(true)
  })

  it('andando, longe, caído ou sendo o próprio caído não ajuda', () => {
    expect(estaAjudando({ x: 50, y: 0 }, caido, opcoes({ x: 200, y: 0 }))).toBe(false)
    expect(estaAjudando({ x: 90, y: 0 }, caido, opcoes({ x: 0, y: 0 }))).toBe(false)
    expect(estaAjudando({ x: 50, y: 0, caido: true }, caido, opcoes({ x: 0, y: 0 }))).toBe(false)
    expect(estaAjudando(caido, caido, opcoes({ x: 0, y: 0 }))).toBe(false)
  })

  it('o progresso sobe com ajudante e área limpa; volta a zero se a área sujar ou o ajudante sair', () => {
    let progresso = avancarAjuda(0, { temAjudante: true, limpa: true, ms: 16 })
    expect(progresso).toBe(16)
    progresso = avancarAjuda(4000, { temAjudante: true, limpa: true, ms: 1000 })
    expect(progresso).toBe(5000)
    expect(avancarAjuda(4000, { temAjudante: true, limpa: false, ms: 16 })).toBe(0)
    expect(avancarAjuda(4000, { temAjudante: false, limpa: true, ms: 16 })).toBe(0)
  })

  it('quem é levantado volta com cerca de 10% da vida (pelo menos 1)', () => {
    expect(vidaAoLevantar(120, 10)).toBe(12)
    expect(vidaAoLevantar(85, 10)).toBe(9)
    expect(vidaAoLevantar(5, 10)).toBe(1)
  })
})

describe('fim da partida por desmaio (RF47)', () => {
  const lider = (extra = {}) => ({ lider: true, caido: false, ...extra })
  const aliado = (extra = {}) => ({ lider: false, caido: false, ...extra })

  it('alguém de pé e o Líder bem: a partida continua', () => {
    expect(fimPorDesmaio([lider(), aliado({ caido: true, caidoDesde: 0 })], 99999, prazo)).toBeNull()
  })

  it('Líder caído há menos de 30 s: continua; há 30 s: Retorno forçado', () => {
    const grupo = [lider({ caido: true, caidoDesde: 1000 }), aliado()]
    expect(fimPorDesmaio(grupo, 30999, prazo)).toBeNull()
    expect(fimPorDesmaio(grupo, 31000, prazo)).toEqual({ como: 'liderNaoLevantado', resultado: 'retornoForcado', motivo: 'Líder não levantado em 30 s' })
  })

  it('todos caídos: Derrota na hora, mesmo antes dos 30 s', () => {
    const grupo = [lider({ caido: true, caidoDesde: 1000 }), aliado({ caido: true, caidoDesde: 2000 })]
    expect(fimPorDesmaio(grupo, 2001, prazo)).toEqual({ como: 'todosDesmaiaram', resultado: 'derrota', motivo: 'Todos os personagens desmaiaram' })
  })

  it('com um personagem só, cair já é Derrota', () => {
    expect(fimPorDesmaio([lider({ caido: true, caidoDesde: 0 })], 1, prazo).resultado).toBe('derrota')
  })
})

describe('quem ajuda quem (TASK-045)', () => {
  const caidoLider = { id: 'lider', lider: true, caidoDesde: 5000, x: 0, y: 0 }
  const caidoTanque = { id: 'tanque', lider: false, caidoDesde: 1000, x: 500, y: 0 }

  it('com o Líder e o Tanque caídos, o Sacerdote vai no Líder primeiro (critério do card)', () => {
    const disponiveis = [
      { id: 'guerreiro', classe: 'guerreiro', x: 10, y: 0 },
      { id: 'sacerdote', classe: 'sacerdote', x: 480, y: 0 },
    ]
    expect(escolherAjudantes([caidoTanque, caidoLider], disponiveis)).toEqual([
      { ajudante: 'sacerdote', caido: 'lider' },
      { ajudante: 'guerreiro', caido: 'tanque' },
    ])
  })

  it('sem Sacerdote, vai o mais perto; cada um ajuda um só', () => {
    const disponiveis = [
      { id: 'mago', classe: 'mago', x: 400, y: 0 },
      { id: 'arqueiro', classe: 'arqueiro', x: 50, y: 0 },
    ]
    expect(escolherAjudantes([caidoLider, caidoTanque], disponiveis)).toEqual([
      { ajudante: 'arqueiro', caido: 'lider' },
      { ajudante: 'mago', caido: 'tanque' },
    ])
  })

  it('entre aliados caídos, quem tem menos tempo vem primeiro; sem ninguém livre, sobra caído sem ajudante', () => {
    const outro = { id: 'mago', lider: false, caidoDesde: 3000, x: 0, y: 0 }
    expect(escolherAjudantes([outro, caidoTanque], [{ id: 'arqueiro', classe: 'arqueiro', x: 0, y: 0 }])).toEqual([
      { ajudante: 'arqueiro', caido: 'tanque' },
    ])
  })
})
