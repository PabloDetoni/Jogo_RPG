// SONS DO JOGO (Fase 4, TASK-105; RF18; Parte 13, 27/11/2026: música e efeitos feitos em código).
// Sem arquivo, a música e os efeitos são feitos na hora pela Web Audio API (audio/sintetizador.js): as músicas pelas
// partituras de dados/musicas.js e os efeitos pelas receitas abaixo. Para trocar por um arquivo: salve-o em
// programacao/src/assets/audio/ com o nome desta lista (por exemplo, musica-reino.ogg ou acerto.ogg; .mp3 e .wav também
// servem). O jogo encontra sozinho os arquivos que existem (audio/arquivos.js) e o arquivo toca no lugar do som em código.

// A música de cada momento: o nome do arquivo (se um dia existir) e se repete (as fanfarras tocam uma vez).
// Qual música toca em cada tela: regras/som.js, musicaDaTela.
export const musicas = {
  reino: { arquivo: 'musica-reino', laco: true }, // Tela inicial, Reino e telas de conta: calma
  aventura: { arquivo: 'musica-aventura', laco: true }, // Mapa, Caravana e Preparação
  floresta: { arquivo: 'musica-floresta', laco: true }, // Partida na Floresta: exploração
  combate: { arquivo: 'musica-combate', laco: true }, // Partida, em combate: mais tensa
  boss: { arquivo: 'musica-boss', laco: true }, // Partida, perto do chefe (o Ogro): a mais tensa
  minijogo: { arquivo: 'musica-minijogo', laco: true }, // Minijogos do Planalto: leve
  vitoria: { arquivo: 'musica-vitoria', laco: false }, // Resumo de uma vitória: fanfarra curta
  derrota: { arquivo: 'musica-derrota', laco: false }, // Cutscene da Derrota: curta
}

// Os instrumentos das músicas (audio/sintetizador.js). onda: sine, triangle, square, sawtooth ou pulso25 (o quadrado
// fino do chiptune); volume de 0 a 1; ataque, decaimento e soltura em segundos; sustentacao: quanto do volume fica
// depois do decaimento (0 = a nota some sozinha, como corda beliscada); vibrato em Hz e cents; filtro passa-baixa em Hz.
// Percussão: ruído (caixa, chimbal) e tom que cai (bumbo, tambor).
export const instrumentos = {
  flauta: { onda: 'triangle', volume: 0.3, ataque: 0.04, decaimento: 0.2, sustentacao: 0.75, soltura: 0.12, vibrato: { hz: 5, cents: 14, atraso: 0.18 } },
  pulso: { onda: 'pulso25', volume: 0.1, ataque: 0.005, decaimento: 0.18, sustentacao: 0.6, soltura: 0.05 },
  alaude: { onda: 'triangle', volume: 0.16, ataque: 0.003, decaimento: 0.45, sustentacao: 0, soltura: 0.08 },
  harpa: { onda: 'sine', volume: 0.18, ataque: 0.002, decaimento: 0.7, sustentacao: 0, soltura: 0.1, brilho: 0.25 },
  sino: { onda: 'sine', volume: 0.2, ataque: 0.002, decaimento: 0.5, sustentacao: 0.1, soltura: 0.25, brilho: 0.4 },
  baixo: { onda: 'triangle', volume: 0.34, ataque: 0.005, decaimento: 0.15, sustentacao: 0.8, soltura: 0.05 },
  cordas: { onda: 'sawtooth', volume: 0.035, ataque: 0.35, decaimento: 0.3, sustentacao: 0.9, soltura: 0.4, filtro: 1100 },
  bumbo: { percussao: 'tom', volume: 0.5, de: 140, ate: 45, ms: 220 },
  tambor: { percussao: 'tom', volume: 0.28, de: 210, ate: 110, ms: 260 },
  caixa: { percussao: 'ruido', volume: 0.16, filtro: { tipo: 'bandpass', hz: 1900 }, ms: 140 },
  chimbal: { percussao: 'ruido', volume: 0.045, filtro: { tipo: 'highpass', hz: 7000 }, ms: 45 },
}

// Os efeitos. "receita": as partes que tocam juntas (audio/sintetizador.js): onda (sine, triangle, square, sawtooth,
// pulso25 ou ruido), hz [de, até] (a altura escorrega de um para o outro; no ruído, o filtro), ms, volume, atraso em ms
// e filtro (lowpass, highpass ou bandpass; no ruído, bandpass se não disser).
const nota = (hz, ms, atraso = 0, volume = 0.09, onda = 'square') => ({ onda, hz: [hz, hz], ms, atraso, volume })
export const efeitos = {
  // ataques do Líder (só o do Líder toca, para não virar barulho)
  ataqueGuerreiro: { arquivo: 'ataque-guerreiro', receita: [{ onda: 'ruido', hz: [700, 3200], ms: 150, volume: 0.32 }, { onda: 'sawtooth', hz: [320, 120], ms: 70, volume: 0.05 }] },
  arcoPuxar: { arquivo: 'arco-puxar', receita: [{ onda: 'sawtooth', hz: [85, 150], ms: 280, volume: 0.05, filtro: 'lowpass' }, { onda: 'ruido', hz: [400, 800], ms: 280, volume: 0.05 }] },
  ataqueArqueiro: { arquivo: 'ataque-arqueiro', receita: [{ onda: 'triangle', hz: [560, 260], ms: 90, volume: 0.24 }, { onda: 'ruido', hz: [2600, 1200], ms: 170, atraso: 20, volume: 0.12 }] },
  ataqueMago: { arquivo: 'ataque-mago', receita: [{ onda: 'sine', hz: [300, 950], ms: 230, volume: 0.2 }, { onda: 'triangle', hz: [600, 1900], ms: 200, atraso: 30, volume: 0.07 }, { onda: 'ruido', hz: [1200, 3200], ms: 220, volume: 0.05 }] },
  ataqueTanque: { arquivo: 'ataque-tanque', receita: [{ onda: 'ruido', hz: [900, 300], ms: 130, volume: 0.34, filtro: 'lowpass' }, { onda: 'square', hz: [150, 70], ms: 100, volume: 0.1 }] },
  ataqueSacerdote: { arquivo: 'ataque-sacerdote', receita: [{ onda: 'sine', hz: [520, 780], ms: 320, volume: 0.12 }, { onda: 'sine', hz: [780, 1170], ms: 300, atraso: 60, volume: 0.08 }, { onda: 'triangle', hz: [1040, 1560], ms: 260, atraso: 120, volume: 0.05 }] },
  // combate
  acerto: { arquivo: 'acerto', receita: [{ onda: 'ruido', hz: [1600, 400], ms: 70, volume: 0.24, filtro: 'lowpass' }, { onda: 'square', hz: [230, 110], ms: 50, volume: 0.07 }] },
  critico: { arquivo: 'critico', receita: [{ onda: 'square', hz: [880, 1760], ms: 90, volume: 0.1 }, { onda: 'ruido', hz: [3200, 1500], ms: 110, volume: 0.2 }] },
  bloqueio: { arquivo: 'bloqueio', receita: [nota(620, 150, 0, 0.08), nota(935, 170, 0, 0.06), { onda: 'ruido', hz: [4200, 3000], ms: 80, volume: 0.14 }] },
  esquiva: { arquivo: 'esquiva', receita: [{ onda: 'ruido', hz: [800, 2600], ms: 160, volume: 0.2 }] },
  dano: { arquivo: 'dano', receita: [{ onda: 'square', hz: [270, 90], ms: 170, volume: 0.12 }, { onda: 'ruido', hz: [1300, 300], ms: 120, volume: 0.18, filtro: 'lowpass' }] },
  desmaio: { arquivo: 'desmaio', receita: [{ onda: 'triangle', hz: [440, 110], ms: 650, volume: 0.2 }, { onda: 'square', hz: [220, 55], ms: 650, volume: 0.04 }] },
  levantar: { arquivo: 'levantar', receita: [{ onda: 'triangle', hz: [330, 660], ms: 180, volume: 0.15 }, { onda: 'triangle', hz: [660, 990], ms: 220, atraso: 150, volume: 0.15 }] },
  perdido: { arquivo: 'perdido', receita: [{ onda: 'triangle', hz: [220, 110], ms: 700, volume: 0.2 }] },
  nivel: { arquivo: 'nivel', receita: [nota(523, 100), nota(659, 100, 100), nota(784, 100, 200), nota(1047, 380, 300, 0.1)] },
  moeda: { arquivo: 'moeda', receita: [nota(988, 70, 0, 0.08), nota(1319, 200, 70, 0.08)] },
  pegarItem: { arquivo: 'pegar-item', receita: [nota(660, 60, 0, 0.08), nota(990, 130, 60, 0.08)] },
  mochila: { arquivo: 'mochila', receita: [{ onda: 'ruido', hz: [900, 300], ms: 170, volume: 0.24, filtro: 'lowpass' }, { onda: 'triangle', hz: [190, 140], ms: 80, volume: 0.1 }] },
  fuga: { arquivo: 'fuga', receita: [{ onda: 'sawtooth', hz: [200, 800], ms: 420, volume: 0.06, filtro: 'lowpass' }, { onda: 'ruido', hz: [500, 2600], ms: 420, volume: 0.1 }] },
  // interface e Reino
  clique: { arquivo: 'clique', receita: [{ onda: 'square', hz: [1800, 1200], ms: 25, volume: 0.06 }] },
  forjar: { arquivo: 'forjar', receita: [nota(1100, 320, 0, 0.06), nota(1650, 360, 0, 0.045, 'triangle'), { onda: 'ruido', hz: [3600, 2500], ms: 60, volume: 0.2 }] },
  equipar: { arquivo: 'equipar', receita: [{ onda: 'ruido', hz: [1500, 800], ms: 90, volume: 0.14 }, { onda: 'square', hz: [500, 750], ms: 80, atraso: 40, volume: 0.05 }] },
  // minijogos
  colher: { arquivo: 'colher', receita: [{ onda: 'ruido', hz: [3000, 5200], ms: 120, volume: 0.14 }, { onda: 'sine', hz: [700, 1050], ms: 90, atraso: 60, volume: 0.15 }] },
  picareta: { arquivo: 'picareta', receita: [nota(1400, 70, 0, 0.1), { onda: 'ruido', hz: [2600, 1800], ms: 100, volume: 0.24 }, { onda: 'triangle', hz: [300, 200], ms: 80, volume: 0.1 }] },
  fisgar: { arquivo: 'fisgar', receita: [{ onda: 'ruido', hz: [2600, 500], ms: 320, volume: 0.24, filtro: 'lowpass' }, { onda: 'sine', hz: [500, 1250], ms: 130, atraso: 40, volume: 0.1 }] },
}

// Qual efeito cada ação do Reino toca quando dá certo (regras/reino.js, operacoesDoReino; regras/som.js)
export const efeitosDasOperacoes = {
  comprarNoMercado: 'moeda',
  venderNoMercado: 'moeda',
  trocarNoMercado: 'moeda',
  comprarNaForja: 'moeda',
  venderNaForja: 'moeda',
  entregarMissaoNaGuilda: 'moeda',
  fabricar: 'forjar',
  equipar: 'equipar',
  desequipar: 'equipar',
  evoluirHabilidade: 'nivel',
}

// O efeito de cada jogada dos minijogos (colher, a picareta, fisgar)
export const efeitosDosMinijogos = { fazenda: 'colher', mina: 'picareta', lago: 'fisgar' }

// Volumes (0 a 1; baixos de propósito), o tempo mínimo entre dois iguais (um golpe em área acerta vários de uma vez:
// toca uma vez só), a troca de música (a do combate entra e sai devagar) e quanto o agendador olha à frente
export const audio = {
  volumeDaMusica: 0.22,
  volumeDosEfeitos: 0.8,
  msEntreIguais: 60,
  msDaTrocaDeMusica: 600,
  msDaTrocaDoCombate: 1800,
  segundosAFrente: 0.6,
  msDoAgendador: 120,
}
