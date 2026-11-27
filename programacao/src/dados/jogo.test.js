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
    expect(html.match(/%NOME_DO_JOGO%/g)?.length).toBe(3)
    expect(html).toContain('<title>%NOME_DO_JOGO%</title>')
    expect(html).not.toContain(jogo.nome)
    expect(ler('../../vite.config.js')).toContain("replaceAll('%NOME_DO_JOGO%', jogo.nome)")
  })

  it('a Tela inicial mostra o nome de dados/jogo.js', () => {
    expect(ler('../telas/acesso/TelaInicial.jsx')).toContain('{jogo.nome}')
  })
})
