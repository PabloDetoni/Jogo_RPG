// FLORESTA (Fase 3, TASK-060 a TASK-065).
// PROVISÓRIO – substituir pelo do grupo (layout: TASK-013). Trocar aqui não mexe no código.
//
// Mapa em px (o Líder anda 220 px/s: atravessar a Floresta em linha reta leva cerca de meio minuto).
// Começa estreita na zona segura, perto do Reino (à esquerda), e se abre em regiões cada vez mais difíceis, até o
// domínio do Boss, no fundo (à direita). Fora das regiões é mata fechada: ninguém atravessa.
// Regiões e áreas são faixas { x0, x1, y0, y1 } (cantos); "inicio" é onde o grupo nasce ao escolher aquele ponto
// de partida (RF32); "chao" é o tom de verde do chão, para dar para perceber a região até a arte chegar.

export const floresta = {
  id: 'floresta',
  nome: 'Floresta',
  tamanho: { largura: 7200, altura: 3600 },
  // Sorteio das árvores e pedras (regras/mundo.js): a mesma semente, o mesmo mapa toda vez
  semente: 2026,
  regioes: [
    {
      id: 'zonaSegura',
      nome: 'Zona segura',
      dificuldade: 'segura',
      pontoDePartida: 'inicio',
      x0: 0,
      x1: 1000,
      y0: 1500,
      y1: 2100,
      inicio: { x: 220, y: 1800 },
      chao: 0x86d873,
      mancha: 0x77c965,
    },
    {
      id: 'facil',
      nome: 'Fácil',
      dificuldade: 'facil',
      pontoDePartida: 'facil',
      x0: 1000,
      x1: 2800,
      y0: 1000,
      y1: 2600,
      inicio: { x: 1180, y: 1800 },
      chao: 0x5cc85a,
      mancha: 0x4fb84e,
    },
    {
      id: 'media',
      nome: 'Média',
      dificuldade: 'media',
      pontoDePartida: 'media',
      x0: 2800,
      x1: 4600,
      y0: 500,
      y1: 3100,
      inicio: { x: 2980, y: 1800 },
      chao: 0x43a54c,
      mancha: 0x3a9643,
    },
    {
      id: 'dificil',
      nome: 'Difícil',
      dificuldade: 'dificil',
      pontoDePartida: 'dificil',
      x0: 4600,
      x1: 6000,
      y0: 200,
      y1: 3400,
      inicio: { x: 4780, y: 1800 },
      chao: 0x2f8a40,
      mancha: 0x287a37,
    },
    {
      id: 'dominioDoBoss',
      nome: 'Domínio do Boss',
      dificuldade: 'boss',
      pontoDePartida: 'muitoDificil',
      dominioDeBoss: true,
      x0: 6000,
      x1: 7200,
      y0: 1000,
      y1: 2600,
      inicio: { x: 6160, y: 1800 },
      chao: 0x2c6448,
      mancha: 0x24563d,
    },
  ],
  // Áreas com nome dentro das regiões: a primeira vez que o grupo entra em cada uma dá XP (RF40)
  areas: [
    { id: 'trilhaDoReino', nome: 'Trilha do Reino', regiao: 'zonaSegura', x0: 0, x1: 1000, y0: 1500, y1: 2100 },
    { id: 'clareiraDasFlores', nome: 'Clareira das Flores', regiao: 'facil', x0: 1000, x1: 1900, y0: 1000, y1: 2600 },
    { id: 'bosqueDosLobos', nome: 'Bosque dos Lobos', regiao: 'facil', x0: 1900, x1: 2800, y0: 1000, y1: 2600 },
    { id: 'riachoSeco', nome: 'Riacho Seco', regiao: 'media', x0: 2800, x1: 3700, y0: 500, y1: 1800 },
    { id: 'valeDasAranhas', nome: 'Vale das Aranhas', regiao: 'media', x0: 2800, x1: 3700, y0: 1800, y1: 3100 },
    { id: 'matagal', nome: 'Matagal', regiao: 'media', x0: 3700, x1: 4600, y0: 500, y1: 3100 },
    { id: 'pedrasAltas', nome: 'Pedras Altas', regiao: 'dificil', x0: 4600, x1: 5300, y0: 200, y1: 3400 },
    { id: 'coracaoDaMata', nome: 'Coração da Mata', regiao: 'dificil', x0: 5300, x1: 6000, y0: 200, y1: 3400 },
    { id: 'clareiraDoGuardiao', nome: 'Clareira do Guardião', regiao: 'dominioDoBoss', x0: 6000, x1: 7200, y0: 1000, y1: 2600 },
  ],
  // Onde o Boss fica (TASK-065): no meio do domínio dele
  lugarDoBoss: { x: 6750, y: 1800 },
  // Quantos mobs de cada tipo em cada região, a cada partida (as fichas ficam em balanceamento.js, mundo.mobs).
  // PROVISÓRIO – substituir pelo do grupo (TASK-012). A zona segura não tem mobs.
  populacao: {
    facil: { lobo: 6, cervo: 4, aranha: 2 },
    media: { lobo: 6, aranha: 5, javali: 3, cervo: 3 },
    dificil: { lobo: 7, aranha: 6, javali: 5, cervo: 2 },
    dominioDoBoss: { lobo: 2 },
  },
  cores: {
    mata: 0x1d4425, // a mata fechada (parede)
    copa: 0x2a6532, // as copas desenhadas na beira da mata
    copaClara: 0x357a3b,
    arvore: 0x2e6e36, // as árvores soltas no caminho
    tronco: 0x6b4a2b,
    pedra: 0x9aa3ad,
  },
}
