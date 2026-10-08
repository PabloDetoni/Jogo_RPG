// Tipos de missão da Guilda (RF26). O quadro de missões do beta (TASK-015) entra na etapa 7.
// - matar: derrotar "quantidade" monstros do tipo "alvo"
// - coletar: pegar "quantidade" itens "alvo" (conta ao pegar, mesmo que depois venda)
// - entregar: ter "quantidade" itens "alvo" na hora de entregar; eles são consumidos
// - explorar: visitar o local "alvo" depois de aceitar
export const tiposDeMissao = ['matar', 'coletar', 'entregar', 'explorar']

const verbos = { matar: 'Derrotar', coletar: 'Coletar', entregar: 'Entregar', explorar: 'Explorar' }

// Missão ativa em uma linha, para o HUD do Reino: "Derrotar 10 lobo (4/10)". null = nenhuma.
export function descreverMissao(missao) {
  if (!missao) return null
  if (missao.tipo === 'explorar') return `Explorar ${missao.alvo} (${missao.progresso >= missao.quantidade ? 'feito' : 'a fazer'})`
  return `${verbos[missao.tipo]} ${missao.quantidade} ${missao.alvo} (${missao.progresso}/${missao.quantidade})`
}
