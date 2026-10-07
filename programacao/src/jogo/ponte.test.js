import { describe, expect, it, vi } from 'vitest'
import { criarPonte } from './ponte.js'

describe('ponte entre o React e o Phaser', () => {
  it('quem ouve recebe o aviso; quem parou de ouvir, não', () => {
    const ponte = criarPonte()
    const ouvinte = vi.fn()
    const pararDeOuvir = ponte.ouvir('situacao', ouvinte)
    ponte.avisar('situacao', { vida: 10 })
    pararDeOuvir()
    ponte.avisar('situacao', { vida: 5 })
    expect(ouvinte).toHaveBeenCalledTimes(1)
    expect(ouvinte).toHaveBeenCalledWith({ vida: 10 })
  })

  it('aviso sem ninguém ouvindo não quebra', () => {
    expect(() => criarPonte().avisar('liderCaiu')).not.toThrow()
  })

  it('a pausa guarda o valor atual e só avisa quando muda', () => {
    const ponte = criarPonte()
    const ouvinte = vi.fn()
    ponte.ouvir('pausa', ouvinte)
    expect(ponte.pausado).toBe(false)
    ponte.definirPausa(true)
    ponte.definirPausa(true)
    expect(ponte.pausado).toBe(true)
    expect(ouvinte).toHaveBeenCalledTimes(1)
  })
})
