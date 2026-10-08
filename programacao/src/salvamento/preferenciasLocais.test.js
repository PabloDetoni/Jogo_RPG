import { describe, expect, it } from 'vitest'
import { preferenciasPadrao } from '../estado/preferencias.js'
import { storageFalso } from '../testes/ajudantes.js'
import { armazenamentoDoNavegador, criarArmazenamento } from './armazenamento.js'
import { chaves } from './chaves.js'
import { carregarPreferencias, salvarPreferencias } from './preferenciasLocais.js'

describe('preferências no navegador (RF18)', () => {
  it('sem nada salvo, o padrão', () => {
    expect(carregarPreferencias(criarArmazenamento(storageFalso()))).toEqual(preferenciasPadrao)
  })

  it('ida e volta', () => {
    const armazenamento = criarArmazenamento(storageFalso())
    salvarPreferencias(armazenamento, { musica: false, som: false, mudo: true, tema: 'escuro' })
    expect(carregarPreferencias(armazenamento)).toEqual({ musica: false, som: false, mudo: true, tema: 'escuro' })
  })

  it('preferências salvas antes do mudo (5c) carregam com o mudo desligado', () => {
    const armazenamento = criarArmazenamento(storageFalso())
    armazenamento.gravar(chaves.preferencias, JSON.stringify({ formato: 1, musica: false, som: true, tema: 'escuro' }))
    expect(carregarPreferencias(armazenamento)).toEqual({ musica: false, som: true, mudo: false, tema: 'escuro' })
  })

  it('estragado ou sem armazenamento: o padrão, sem erro', () => {
    const storage = storageFalso()
    storage.dados.set(chaves.preferencias, '{quebrado')
    expect(carregarPreferencias(criarArmazenamento(storage))).toEqual(preferenciasPadrao)
    expect(carregarPreferencias(null)).toEqual(preferenciasPadrao)
    expect(() => salvarPreferencias(null, preferenciasPadrao)).not.toThrow()
  })
})

describe('armazenamento', () => {
  it('nunca lança erro: devolve ok:false com o motivo', () => {
    const bloqueado = criarArmazenamento(storageFalso({ bloqueado: true }))
    expect(bloqueado.ler('x')).toEqual({ ok: false, erro: 'indisponivel' })
    expect(bloqueado.gravar('x', '1')).toEqual({ ok: false, erro: 'indisponivel' })

    const storage = storageFalso()
    storage.cheio = true
    expect(criarArmazenamento(storage).gravar('x', '1')).toEqual({ ok: false, erro: 'cheio' })
  })

  it('fora do navegador (sem localStorage) devolve null', () => {
    expect(armazenamentoDoNavegador()).toBeNull()
  })
})
