import { describe, expect, it } from 'vitest'
import { partituras } from '../dados/musicas.js'
import { instrumentos, musicas } from '../dados/sons.js'
import { acordeDoNome, duracaoDaMusica, eventosDaMusica, hzDoMidi, lerCompassoDeAcordes, lerMelodia, midiDaNota, notaDoAcorde, problemasDaPartitura } from './partitura.js'

describe('partitura (Parte 13: as músicas feitas em código)', () => {
  it('lê notas, acordes e melodias', () => {
    expect(midiDaNota('A4')).toBe(69)
    expect(midiDaNota('C4')).toBe(60)
    expect(midiDaNota('C#5')).toBe(73)
    expect(midiDaNota('Bb3')).toBe(58)
    expect(midiDaNota('H2')).toBeNull()
    expect(hzDoMidi(69)).toBeCloseTo(440)
    expect(hzDoMidi(81)).toBeCloseTo(880)
    expect(acordeDoNome('Dm')).toEqual({ raiz: 2, intervalos: [0, 3, 7] })
    expect(acordeDoNome('Bb')).toEqual({ raiz: 10, intervalos: [0, 4, 7] })
    expect(acordeDoNome('Xm')).toBeNull()
    // ré menor com a fundamental na 3ª oitava: ré, fá, lá e o ré de cima
    const dm = acordeDoNome('Dm')
    expect([0, 1, 2, 3].map((grau) => notaDoAcorde(dm, grau, 3))).toEqual([50, 53, 57, 62])
    expect(lerMelodia('A4:1.5 -:.5 D5 | E5:4')).toEqual([
      [
        { midi: 69, batidas: 1.5, nome: 'A4' },
        { midi: null, batidas: 0.5, nome: '-' },
        { midi: 74, batidas: 1, nome: 'D5' },
      ],
      [{ midi: 76, batidas: 4, nome: 'E5' }],
    ])
    expect(lerCompassoDeAcordes('Gm A', 4).map(({ nome, inicio, batidas }) => [nome, inicio, batidas])).toEqual([
      ['Gm', 0, 2],
      ['A', 2, 2],
    ])
  })

  it('toda música do jogo tem partitura, e toda partitura fecha (cada compasso com as batidas certas, notas e acordes que existem)', () => {
    for (const id of Object.keys(musicas)) {
      expect(partituras[id], id).toBeDefined()
      expect(problemasDaPartitura(partituras[id]), id).toEqual([])
    }
  })

  it('o teste de problemas acha compasso que não fecha, nota errada e bateria torta', () => {
    const torta = { bpm: 100, compasso: 4, instrumentos: { melodia: 'flauta' }, bateria: ['k..'], secoes: { a: { acordes: ['C', 'Q'], melodia: 'C5:3 | X5:4' } }, forma: ['a', 'b'] }
    const problemas = problemasDaPartitura(torta).join(' / ')
    expect(problemas).toContain('3 batidas')
    expect(problemas).toContain('nota "X5"')
    expect(problemas).toContain('acorde "Q"')
    expect(problemas).toContain('bateria com 3 passos')
    expect(problemas).toContain('seção "b" não existe')
  })

  it('as músicas que repetem duram de 30 a 60 s; as fanfarras (Vitória e Derrota) são curtas e tocam uma vez', () => {
    for (const [id, musica] of Object.entries(musicas)) {
      const segundos = duracaoDaMusica(partituras[id])
      if (musica.laco) {
        expect(segundos, id).toBeGreaterThanOrEqual(30)
        expect(segundos, id).toBeLessThanOrEqual(60)
      } else expect(segundos, id).toBeLessThanOrEqual(8)
    }
    expect(musicas.vitoria.laco).toBe(false)
    expect(musicas.derrota.laco).toBe(false)
  })

  it('as notas saem em ordem, dentro da música, com instrumento que existe e altura que se ouve', () => {
    for (const [id, partitura] of Object.entries(partituras)) {
      const eventos = eventosDaMusica(partitura)
      const fim = duracaoDaMusica(partitura)
      expect(eventos.length, id).toBeGreaterThan(10)
      let antes = 0
      for (const evento of eventos) {
        expect(evento.t, id).toBeGreaterThanOrEqual(antes)
        expect(evento.t, id).toBeLessThan(fim)
        expect(evento.dur, id).toBeGreaterThan(0)
        expect(instrumentos[evento.instrumento], `${id}: ${evento.instrumento}`).toBeDefined()
        if (!instrumentos[evento.instrumento].percussao) {
          expect(evento.hz, id).toBeGreaterThan(50)
          expect(evento.hz, id).toBeLessThan(2000)
        }
        antes = evento.t
      }
    }
  })

  it('a do combate é mais rápida que a da Floresta, e a do chefe é a mais rápida de todas', () => {
    expect(partituras.combate.bpm).toBeGreaterThan(partituras.floresta.bpm)
    for (const [id, partitura] of Object.entries(partituras)) if (id !== 'boss') expect(partituras.boss.bpm, id).toBeGreaterThan(partitura.bpm)
    expect(partituras.reino.bpm).toBeLessThan(partituras.aventura.bpm)
  })

  it('a melodia sai na hora certa: a 1ª nota no começo e a 2ª depois da duração da 1ª', () => {
    const musica = { bpm: 60, compasso: 4, instrumentos: { melodia: 'flauta' }, bateria: null, secoes: { a: { acordes: ['C'], melodia: 'C5:1.5 E5:2.5' } }, forma: ['a'] }
    const eventos = eventosDaMusica(musica)
    expect(eventos.map(({ t, dur }) => [t, dur])).toEqual([
      [0, 1.5],
      [1.5, 2.5],
    ])
  })

  it('a bateria e os padrões repetem em todo compasso, pelo acorde da hora', () => {
    const musica = {
      bpm: 60,
      compasso: 4,
      instrumentos: { melodia: 'flauta', baixo: 'baixo' },
      padroes: { baixo: { oitava: 2, notas: [[0, 1, 0], [2, 1, 0]] } },
      bateria: ['k...............'],
      secoes: { a: { acordes: ['C G', 'Am'], melodia: '-:4 | -:4' } },
      forma: ['a'],
    }
    const eventos = eventosDaMusica(musica)
    expect(eventos.filter((e) => e.instrumento === 'bumbo').map((e) => e.t)).toEqual([0, 4])
    const baixo = eventos.filter((e) => e.instrumento === 'baixo').map((e) => Math.round(e.hz))
    expect(baixo).toEqual([65, 98, 110, 110]) // dó, sol (a segunda metade do 1º compasso), lá, lá
  })
})
