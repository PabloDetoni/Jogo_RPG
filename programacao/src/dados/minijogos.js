// MINIJOGOS DO PLANALTO (Fase 4, TASK-080 e TASK-081; RF54, Conceito §14). PROVISÓRIO – substituir pelo do grupo
// (mecânica dos minijogos: TASK-016). Cada um dá um recurso próprio e, às vezes, um raro; os números ficam em
// balanceamento.js (minijogos). Não são partida: sem taxa, sem ranking, sem histórico e sem gastar contrato.
export const dadosDosMinijogos = {
  fazenda: { nome: 'Fazenda', titulo: 'Colheita', regra: 'Clique nas plantas maduras (douradas) antes que murchem.', item: 'trigo', raro: 'ervaMedicinal' },
  mina: { nome: 'Mina', titulo: 'Quebrar pedras', regra: 'Clique 3 vezes em cada pedra para quebrar. Algumas têm cristal.', item: 'minerioDeFerro', raro: 'cristal' },
  lago: { nome: 'Lago', titulo: 'Pescaria', regra: 'Quando a boia afundar, clique rápido para fisgar. Antes da hora, o peixe foge.', item: 'peixe', raro: 'perolaDoLago' },
}

// A Fazenda e a Mina desenhadas (Parte 11b), como a pesca: as cenas do canvas, em unidades da cena (o canvas escala
// para caber no campo, 44 × 26). Só desenho: as regras e os tempos continuam em balanceamento.js (minijogos).
export const fazendaDesenhada = {
  largura: 640,
  altura: 380,
  // os 9 canteiros em 3 × 3, do lado direito (o bonequinho começa à esquerda)
  canteiros: { x: 236, y: 46, largura: 112, altura: 88, espaco: 16, colunas: 3 },
  boneco: { x: 116, y: 214, escala: 2.4, velocidade: 900 }, // onde ele começa, o tamanho e a velocidade (px da cena/s)
  // a planta aparece (no lugar do broto) quando faltam msDaPlanta para madurar; o canteiro não guarda quando começou
  msDaPlanta: 1100,
  msDaColheita: 650, // a planta pulando do canteiro para o bonequinho
  cores: {
    grama: '#6aa84f',
    gramaEscura: '#5b9443',
    terra: '#7a5230',
    sulco: '#5e3d22',
    contorno: '#2b1d1a',
    broto: '#8fd16a',
    planta: '#4e9a3a',
    trigo: '#f2c94c',
    brilho: 'rgba(255, 243, 160, 0.55)',
    murcha: '#8a6d4a',
    cerca: '#a07040',
  },
}

export const minaDesenhada = {
  largura: 640,
  altura: 380,
  raioDaPedra: 36,
  boneco: { escala: 2.4, velocidade: 900, distancia: 66 }, // o bonequinho fica a "distancia" da pedra
  msDoGolpe: 260, // a picareta descendo
  msDasFaiscas: 420,
  msDaQuebra: 750, // os pedaços voando e o minério pulando
  faiscas: 9,
  cores: {
    fundo: '#3b3a42',
    parede: '#2c2b31',
    chao: '#55535c',
    pedra: '#8a8f99',
    pedraEscura: '#6b707a',
    racha: '#24232a',
    contorno: '#1d1c22',
    cabo: '#7a5230',
    ferro: '#c9ced6',
    faisca: '#ffd43b',
    minerio: '#c2703d',
    brilhoDoMinerio: '#f4c095',
    lanterna: 'rgba(255, 214, 120, 0.18)',
  },
}

// A pesca visual do Lago (Parte 10): a cena do canvas, em unidades da cena (o canvas escala para caber). Só desenho:
// os tempos da boia continuam em balanceamento.js (minijogos.lago).
export const pesca = {
  largura: 640,
  altura: 300,
  nivelDaAgua: 150, // onde começa a água
  margem: { largura: 210, y: 158 }, // a margem de grama onde o bonequinho fica
  boneco: { x: 118, y: 112, escala: 2.6 }, // o meio do bonequinho e o tamanho do desenho
  vara: { x: 340, y: 58 }, // a ponta da vara, parada
  boia: { x: 470 },
  msDoPuxao: 700, // a vara subindo e o peixe pulando depois do clique
  tamanhoDoAviso: 34,
  cores: {
    ceu: '#bfe3f2',
    agua: '#2f6f9f',
    onda: 'rgba(255, 255, 255, 0.35)',
    margem: '#5aa642',
    vara: '#7a5230',
    linha: '#f2eee6',
    boiaCima: '#ffffff',
    boiaBaixo: '#e03131',
    peixe: '#f08c3c',
    contorno: '#2b1d1a',
    avisoFisgando: '#ffd43b',
    avisoAssustado: '#dee2e6',
  },
}
