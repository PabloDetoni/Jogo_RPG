// CONQUISTAS (Fase 4, TASK-103; RF17, Conceito §13). PROVISÓRIO – substituir pelo do grupo (conquistas do beta: TASK-015).
// Para trocar, mude só esta lista: o save guarda só quais foram concluídas, e o progresso sai das estatísticas do jogo.
//
// condicao.tipo:
// - 'estatistica': o campo de progresso.estatisticas (partidasJogadas, monstrosDerrotados, bossesDerrotados,
//   grandesVitorias, missoesEntregues) chega à meta;
// - 'nivel': algum personagem permanente chega ao nível da meta;
// - 'areas': as áreas descobertas do bioma (o mapa salvo) chegam à meta;
// - 'classes': quantos personagens permanentes o jogador tem;
// - 'ouro': o ouro que o jogador tem agora.
// recompensa: ouro, dado uma vez só ao concluir (algumas não dão nada, como no Conceito).
export const conquistas = [
  { id: 'primeirosPassos', nome: 'Primeiros passos', descricao: 'Jogue a primeira partida.', condicao: { tipo: 'estatistica', campo: 'partidasJogadas', meta: 1 }, recompensa: { ouro: 20 } },
  { id: 'cacador', nome: 'Caçador', descricao: 'Derrote 50 monstros.', condicao: { tipo: 'estatistica', campo: 'monstrosDerrotados', meta: 50 }, recompensa: { ouro: 100 } },
  { id: 'exterminador', nome: 'Exterminador', descricao: 'Derrote 1.000 monstros.', condicao: { tipo: 'estatistica', campo: 'monstrosDerrotados', meta: 1000 }, recompensa: { ouro: 300 } },
  { id: 'lendaDaFloresta', nome: 'Lenda da Floresta', descricao: 'Derrote 10.000 monstros.', condicao: { tipo: 'estatistica', campo: 'monstrosDerrotados', meta: 10000 }, recompensa: { ouro: 1000 } },
  { id: 'quedaDoGuardiao', nome: 'Queda do Guardião', descricao: 'Derrote o Guardião da Floresta.', condicao: { tipo: 'estatistica', campo: 'bossesDerrotados', meta: 1 }, recompensa: { ouro: 200 } },
  { id: 'grandeVitoria', nome: 'Volta triunfal', descricao: 'Consiga uma Grande Vitória.', condicao: { tipo: 'estatistica', campo: 'grandesVitorias', meta: 1 }, recompensa: { ouro: 100 } },
  { id: 'aServicoDaGuilda', nome: 'A serviço da Guilda', descricao: 'Entregue 5 missões na Guilda.', condicao: { tipo: 'estatistica', campo: 'missoesEntregues', meta: 5 }, recompensa: { ouro: 150 } },
  { id: 'explorador', nome: 'Explorador', descricao: 'Descubra todas as áreas da Floresta.', condicao: { tipo: 'areas', bioma: 'floresta', meta: 9 }, recompensa: { ouro: 150 } },
  { id: 'aventureiro', nome: 'Aventureiro', descricao: 'Leve um personagem ao nível 10.', condicao: { tipo: 'nivel', meta: 10 }, recompensa: { ouro: 100 } },
  { id: 'mestre', nome: 'Mestre', descricao: 'Leve um personagem ao nível 100.', condicao: { tipo: 'nivel', meta: 100 }, recompensa: { ouro: 2000 } },
  { id: 'grupoCompleto', nome: 'Grupo completo', descricao: 'Tenha as 5 classes como personagens permanentes.', condicao: { tipo: 'classes', meta: 5 }, recompensa: { ouro: 300 } },
  { id: 'cofreCheio', nome: 'Cofre cheio', descricao: 'Tenha 2.000 de ouro de uma vez.', condicao: { tipo: 'ouro', meta: 2000 }, recompensa: null },
]
