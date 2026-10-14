// CARREGAMENTO DA PARTIDA (ajustes de 14/10/2026): junta o andamento de cada etapa num progresso só, de 0 a 1, e diz em
// que etapa está. Etapas, na ordem: o motor do jogo (o Phaser, que só carrega ao abrir a partida), a arte (as imagens que
// já chegaram), os sons e o mapa montado. Cada etapa vai de 0 a 1; o peso diz quanto ela vale no total.

export const etapasDoCarregamento = [
  { id: 'motor', nome: 'Preparando o motor do jogo', peso: 0.3 },
  { id: 'arte', nome: 'Carregando a arte', peso: 0.45 },
  { id: 'som', nome: 'Carregando os sons', peso: 0.15 },
  { id: 'mundo', nome: 'Montando o mapa', peso: 0.1 },
]

export const carregamentoInicial = () => ({ motor: 0, arte: 0, som: 0, mundo: 0 })

// { fracao, etapa }: a fração do total e o nome da primeira etapa que ainda não acabou
export function progressoDoCarregamento(andamento) {
  let fracao = 0
  let etapa = null
  for (const { id, nome, peso } of etapasDoCarregamento) {
    const parte = Math.min(1, Math.max(0, Number(andamento?.[id]) || 0))
    fracao += parte * peso
    if (parte < 1 && !etapa) etapa = nome
  }
  return { fracao: Math.min(1, Math.round(fracao * 1000) / 1000), etapa: etapa ?? 'Pronto' }
}

// Passou do tempo? (sem o mapa montado depois de msLimite)
export function demorouDemais(inicio, agora, andamento, msLimite) {
  return (Number(andamento?.mundo) || 0) < 1 && agora - inicio > msLimite
}
