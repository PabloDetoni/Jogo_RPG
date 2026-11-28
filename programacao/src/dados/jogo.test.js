import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { jogo } from './jogo.js'

const ler = (caminho) => readFileSync(new URL(caminho, import.meta.url), 'utf8')

describe('o nome do jogo num lugar só (Parte 13)', () => {
  it('o nome existe e é curto o bastante para a Tela inicial', () => {
    expect(jogo.nome.length).toBeGreaterThan(0)
    expect(jogo.nome.length).toBeLessThanOrEqual(20)
  })

  it('o index.html (título da aba e tela de carregamento) usa o nome de dados/jogo.js, sem o nome escrito à mão', () => {
    const html = ler('../../index.html')
    // o título da aba, as duas da tela de carregamento e o nome do app instalado no iPhone (Parte 14)
    expect(html.match(/%NOME_DO_JOGO%/g)?.length).toBe(4)
    expect(html).toContain('<title>%NOME_DO_JOGO%</title>')
    expect(html).not.toContain(jogo.nome)
    expect(ler('../../vite.config.js')).toContain("replaceAll('%NOME_DO_JOGO%', jogo.nome)")
  })

  it('a Tela inicial mostra o nome de dados/jogo.js', () => {
    expect(ler('../telas/acesso/TelaInicial.jsx')).toContain('{jogo.nome}')
  })
})

describe('o app instalável (Parte 14)', () => {
  const manifesto = JSON.parse(readFileSync(new URL('../../public/manifest.webmanifest', import.meta.url), 'utf8'))
  it('o manifesto tem o nome do jogo, deitado, em tela cheia e com os ícones', () => {
    expect(manifesto.name).toBe(jogo.nome)
    expect(manifesto.short_name).toBe(jogo.nome)
    expect(manifesto.orientation).toBe('landscape')
    expect(manifesto.display).toBe('fullscreen')
    expect(manifesto.icons.map((icone) => icone.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
  })
})
