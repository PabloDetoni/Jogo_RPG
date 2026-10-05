// Transforma uma posição de dados/posicoes.js ({ x, y } em %) em estilo CSS.
// A classe "posicionado" (index.css) centraliza o elemento nesse ponto.
export function estiloPosicao(posicao) {
  return { left: `${posicao.x}%`, top: `${posicao.y}%` }
}
