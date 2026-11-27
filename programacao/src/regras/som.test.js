import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { arquivosDeSom } from '../audio/arquivos.js'
import { classes } from '../dados/classes.js'
import { audio, efeitos, efeitosDasOperacoes, efeitosDosMinijogos, musicas } from '../dados/sons.js'
import { dadosDosMinijogos } from '../dados/minijogos.js'
import { telas } from '../dados/telas.js'
import { operacoesDoReino } from './reino.js'
import { arquivoDoSom, efeitoDaOperacao, efeitoDoAtaque, msDaTroca, musicaDaTela, podeTocarDeNovo, volumesDasPreferencias } from './som.js'

describe('som (Fase 4, TASK-105)', () => {
  it('critério do card: com o Som desligado e a Música ligada, efeitos não tocam e a música continua; M silencia tudo', () => {
    expect(volumesDasPreferencias({ musica: true, som: false, mudo: false })).toEqual({ musica: 1, efeitos: 0 })
    expect(volumesDasPreferencias({ musica: true, som: true, mudo: true })).toEqual({ musica: 0, efeitos: 0 })
    expect(volumesDasPreferencias({ musica: false, som: true, mudo: false })).toEqual({ musica: 0, efeitos: 1 })
  })

  it('a música de cada momento (Parte 13)', () => {
    expect(musicaDaTela('telaInicial')).toBe('reino')
    expect(musicaDaTela('reino')).toBe('reino')
    expect(musicaDaTela('login')).toBe('reino')
    expect(musicaDaTela('mercado')).toBe('reino')
    expect(musicaDaTela('mapa')).toBe('aventura')
    expect(musicaDaTela('pontoPartida')).toBe('aventura')
    expect(musicaDaTela('preparacao')).toBe('aventura')
    expect(musicaDaTela('fazenda')).toBe('minijogo')
    expect(musicaDaTela('mina')).toBe('minijogo')
    expect(musicaDaTela('lago')).toBe('minijogo')
    expect(musicaDaTela('partida')).toBe('floresta')
    expect(musicaDaTela('partida', { emCombate: true })).toBe('combate')
    expect(musicaDaTela('partida', { bossPorPerto: true })).toBe('boss')
    expect(musicaDaTela('partida', { bossPorPerto: true, emCombate: true })).toBe('boss')
    expect(musicaDaTela('cutsceneDerrota')).toBe('derrota')
    expect(musicaDaTela('resumo', { resultado: 'grandeVitoria' })).toBe('vitoria')
    expect(musicaDaTela('resumo', { resultado: 'vitoria' })).toBe('vitoria')
    expect(musicaDaTela('resumo', { resultado: 'derrota' })).toBe('derrota')
    expect(musicaDaTela('resumo', { resultado: 'retornoForcado' })).toBe('reino')
    // toda tela do jogo tem uma música que existe
    for (const tela of Object.keys(telas)) expect(musicas[musicaDaTela(tela)], tela).toBeDefined()
  })

  it('a troca dentro da partida (Floresta, combate, chefe) é devagar; as outras, rápidas', () => {
    expect(msDaTroca('floresta', 'combate', audio)).toBe(audio.msDaTrocaDoCombate)
    expect(msDaTroca('combate', 'floresta', audio)).toBe(audio.msDaTrocaDoCombate)
    expect(msDaTroca('combate', 'boss', audio)).toBe(audio.msDaTrocaDoCombate)
    expect(msDaTroca('aventura', 'floresta', audio)).toBe(audio.msDaTrocaDeMusica)
    expect(msDaTroca(undefined, 'reino', audio)).toBe(audio.msDaTrocaDeMusica)
    expect(audio.msDaTrocaDoCombate).toBeGreaterThan(audio.msDaTrocaDeMusica)
  })

  it('cada classe tem o efeito do ataque; todo efeito tem a receita feita em código, curta e que se ouve', () => {
    for (const classe of classes) expect(efeitos[efeitoDoAtaque(classe.id)], classe.id).toBeDefined()
    expect(efeitoDoAtaque('dragao')).toBeNull()
    const ondas = new Set(['sine', 'triangle', 'square', 'sawtooth', 'pulso25', 'ruido'])
    for (const [id, efeito] of Object.entries(efeitos)) {
      expect(efeito.receita.length, id).toBeGreaterThan(0)
      let fim = 0
      for (const parte of efeito.receita) {
        expect(ondas.has(parte.onda), id).toBe(true)
        expect(parte.hz.every((hz) => hz > 40 && hz < 8000), id).toBe(true)
        expect(parte.ms > 0 && parte.volume > 0 && parte.volume <= 0.4, id).toBe(true)
        fim = Math.max(fim, (parte.atraso ?? 0) + parte.ms)
      }
      expect(fim, id).toBeLessThanOrEqual(1000)
    }
  })

  it('o efeito de cada evento (Parte 13): comprar e vender tocam a moeda; cada minijogo tem o seu; o que não tem efeito não toca nada', () => {
    expect(efeitoDaOperacao('comprarNoMercado', efeitosDasOperacoes)).toBe('moeda')
    expect(efeitoDaOperacao('venderNoMercado', efeitosDasOperacoes)).toBe('moeda')
    expect(efeitoDaOperacao('fabricar', efeitosDasOperacoes)).toBe('forjar')
    expect(efeitoDaOperacao('conhecerNpc', efeitosDasOperacoes)).toBeNull()
    expect(efeitoDaOperacao('toString', efeitosDasOperacoes)).toBeNull()
    for (const [operacao, efeito] of Object.entries(efeitosDasOperacoes)) {
      expect(operacoesDoReino[operacao], operacao).toBeDefined()
      expect(efeitos[efeito], operacao).toBeDefined()
    }
    for (const jogo of Object.keys(dadosDosMinijogos)) expect(efeitos[efeitosDosMinijogos[jogo]], jogo).toBeDefined()
    expect(Object.values(efeitosDosMinijogos)).toEqual(['colher', 'picareta', 'fisgar'])
    // os efeitos que a mensagem de 27/11 pede
    for (const id of ['clique', 'moeda', 'ataqueGuerreiro', 'arcoPuxar', 'ataqueArqueiro', 'ataqueMago', 'bloqueio', 'ataqueSacerdote', 'dano', 'desmaio', 'nivel', 'pegarItem', 'mochila']) {
      expect(efeitos[id], id).toBeDefined()
    }
  })

  it('volume baixo por padrão, com os efeitos por cima da música (senão o clique e a moeda somem)', () => {
    expect(audio.volumeDaMusica).toBeLessThanOrEqual(0.3)
    expect(audio.volumeDosEfeitos).toBeLessThanOrEqual(1)
    expect(audio.volumeDosEfeitos).toBeGreaterThan(audio.volumeDaMusica)
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
    const nomes = new Set([...Object.values(musicas).map((musica) => musica.arquivo), ...Object.values(efeitos).map((efeito) => efeito.arquivo)])
    // "ataque-guerreiro.ogg e assim por diante (5)": os 5 ataques
    for (const classe of classes) expect(nomes.has(`ataque-${classe.id}`), classe.id).toBe(true)
    for (const nome of daLista) expect(nomes.has(nome), nome).toBe(true)
  })
})
