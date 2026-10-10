// SONS DO JOGO (Fase 4, TASK-105; RF18). Os arquivos são os da Lista de Arte e Som (documentacao/Lista_de_Arte_e_Som.md,
// TASK-104). Para pôr um som no jogo: salve o arquivo em programacao/src/assets/audio/ com o nome desta lista (por
// exemplo, musica-reino.ogg ou acerto.ogg; .mp3 e .wav também servem). O jogo encontra sozinho os arquivos que existem
// (audio/arquivos.js); não precisa mexer em código.
// Até um efeito ter arquivo, toca um bipe curto gerado pelo navegador (PROVISÓRIO: "bipe" = frequência em Hz, duração em
// ms e forma da onda). Música sem arquivo fica em silêncio.

export const musicas = {
  reino: 'musica-reino', // Tela inicial, Reino e as outras telas fora da partida
  floresta: 'musica-floresta', // Partida na Floresta (em loop)
  boss: 'musica-boss', // Com o Boss por perto (opcional: sem arquivo, continua a da Floresta)
  derrota: 'musica-derrota', // Cutscene da Derrota (curta)
}

export const efeitos = {
  ataqueGuerreiro: { arquivo: 'ataque-guerreiro', bipe: { hz: 220, ms: 70, onda: 'sawtooth' } },
  ataqueArqueiro: { arquivo: 'ataque-arqueiro', bipe: { hz: 880, ms: 50, onda: 'triangle' } },
  ataqueMago: { arquivo: 'ataque-mago', bipe: { hz: 520, ms: 110, onda: 'sine' } },
  ataqueTanque: { arquivo: 'ataque-tanque', bipe: { hz: 140, ms: 90, onda: 'square' } },
  ataqueSacerdote: { arquivo: 'ataque-sacerdote', bipe: { hz: 660, ms: 140, onda: 'sine' } },
  acerto: { arquivo: 'acerto', bipe: { hz: 300, ms: 40, onda: 'square' } },
  critico: { arquivo: 'critico', bipe: { hz: 990, ms: 90, onda: 'sawtooth' } },
  bloqueio: { arquivo: 'bloqueio', bipe: { hz: 180, ms: 60, onda: 'square' } },
  esquiva: { arquivo: 'esquiva', bipe: { hz: 600, ms: 60, onda: 'triangle' } },
  desmaio: { arquivo: 'desmaio', bipe: { hz: 160, ms: 260, onda: 'sine' } },
  levantar: { arquivo: 'levantar', bipe: { hz: 740, ms: 200, onda: 'sine' } },
  perdido: { arquivo: 'perdido', bipe: { hz: 110, ms: 320, onda: 'triangle' } },
  nivel: { arquivo: 'nivel', bipe: { hz: 1040, ms: 240, onda: 'triangle' } },
  moeda: { arquivo: 'moeda', bipe: { hz: 1320, ms: 60, onda: 'square' } },
  clique: { arquivo: 'clique', bipe: { hz: 1500, ms: 18, onda: 'square' } },
  fuga: { arquivo: 'fuga', bipe: { hz: 420, ms: 300, onda: 'sawtooth' } },
}

// Volumes (0 a 1) e o tempo mínimo entre dois iguais (um golpe em área acerta vários de uma vez: toca uma vez só)
export const audio = { volumeDaMusica: 0.35, volumeDosEfeitos: 0.5, volumeDoBipe: 0.12, msEntreIguais: 60, msDaTrocaDeMusica: 600 }
