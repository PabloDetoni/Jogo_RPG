import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { arquivosDeSom } from '../audio/arquivos.js'
import { classes } from '../dados/classes.js'
import { efeitos, musicas } from '../dados/sons.js'
import { arquivoDoSom, efeitoDoAtaque, musicaDaTela, podeTocarDeNovo, volumesDasPreferencias } from './som.js'

describe('som (Fase 4, TASK-105)', () => {
  it('critério do card: com o Som desligado e a Música ligada, efeitos não tocam e a música continua; M silencia tudo', () => {
    expect(volumesDasPreferencias({ musica: true, som: false, mudo: false })).toEqual({ musica: 1, efeitos: 0 })
    expect(volumesDasPreferencias({ musica: true, som: true, mudo: true })).toEqual({ musica: 0, efeitos: 0 })
    expect(volumesDasPreferencias({ musica: false, som: true, mudo: false })).toEqual({ musica: 0, efeitos: 1 })
  })

  it('a música de cada momento', () => {
    expect(musicaDaTela('telaInicial')).toBe('reino')
    expect(musicaDaTela('reino')).toBe('reino')
    expect(musicaDaTela('partida')).toBe('floresta')
    expect(musicaDaTela('partida', { bossPorPerto: true })).toBe('boss')
    expect(musicaDaTela('cutsceneDerrota')).toBe('derrota')
  })

  it('cada classe tem o efeito do ataque, e todo efeito tem bipe provisório', () => {
    for (const classe of classes) expect(efeitos[efeitoDoAtaque(classe.id)], classe.id).toBeDefined()
    expect(efeitoDoAtaque('dragao')).toBeNull()
    for (const [id, efeito] of Object.entries(efeitos)) {
      expect(efeito.bipe.hz > 50 && efeito.bipe.hz < 5000 && efeito.bipe.ms > 0 && efeito.bipe.ms <= 500, id).toBe(true)
    }
  })

  it('o mesmo efeito não repete em menos do intervalo', () => {
    expect(podeTocarDeNovo({}, 'acerto', 1000, 60)).toBe(true)
    expect(podeTocarDeNovo({ acerto: 980 }, 'acerto', 1000, 60)).toBe(false)
    expect(podeTocarDeNovo({ acerto: 900 }, 'acerto', 1000, 60)).toBe(true)
  })

  it('o arquivo vem só dos que existem; sem arquivo, null (toca o bipe ou fica em silêncio)', () => {
    expect(arquivoDoSom('acerto', { acerto: '/x/acerto.ogg' })).toBe('/x/acerto.ogg')
    expect(arquivoDoSom('acerto', {})).toBeNull()
    expect(typeof arquivosDeSom).toBe('object')
  })

  it('todo arquivo de som da Lista de Arte e Som tem nome em dados/sons.js (para cair no lugar certo sem mexer em código)', () => {
    const lista = readFileSync(new URL('../../../documentacao/Lista_de_Arte_e_Som.md', import.meta.url), 'utf8')
    const daLista = [...lista.matchAll(/`([a-z-]+)\.ogg`/g)].map((achado) => achado[1])
    const nomes = new Set([...Object.values(musicas), ...Object.values(efeitos).map((efeito) => efeito.arquivo)])
    // "ataque-guerreiro.ogg e assim por diante (5)": os 5 ataques
    for (const classe of classes) expect(nomes.has(`ataque-${classe.id}`), classe.id).toBe(true)
    for (const nome of daLista) expect(nomes.has(nome), nome).toBe(true)
  })
})
