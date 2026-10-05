// Biomas em volta do Planalto. No beta, só a Floresta pode ser escolhida (Conceito §18).
export const biomas = [
  { id: 'floresta', nome: 'Floresta', noBeta: true },
  { id: 'deserto', nome: 'Deserto', noBeta: false },
  { id: 'tundra', nome: 'Tundra', noBeta: false },
  { id: 'vulcanico', nome: 'Vulcânico', noBeta: false },
]

// Onde o jogador pode nascer (RF32). Só o início do bioma vem liberado;
// as regiões abrem depois de descobertas (etapa 6).
export const pontosDePartida = [
  { id: 'inicio', nome: 'Início do bioma', sempreLiberado: true },
  { id: 'facil', nome: 'Fácil' },
  { id: 'media', nome: 'Média' },
  { id: 'dificil', nome: 'Difícil' },
  { id: 'muitoDificil', nome: 'Muito difícil' },
]
