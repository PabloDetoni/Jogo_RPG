// MINIJOGOS DO PLANALTO (Fase 4, TASK-080 e TASK-081; RF54, Conceito §14). PROVISÓRIO – substituir pelo do grupo
// (mecânica dos minijogos: TASK-016). Cada um dá um recurso próprio e, às vezes, um raro; os números ficam em
// balanceamento.js (minijogos). Não são partida: sem taxa, sem ranking, sem histórico e sem gastar contrato.
export const dadosDosMinijogos = {
  fazenda: { nome: 'Fazenda', titulo: 'Colheita', regra: 'Clique nas plantas maduras (douradas) antes que murchem.', item: 'trigo', raro: 'ervaMedicinal' },
  mina: { nome: 'Mina', titulo: 'Quebrar pedras', regra: 'Clique 3 vezes em cada pedra para quebrar. Algumas têm cristal.', item: 'minerioDeFerro', raro: 'cristal' },
  lago: { nome: 'Lago', titulo: 'Pescaria', regra: 'Quando a boia afundar, clique rápido para fisgar. Antes da hora, o peixe foge.', item: 'peixe', raro: 'perolaDoLago' },
}
