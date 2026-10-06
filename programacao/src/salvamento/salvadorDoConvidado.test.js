import { describe, expect, it } from 'vitest'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { relogioFalso, storageFalso } from '../testes/ajudantes.js'
import { criarArmazenamento } from './armazenamento.js'
import { chaves } from './chaves.js'
import { criarSalvadorDoConvidado } from './salvadorDoConvidado.js'

const progressoComMago = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }
const partida = { bioma: 'floresta', pontoPartida: 'inicio', lider: 'mago', iniciadaEm: '2026-10-05T12:00:00Z' }
const salvarComo = (salvador, progresso, partidaEmAndamento = null) =>
  salvador.salvar({ perfil: 'convidado', progresso, partidaEmAndamento })

function navegador() {
  const storage = storageFalso()
  const armazenamento = criarArmazenamento(storage)
  const relogio = relogioFalso()
  return {
    storage,
    // Abrir uma aba (ou recarregar a página) = um salvador novo lendo o mesmo navegador
    abrirAba: () => criarSalvadorDoConvidado(armazenamento, relogio),
    save: () => JSON.parse(storage.dados.get(chaves.convidado)),
    temSave: () => storage.dados.has(chaves.convidado),
  }
}

describe('salvar e carregar (RF09)', () => {
  it('sem save, começa do zero', () => {
    const aba = navegador().abrirAba()
    expect(aba.carregar()).toEqual({ situacao: 'novo', progresso: progressoInicial(), partidaDescartada: false })
  })

  it('só grava quando o perfil é de convidado', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    aba.salvar({ perfil: null, progresso: progressoComMago, partidaEmAndamento: null })
    expect(nav.temSave()).toBe(false)
    salvarComo(aba, progressoComMago)
    expect(nav.save()).toMatchObject({ formato: 1, versao: 1, progresso: progressoComMago, partidaEmAndamento: null })
  })

  it('não grava de novo o que não mudou; quando muda, a versão sobe (RNF06)', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    salvarComo(aba, progressoComMago)
    salvarComo(aba, { ...progressoComMago })
    expect(nav.save().versao).toBe(1)
    salvarComo(aba, { ...progressoComMago, ouro: 10 })
    expect(nav.save().versao).toBe(2)
  })

  it('recarregar a página traz o que foi salvo', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    salvarComo(aba, { ...progressoComMago, ouro: 11 })
    const depois = nav.abrirAba()
    const carregado = depois.carregar()
    expect(carregado.situacao).toBe('carregado')
    expect(carregado.progresso.ouro).toBe(11)
    expect(depois.obterInfo().versao).toBe(1)
    salvarComo(depois, carregado.progresso)
    expect(nav.save().versao).toBe(1) // carregar e salvar sem mudança não grava
  })

  it('partida não terminada: descartada ao carregar, e o save fica limpo no próximo salvamento (RF11, RF12)', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    salvarComo(aba, progressoComMago, partida)
    const depois = nav.abrirAba()
    const carregado = depois.carregar()
    expect(carregado.partidaDescartada).toBe(true)
    salvarComo(depois, carregado.progresso)
    expect(nav.save()).toMatchObject({ partidaEmAndamento: null, versao: 2 })
  })
})

describe('versão antiga nunca sobrescreve a mais nova (RNF06)', () => {
  it('a aba desatualizada é bloqueada até recarregar', () => {
    const nav = navegador()
    const primeira = nav.abrirAba()
    primeira.carregar()
    salvarComo(primeira, progressoComMago)
    const abaA = nav.abrirAba()
    abaA.carregar()
    const abaB = nav.abrirAba()
    abaB.carregar()
    salvarComo(abaB, { ...progressoComMago, ouro: 500 })
    salvarComo(abaA, { ...progressoComMago, ouro: 1 })
    expect(nav.save().progresso.ouro).toBe(500)
    expect(abaA.obterInfo().problema).toBe('conflito')
    salvarComo(abaA, { ...progressoComMago, ouro: 2 })
    expect(nav.save().progresso.ouro).toBe(500)
    expect(abaA.carregar().progresso.ouro).toBe(500)
    expect(abaA.obterInfo().problema).toBeNull()
  })
})

describe('problemas', () => {
  it.each([
    ['texto qualquer', 'isso não é um save', 0],
    ['estragado com versão', '{"versao":3}', 3],
  ])('save estragado (%s): cópia guardada, começa do zero e volta a salvar', (_, estragado, versaoAntiga) => {
    const nav = navegador()
    nav.storage.dados.set(chaves.convidado, estragado)
    const aba = nav.abrirAba()
    const carregado = aba.carregar()
    expect(carregado).toEqual({ situacao: 'corrompido', progresso: progressoInicial(), partidaDescartada: false })
    expect(nav.storage.dados.get(chaves.convidadoCorrompido)).toBe(estragado)
    salvarComo(aba, progressoComMago)
    expect(nav.save().versao).toBe(versaoAntiga + 1)
    expect(aba.obterInfo().problema).toBeNull()
  })

  it('save de versão mais nova do jogo nunca é sobrescrito', () => {
    const nav = navegador()
    const futuro = '{"formato":99,"versao":40,"progresso":{}}'
    nav.storage.dados.set(chaves.convidado, futuro)
    const aba = nav.abrirAba()
    expect(aba.carregar().situacao).toBe('formatoNovo')
    expect(aba.obterInfo().problema).toBe('formatoNovo')
    salvarComo(aba, progressoComMago)
    expect(nav.storage.dados.get(chaves.convidado)).toBe(futuro)
  })

  it('navegador sem espaço: avisa e tenta de novo depois', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    nav.storage.cheio = true
    salvarComo(aba, progressoComMago)
    expect(aba.obterInfo().problema).toBe('cheio')
    nav.storage.cheio = false
    salvarComo(aba, progressoComMago)
    expect(aba.obterInfo().problema).toBeNull()
    expect(nav.save().versao).toBe(1)
  })

  it('navegador que não deixa guardar: avisa logo e nunca lança erro', () => {
    const aba = criarSalvadorDoConvidado(null)
    expect(aba.obterInfo().problema).toBe('indisponivel')
    expect(aba.carregar().situacao).toBe('indisponivel')
    expect(() => salvarComo(aba, progressoComMago)).not.toThrow()

    const bloqueada = criarSalvadorDoConvidado(criarArmazenamento(storageFalso({ bloqueado: true })))
    expect(bloqueada.carregar().situacao).toBe('indisponivel')
    expect(bloqueada.obterInfo().problema).toBe('indisponivel')
  })
})

describe('painel e acompanhamento', () => {
  it('quem acompanha é avisado a cada salvamento; desinscrever para de avisar', () => {
    const aba = navegador().abrirAba()
    aba.carregar()
    let avisos = 0
    const desinscrever = aba.inscrever(() => avisos++)
    const infoAntes = aba.obterInfo()
    expect(aba.obterInfo()).toBe(infoAntes) // sem mudança, o mesmo objeto
    salvarComo(aba, progressoComMago)
    expect(avisos).toBe(1)
    desinscrever()
    salvarComo(aba, { ...progressoComMago, ouro: 3 })
    expect(avisos).toBe(1)
  })

  it('apagar remove o save e para de salvar nesta aba', () => {
    const nav = navegador()
    const aba = nav.abrirAba()
    aba.carregar()
    salvarComo(aba, progressoComMago)
    aba.apagar()
    expect(nav.temSave()).toBe(false)
    salvarComo(aba, { ...progressoComMago, ouro: 1 })
    expect(nav.temSave()).toBe(false)
  })
})
