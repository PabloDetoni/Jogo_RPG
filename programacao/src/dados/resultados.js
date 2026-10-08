// Os 4 resultados da partida (RF47). Não existe empate.
// amarelo: aparece em amarelo no resumo. cutscene: passa pela cutscene antes do resumo.
export const resultados = {
  grandeVitoria: { nome: 'Grande Vitória', motivo: 'Retorno normal' },
  vitoria: { nome: 'Vitória', motivo: 'Retorno normal' },
  retornoForcado: { nome: 'Retorno forçado', motivo: 'Fuga com a Pedra de Retorno', amarelo: true },
  derrota: { nome: 'Derrota', motivo: 'Todos os personagens desmaiaram', cutscene: true },
}

// Motivo que o Resumo mostra para cada jeito de a partida acabar (regras/fimDaPartida.js)
export const motivosDoFim = {
  retornoNormal: 'Retorno normal ao Reino',
  fuga: 'Fuga com a Pedra de Retorno',
  liderNaoLevantado: 'Líder não levantado em 30 s',
  todosDesmaiaram: 'Todos os personagens desmaiaram',
}
