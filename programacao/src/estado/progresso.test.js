import { describe, expect, it } from 'vitest'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { normalizarPreferencias, preferenciasPadrao } from './preferencias.js'
import { normalizarProgresso, novoPersonagem, progressoInicial } from './progresso.js'

describe('novoPersonagem', () => {
  it('começa no nível 1, sem XP, com os atributos iniciais da classe, sem pontos livres nem equipamento, e com a primeira habilidade (gratuita) na tecla 1', () => {
    expect(novoPersonagem('tanque')).toEqual({
      classe: 'tanque',
      nivel: 1,
      xp: 0,
      atributos: atributosIniciaisDaClasse('tanque'),
      pontosDeAtributo: 0,
      pontosDeHabilidade: 0,
      habilidades: { provocacao: 1 },
      ativas: ['provocacao'],
      equipamento: {},
    })
  })
})

describe('normalizarProgresso', () => {
  it('não reconhece o que não é um progresso', () => {
    expect(normalizarProgresso(null)).toBeNull()
    expect(normalizarProgresso([])).toBeNull()
    expect(normalizarProgresso('oi')).toBeNull()
  })

  it('progresso vazio vira o inicial; progresso válido não muda', () => {
    expect(normalizarProgresso({})).toEqual(progressoInicial())
    const comMago = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }
    expect(normalizarProgresso(comMago)).toEqual(comMago)
  })

  it('save da etapa 3 (personagem sem atributos) ganha os atributos iniciais da classe', () => {
    const antigo = normalizarProgresso({ personagens: [{ classe: 'mago', nivel: 1, xp: 0 }], lider: 'mago' })
    expect(antigo.personagens[0]).toEqual(novoPersonagem('mago'))
  })

  const bagunca = normalizarProgresso({
    personagens: [
      { classe: 'mago', nivel: 5, xp: 30.7, atributos: { forca: 150, agilidade: -3, sabedoria: 'muita' }, pontosDeAtributo: 2 },
      { classe: 'mago', nivel: 9 },
      { classe: 'ninja' },
      'x',
      { classe: 'tanque', nivel: 500, xp: -3 },
    ],
    contratosTemporarios: [
      { classe: 'mago', partidasRestantes: 2 },
      { classe: 'arqueiro', partidasRestantes: 3 },
      { classe: 'arqueiro', partidasRestantes: 1 },
      { classe: 'sacerdote', partidasRestantes: 0 },
      { classe: 'guerreiro', partidasRestantes: 1.5 },
    ],
    lider: 'arqueiro',
    ouro: -50,
    mochila: [{ id: 'pocao', quantidade: 2 }, { item: 'pocao' }, 3, null],
    missaoAtiva: 'x',
    regioesDescobertas: { floresta: ['facil', 'facil', 'inicio', 'lua'], marte: ['facil'], tundra: [] },
    conquistas: [],
    estatisticas: { partidasJogadas: 3.9, monstrosDerrotados: 'muitos' },
    lixo: 1,
  })

  it('um personagem por classe, só classes que existem', () => {
    expect(bagunca.personagens.map((p) => p.classe)).toEqual(['mago', 'tanque'])
  })

  it('nível, XP e pontos corrigidos', () => {
    expect(bagunca.personagens[0]).toMatchObject({ nivel: 5, xp: 30, pontosDeAtributo: 2, pontosDeHabilidade: 0 })
    expect(bagunca.personagens[1]).toMatchObject({ nivel: 1, xp: 0 })
  })

  it('atributos ficam entre 0 e o máximo; o que não é número volta ao inicial da classe', () => {
    const iniciais = atributosIniciaisDaClasse('mago')
    expect(bagunca.personagens[0].atributos).toEqual({ ...iniciais, forca: 100, agilidade: 0 })
  })

  it('contratos: só classe sem permanente, sem repetir, com partidas inteiras maiores que zero', () => {
    expect(bagunca.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 3, nivel: 1 }])
  })

  it('Líder inválido vira o primeiro personagem; sem personagens, nenhum Líder', () => {
    expect(bagunca.lider).toBe('mago')
    expect(normalizarProgresso({ lider: 'mago' }).lider).toBeNull()
    const doisPersonagens = { personagens: [{ classe: 'mago' }, { classe: 'tanque' }], lider: 'tanque' }
    expect(normalizarProgresso(doisPersonagens).lider).toBe('tanque')
  })

  it('o resto é corrigido ou descartado', () => {
    expect(bagunca.ouro).toBe(0)
    expect(bagunca.mochila).toEqual([{ id: 'pocao', quantidade: 2 }])
    expect(bagunca.missaoAtiva).toBeNull()
    expect(bagunca.regioesDescobertas).toEqual({ floresta: ['facil'] })
    expect(bagunca.conquistas).toEqual({})
    expect(bagunca.estatisticas).toEqual({ partidasJogadas: 3, monstrosDerrotados: 0, bossesDerrotados: 0, grandesVitorias: 0, missoesEntregues: 0 })
    expect(bagunca).not.toHaveProperty('lixo')
  })
})

describe('habilidades, equipamento, missão e mochila (TASK-020)', () => {
  const personagem = (mudancas) => normalizarProgresso({ personagens: [{ classe: 'mago', ...mudancas }] }).personagens[0]

  it('habilidades: só as da árvore da classe que estão no beta, nível entre 1 e 5; a raiz nunca falta', () => {
    expect(personagem({ habilidades: { meteoro: 3, descargaEletrica: 9, explosaoDeFogo: 0, menteClara: 'x', tempestade: 2, giro: 4 } }).habilidades).toEqual({
      meteoro: 3,
      descargaEletrica: 5,
    })
    expect(personagem({ habilidades: { descargaEletrica: 2 } }).habilidades).toEqual({ descargaEletrica: 2, meteoro: 1 })
  })

  it('ativas: só ativas que o personagem aprendeu, sem repetir, no máximo 3', () => {
    const habilidades = { meteoro: 5, descargaEletrica: 1, explosaoDeFogo: 1, menteClara: 2 }
    expect(personagem({ habilidades, ativas: ['meteoro', 'meteoro', 'x', 'menteClara', 'descargaEletrica', 'explosaoDeFogo'] }).ativas).toEqual([
      'meteoro',
      'descargaEletrica',
      'explosaoDeFogo',
    ])
    expect(personagem({ habilidades: { meteoro: 2 }, ativas: [] }).ativas).toEqual([]) // o jogador tirou tudo das teclas
  })

  it('save de antes da Fase 4 (sem habilidades): a raiz no nível 1, na tecla 1', () => {
    expect(personagem({}).habilidades).toEqual({ meteoro: 1 })
    expect(personagem({}).ativas).toEqual(['meteoro'])
  })

  it('equipamento: só espaços que existem', () => {
    expect(personagem({ equipamento: { capacete: 'elmo', asa: 'pena', arma: '' } }).equipamento).toEqual({ capacete: 'elmo' })
  })

  it('missão: formato certo fica; errado vira nenhuma missão', () => {
    const missao = { id: 'm', tipo: 'matar', alvo: 'lobo', quantidade: 10, progresso: 15, recompensa: { ouro: 80, xp: -2 } }
    expect(normalizarProgresso({ missaoAtiva: missao }).missaoAtiva).toEqual({ ...missao, progresso: 10, recompensa: { ouro: 80, xp: 0 } })
    expect(normalizarProgresso({ missaoAtiva: { ...missao, tipo: 'dançar' } }).missaoAtiva).toBeNull()
    expect(normalizarProgresso({ missaoAtiva: { ...missao, quantidade: 0 } }).missaoAtiva).toBeNull()
  })

  it('mochila: id e quantidade inteira maior que zero', () => {
    const mochila = [{ id: 'pocao', quantidade: 2, lixo: 1 }, { id: '', quantidade: 1 }, { id: 'pele', quantidade: 0 }, { id: 'osso', quantidade: 1.5 }]
    expect(normalizarProgresso({ mochila }).mochila).toEqual([{ id: 'pocao', quantidade: 2 }])
  })

  it('mochila: o mesmo item duas vezes vira uma linha só (Fase 4)', () => {
    const mochila = [{ id: 'pocao', quantidade: 2 }, { id: 'pele', quantidade: 1 }, { id: 'pocao', quantidade: 3 }]
    expect(normalizarProgresso({ mochila }).mochila).toEqual([{ id: 'pocao', quantidade: 5 }, { id: 'pele', quantidade: 1 }])
  })

  it('contrato temporário guarda o nível; sem nível válido, nível 1', () => {
    const contratos = [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 300, extra: true }]
    expect(normalizarProgresso({ contratosTemporarios: contratos }).contratosTemporarios).toEqual([
      { classe: 'arqueiro', partidasRestantes: 2, nivel: 1 },
    ])
  })
})

describe('normalizarPreferencias (RF18)', () => {
  it('sem nada, o padrão', () => {
    expect(normalizarPreferencias(undefined)).toEqual(preferenciasPadrao)
  })

  it('válidas ficam; inválidas voltam ao padrão', () => {
    expect(normalizarPreferencias({ musica: false, som: true, mudo: true, tema: 'escuro' })).toEqual({ musica: false, som: true, mudo: true, tema: 'escuro' })
    expect(normalizarPreferencias({ musica: false, som: true, tema: 'escuro' }).mudo).toBe(false)
    expect(normalizarPreferencias({ musica: 'nao', som: 0, mudo: 'sim', tema: 'roxo' })).toEqual(preferenciasPadrao)
  })
})

describe('mapa descoberto no save (Fase 3)', () => {
  it('guarda a névoa em hexadecimal e as áreas; o que vem estragado é jogado fora sem travar', () => {
    const lido = normalizarProgresso({
      ...progressoInicial(),
      mapasDescobertos: {
        floresta: { nevoa: '0fa3', areas: ['clareiraDasFlores', 'clareiraDasFlores', 7, ''] },
        deserto: { nevoa: 'NÃO É HEX', areas: [] },
        marte: { nevoa: 'ff', areas: ['x'] },
      },
    })
    expect(lido.mapasDescobertos).toEqual({ floresta: { nevoa: '0fa3', areas: ['clareiraDasFlores'] } })
  })

  it('save antigo, sem o campo: começa vazio', () => {
    const { mapasDescobertos, ...semCampo } = progressoInicial()
    expect(mapasDescobertos).toEqual({})
    expect(normalizarProgresso(semCampo).mapasDescobertos).toEqual({})
  })
})
