// AS MÚSICAS DO JOGO, FEITAS EM CÓDIGO (Parte 13, 27/11/2026): chiptune no clima de fantasia medieval, tocado pela Web
// Audio API (audio/sintetizador.js), sem arquivo nem biblioteca. Como ler e escrever: regras/partitura.js. Os
// instrumentos ficam em dados/sons.js. Se um arquivo de música for salvo em src/assets/audio/ com o nome de
// dados/sons.js (musicas), ele toca no lugar desta.
// Os testes (regras/partitura.test.js) conferem que cada compasso fecha, que as músicas em laço duram de 30 a 60 s e
// que as fanfarras são curtas.

// Batidas comuns: o baixo e os arpejos (cada nota: [batida, duração, grau do acorde]; regras/partitura.js)
const arpejoQueSobeEDesce = [[0, 0.5, 0], [0.5, 0.5, 2], [1, 0.5, 3], [1.5, 0.5, 4], [2, 0.5, 5], [2.5, 0.5, 4], [3, 0.5, 3], [3.5, 0.5, 2]]
const arpejoQueCorre = [[0, 0.5, 0], [0.5, 0.5, 1], [1, 0.5, 2], [1.5, 0.5, 3], [2, 0.5, 2], [2.5, 0.5, 1], [3, 0.5, 2], [3.5, 0.5, 3]]
const acordeParado = [[0, 4, 0], [0, 4, 1], [0, 4, 2]]
const contratempo = [[0.5, 0.5, 1], [1.5, 0.5, 2], [2.5, 0.5, 1], [3.5, 0.5, 2]]
const baixoEmOitavas = [[0, 0.5, 0], [0.5, 0.5, 3], [1, 0.5, 0], [1.5, 0.5, 3], [2, 0.5, 0], [2.5, 0.5, 3], [3, 0.5, 0], [3.5, 0.5, 3]]

export const partituras = {
  // Tela inicial, Reino e as telas de conta: calma (ré menor, alaúde e flauta doce)
  reino: {
    bpm: 76,
    compasso: 4,
    instrumentos: { melodia: 'flauta', baixo: 'baixo', arpejo: 'alaude', acorde: 'cordas' },
    padroes: {
      baixo: { oitava: 2, notas: [[0, 2, 0], [2, 2, 2]] },
      arpejo: { oitava: 3, notas: arpejoQueSobeEDesce },
      acorde: { oitava: 4, notas: acordeParado },
    },
    bateria: null,
    secoes: {
      a: {
        acordes: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Gm A', 'Dm'],
        melodia:
          'A4 D5 E5 F5 | E5:1.5 D5:.5 C5 E5 | D5:2 F5 D5 | C#5 E5 A4:2 | A4 D5 E5 F5 | G5:1.5 F5:.5 E5 C5 | D5 Bb4 C#5 E5 | D5:3 -:1',
      },
      b: {
        acordes: ['F', 'C', 'Gm', 'Dm', 'Bb', 'F', 'Gm', 'A'],
        melodia:
          'A5:1.5 G5:.5 F5 A5 | G5:2 E5 C5 | Bb5 A5 G5 D5 | F5:1.5 E5:.5 D5:2 | D5 F5 Bb5:1.5 A5:.5 | A5 G5 F5 C5 | D5 E5 F5 G5 | E5:2 C#5:2',
      },
    },
    forma: ['a', 'b'],
  },

  // Mapa, Caravana e Preparação: aventura (sol mixolídio, marcha com tambor)
  aventura: {
    bpm: 112,
    compasso: 4,
    instrumentos: { melodia: 'pulso', baixo: 'baixo', arpejo: 'alaude' },
    padroes: {
      baixo: { oitava: 2, notas: [[0, 1, 0], [1, 1, 2], [2, 1, 0], [3, 0.5, 2], [3.5, 0.5, 3]] },
      arpejo: { oitava: 4, notas: contratempo },
    },
    bateria: ['k.......k.......', '....s.......s.s.', '..h...h...h...h.'],
    secoes: {
      a: {
        acordes: ['G', 'G', 'F', 'C', 'G', 'G', 'F', 'D'],
        melodia:
          'G4:.5 B4:.5 D5 D5:.5 E5:.5 D5 | B4 G4 D5:2 | C5:.5 D5:.5 F5 E5:.5 D5:.5 C5 | E5:2 C5 -:1 | G4:.5 B4:.5 D5 G5 F5 | E5:.5 D5:.5 B4 D5:2 | C5 A4 F5 E5 | D5:2 F#5 A5',
      },
      b: {
        acordes: ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'D'],
        melodia:
          'G5:1.5 F#5:.5 E5 B4 | C5 E5 G5 E5 | D5:1.5 C5:.5 B4 G4 | A4 B4:.5 C5:.5 D5:2 | G5:1.5 F#5:.5 E5 G5 | A5 G5 E5 C5 | D5 E5 F#5 A5 | G5:3 -:1',
      },
    },
    forma: ['a', 'b'],
  },

  // Partida na Floresta: exploração (mi menor, harpa que corre e flauta)
  floresta: {
    bpm: 88,
    compasso: 4,
    instrumentos: { melodia: 'flauta', baixo: 'baixo', arpejo: 'harpa' },
    padroes: {
      baixo: { oitava: 2, notas: [[0, 4, 0]] },
      arpejo: { oitava: 3, notas: arpejoQueCorre },
    },
    bateria: ['t.......t..t....'],
    secoes: {
      a: {
        acordes: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'Am', 'B'],
        melodia: 'B4:2 E5 F#5 | G5:3 F#5 | E5:2 G5 E5 | F#5:2 D5:2 | B4:2 E5 F#5 | G5 A5 B5:2 | A5:1.5 G5:.5 E5 C5 | D#5:3 -:1',
      },
      b: {
        acordes: ['C', 'G', 'D', 'Em', 'C', 'G', 'Am', 'B'],
        melodia: 'E5 G5 C6:2 | B5:1.5 A5:.5 G5:2 | F#5 A5 D5:2 | E5:3 -:1 | G5 E5 C5 E5 | D5 G5 B5:2 | C6 B5 A5 E5 | F#5:2 D#5:2',
      },
    },
    forma: ['a', 'b'],
  },

  // Em combate na partida: mais rápida e tensa (lá menor); troca com a da Floresta devagar (dados/sons.js, audio)
  combate: {
    bpm: 140,
    compasso: 4,
    instrumentos: { melodia: 'pulso', baixo: 'baixo' },
    padroes: { baixo: { oitava: 2, notas: baixoEmOitavas } },
    bateria: ['k.....k.k.......', '....s.......s...', 'h.h.h.h.h.h.h.h.'],
    secoes: {
      a: {
        acordes: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', 'E'],
        melodia:
          'A4:.5 A4:.5 C5:.5 E5:.5 A5 G5 | E5:.5 D5:.5 C5:.5 D5:.5 E5:2 | F5:.5 E5:.5 D5:.5 C5:.5 A4 C5 | B4:.5 C5:.5 D5 G5 D5 | A4:.5 A4:.5 C5:.5 E5:.5 A5 B5 | C6 B5:.5 A5:.5 G5 E5 | F5 A5 C6 A5 | G#5:2 E5 B4',
      },
      b: {
        acordes: ['Dm', 'Am', 'Dm', 'E', 'F', 'G', 'Am', 'E'],
        melodia:
          'D5 F5 A5:1.5 G5:.5 | E5 C5 A4:2 | D5:.5 E5:.5 F5:.5 G5:.5 A5 D6 | B5:2 G#5:2 | A5 G5:.5 F5:.5 E5 F5 | G5 F5:.5 E5:.5 D5 B4 | C5 E5 A5:2 | G#5 B5 E6:2',
      },
      c: {
        acordes: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F E', 'E'],
        melodia:
          'A5:.5 -:.5 A5:.5 -:.5 G5:.5 A5:.5 E5 | G5:.5 -:.5 G5:.5 -:.5 F5:.5 G5:.5 D5 | F5:.5 -:.5 F5:.5 -:.5 E5:.5 F5:.5 C5 | E5 G#5 B5 E6 | A5:.5 -:.5 A5:.5 -:.5 G5:.5 A5:.5 E5 | B5:.5 -:.5 B5:.5 -:.5 A5:.5 B5:.5 G5 | A5 F5 G#5 E5 | B4:.5 C5:.5 D5:.5 E5:.5 G#5 B5',
      },
    },
    forma: ['a', 'b', 'c'],
  },

  // Perto do chefe (o Ogro): a mais tensa (dó menor com o ré bemol do frígio)
  boss: {
    bpm: 150,
    compasso: 4,
    instrumentos: { melodia: 'pulso', baixo: 'baixo', acorde: 'cordas' },
    padroes: {
      baixo: { oitava: 2, notas: [[0, 0.5, 0], [0.5, 0.5, 0], [1, 0.5, 3], [1.5, 0.5, 0], [2, 0.5, 0], [2.5, 0.5, 0], [3, 0.5, 3], [3.5, 0.5, 2]] },
      acorde: { oitava: 4, notas: acordeParado },
    },
    bateria: ['k.k...k.k.k...k.', '....s.......s...', 'h.h.h.h.h.h.h.h.'],
    secoes: {
      a: {
        acordes: ['Cm', 'Cm', 'Db', 'Cm', 'Cm', 'Cm', 'Ab', 'G'],
        melodia: 'C5 C5:.5 C5:.5 Eb5 G5 | F#5 G5 Eb5 C5 | Db5 F5 Ab5:1.5 G5:.5 | G5:2 -:1 C5 | C5 C5:.5 C5:.5 Eb5 G5 | Bb5 Ab5 G5 Eb5 | C6 Ab5 Eb5 C5 | B4 D5 F5 G5',
      },
      b: {
        acordes: ['Fm', 'Cm', 'Fm', 'G', 'Ab', 'Bb', 'Ab', 'G'],
        melodia:
          'F5:1.5 Ab5:.5 C6 Ab5 | G5:1.5 Eb5:.5 C5:2 | F5:.5 G5:.5 Ab5:.5 Bb5:.5 C6 Db6 | B5:2 G5:2 | Ab5 G5:.5 F5:.5 Eb5 C5 | D5 F5 Bb5:2 | C6 Bb5:.5 Ab5:.5 G5 Eb5 | D5:.5 Eb5:.5 F5:.5 G5:.5 B5:2',
      },
      c: {
        acordes: ['Cm', 'Db', 'Cm', 'Db', 'Ab', 'Bb', 'G', 'G'],
        melodia:
          'C6:.5 -:.5 C6:.5 B5:.5 C6 G5 | Db6:.5 -:.5 Db6:.5 C6:.5 Db6 Ab5 | C6:.5 -:.5 C6:.5 B5:.5 C6 G5 | F6 Eb6 Db6 C6 | C6 Ab5 Eb5 Ab5 | D6 Bb5 F5 Bb5 | B5 G5 D5 B4 | G4:.5 B4:.5 D5:.5 F5:.5 G5:2',
      },
    },
    forma: ['a', 'b', 'c'],
  },

  // Minijogos do Planalto: leve (fá maior, sininhos e baixo saltitante)
  minijogo: {
    bpm: 116,
    compasso: 4,
    instrumentos: { melodia: 'sino', baixo: 'baixo', arpejo: 'alaude' },
    padroes: {
      baixo: { oitava: 2, notas: [[0, 0.5, 0], [1, 0.5, 2], [2, 0.5, 0], [3, 0.5, 2]] },
      arpejo: { oitava: 4, notas: contratempo },
    },
    bateria: ['k.......k.......', '....s.......s...', '..h...h...h...h.'],
    secoes: {
      a: {
        acordes: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb C', 'F'],
        melodia:
          'C5:.5 F5:.5 A5:.5 F5:.5 C6 A5 | G5:.5 E5:.5 C5:.5 E5:.5 G5:2 | A5:.5 F5:.5 D5:.5 F5:.5 A5 D6 | Bb5:1.5 A5:.5 G5 F5 | C5:.5 F5:.5 A5:.5 F5:.5 C6 A5 | Bb5:.5 A5:.5 G5:.5 A5:.5 Bb5 G5 | D6 Bb5 E5 G5 | F5:2 -:2',
      },
      b: {
        acordes: ['Bb', 'F', 'Gm', 'C', 'Bb', 'F', 'Gm C', 'F'],
        melodia:
          'D5 F5 Bb5:2 | A5 C6:.5 A5:.5 F5:2 | G5:.5 A5:.5 Bb5:.5 G5:.5 D6 Bb5 | C6:1.5 Bb5:.5 A5 G5 | F5 D5 Bb5 F5 | A5:.5 G5:.5 F5:.5 G5:.5 A5 C6 | Bb5 G5 E5 G5 | F5 C5 F4:2',
      },
    },
    forma: ['a', 'b'],
  },

  // Fanfarra da Vitória (o Resumo de uma vitória): curta, toca uma vez
  vitoria: {
    bpm: 120,
    compasso: 4,
    instrumentos: { melodia: 'pulso', baixo: 'baixo', acorde: 'cordas' },
    padroes: { baixo: { oitava: 2, notas: [[0, 1, 0], [1, 1, 2], [2, 2, 3]] }, acorde: { oitava: 4, notas: acordeParado } },
    bateria: ['s.s.s.s.ssssk...k...............'],
    secoes: {
      a: { acordes: ['C', 'C'], melodia: 'G4:.5 C5:.5 E5:.5 G5:.5 E5 G5 | C6:3 -:1' },
    },
    forma: ['a'],
  },

  // A Derrota (a cutscene): curta e triste, toca uma vez
  derrota: {
    bpm: 66,
    compasso: 4,
    instrumentos: { melodia: 'flauta', baixo: 'baixo', acorde: 'cordas' },
    padroes: { baixo: { oitava: 2, notas: [[0, 2, 0], [2, 2, 0]] }, acorde: { oitava: 3, notas: acordeParado } },
    bateria: ['t...............t...............'],
    secoes: {
      a: { acordes: ['F E', 'Am'], melodia: 'E5 D5 C5 B4 | A4:3 -:1' },
    },
    forma: ['a'],
  },
}
