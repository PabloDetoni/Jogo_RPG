import { describe, expect, it } from 'vitest'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { escreverArquivoDeSave, lerArquivoDeSave, versaoDoArquivo } from './arquivoDeSave.js'
import { migrarParaFormatoAtual } from './formato.js'

const progresso = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }
const partida = { bioma: 'floresta', pontoPartida: 'inicio', lider: 'mago', iniciadaEm: '2026-10-05T12:00:00Z' }
const texto = (partidaEmAndamento = null, versao = 4) =>
  escreverArquivoDeSave({ versao, salvoEm: '2026-10-05T12:00:00Z', progresso, partidaEmAndamento })

describe('lerArquivoDeSave', () => {
  it('nada salvo', () => {
    expect(lerArquivoDeSave(null)).toEqual({ situacao: 'vazio' })
  })

  it('ida e volta: o que é escrito é lido igual', () => {
    expect(lerArquivoDeSave(texto())).toEqual({
      situacao: 'carregado',
      progresso,
      partidaEmAndamento: null,
      partidaDescartada: false,
      versao: 4,
      salvoEm: '2026-10-05T12:00:00Z',
      versaoNoBanco: 0,
    })
  })

  it('cópia da conta: a versão do banco de onde partiu vai junto (RF11)', () => {
    const textoDaConta = escreverArquivoDeSave({ versao: 9, salvoEm: 'x', progresso, partidaEmAndamento: null, versaoNoBanco: 7 })
    expect(lerArquivoDeSave(textoDaConta).versaoNoBanco).toBe(7)
  })

  it('partida não terminada é descartada; o progresso é o do começo dela (RF11, RF12)', () => {
    const lido = lerArquivoDeSave(texto(partida))
    expect(lido.partidaDescartada).toBe(true)
    expect(lido.progresso).toEqual(progresso)
  })

  it.each([
    ['texto qualquer', 'isso não é um save'],
    ['sem formato', '{"versao":3}'],
    ['formato que não é número', '{"formato":"1"}'],
    ['formato zero', '{"formato":0,"progresso":{}}'],
    ['progresso inválido', '{"formato":1,"progresso":5}'],
    ['lista', '[1,2]'],
    ['null', 'null'],
  ])('save estragado (%s)', (_, estragado) => {
    expect(lerArquivoDeSave(estragado)).toEqual({ situacao: 'corrompido' })
  })

  it('save de uma versão mais nova do jogo é reconhecido', () => {
    expect(lerArquivoDeSave('{"formato":99,"progresso":{}}')).toEqual({ situacao: 'formatoNovo' })
  })

  it('versão estranha vira 0', () => {
    const lido = lerArquivoDeSave(JSON.stringify({ formato: 1, versao: -2, progresso: {} }))
    expect(lido.versao).toBe(0)
  })
})

describe('versaoDoArquivo', () => {
  it('lê a versão mesmo de um save estragado; sem versão, 0', () => {
    expect(versaoDoArquivo(texto(null, 7))).toBe(7)
    expect(versaoDoArquivo('{"versao":3}')).toBe(3)
    expect(versaoDoArquivo('lixo')).toBe(0)
    expect(versaoDoArquivo(null)).toBe(0)
  })
})

describe('migrarParaFormatoAtual', () => {
  it('save no formato atual não muda', () => {
    expect(migrarParaFormatoAtual({ formato: 1, a: 1 })).toEqual({ formato: 1, a: 1 })
  })
})
