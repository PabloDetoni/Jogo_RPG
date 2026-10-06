import { describe, expect, it, vi } from 'vitest'

// RF01: uma aba por navegador no modo convidado.
// Cada cópia nova do módulo faz o papel de uma aba; a trava do navegador (Web Locks) é a mesma.
async function abrirAba() {
  vi.resetModules()
  return import('./abaUnica.js')
}

describe('travarAbaDoConvidado', () => {
  it.skipIf(!globalThis.navigator?.locks)('só a primeira aba fica como convidado', async () => {
    const abaA = await abrirAba()
    const abaB = await abrirAba()
    expect(await abaA.travarAbaDoConvidado()).toBe('ok')
    expect(await abaB.travarAbaDoConvidado()).toBe('ocupada')
    expect(await abaA.travarAbaDoConvidado()).toBe('ok') // a mesma aba entrando de novo
  })

  it('sem a trava do navegador, segue em frente', async () => {
    const travasOriginais = Object.getOwnPropertyDescriptor(globalThis.navigator, 'locks')
    Object.defineProperty(globalThis.navigator, 'locks', { value: undefined, configurable: true })
    try {
      const aba = await abrirAba()
      expect(await aba.travarAbaDoConvidado()).toBe('semSuporte')
    } finally {
      if (travasOriginais) Object.defineProperty(globalThis.navigator, 'locks', travasOriginais)
      else delete globalThis.navigator.locks
    }
  })
})
