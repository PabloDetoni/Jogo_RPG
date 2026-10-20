// Transforma uma posição de dados/posicoes.js ({ x, y } em %) em estilo CSS.
// A classe "posicionado" (index.css) centraliza o elemento nesse ponto.
export function estiloPosicao(posicao) {
  return { left: `${posicao.x}%`, top: `${posicao.y}%` }
}

// Um retângulo de dados/posicoes.js ({ x, y, largura, altura } em %, x e y no canto de cima à esquerda) em estilo CSS:
// as áreas clicáveis em cima das imagens (o Reino desenhado)
export function estiloRetangulo(retangulo) {
  return { left: `${retangulo.x}%`, top: `${retangulo.y}%`, width: `${retangulo.largura}%`, height: `${retangulo.altura}%` }
}
