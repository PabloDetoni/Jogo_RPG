// MINIJOGOS DO PLANALTO (Fase 4, TASK-080 e TASK-081; RF54, Conceito §14). PROVISÓRIO – substituir pelo do grupo
// (mecânica dos minijogos: TASK-016). Cada um dá um recurso próprio e, às vezes, um raro; os números ficam em
// balanceamento.js (minijogos). Não são partida: sem taxa, sem ranking, sem histórico e sem gastar contrato.
export const dadosDosMinijogos = {
  fazenda: { nome: 'Fazenda', titulo: 'Colheita', regra: 'Clique nas plantas maduras (douradas) antes que murchem.', item: 'trigo', raro: 'ervaMedicinal' },
  mina: { nome: 'Mina', titulo: 'Quebrar pedras', regra: 'Clique 3 vezes em cada pedra para quebrar. Algumas têm cristal.', item: 'minerioDeFerro', raro: 'cristal' },
  lago: { nome: 'Lago', titulo: 'Pescaria', regra: 'Quando a boia afundar, clique rápido para fisgar. Antes da hora, o peixe foge.', item: 'peixe', raro: 'perolaDoLago' },
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
