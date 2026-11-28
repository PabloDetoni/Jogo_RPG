// Transforma uma posição de dados/posicoes.js ({ x, y } em %) em estilo CSS.
// A classe "posicionado" (index.css) centraliza o elemento nesse ponto.
// Parte 14: "toque" ({ x, y, altura }) é outro lugar só no celular e no tablet (o texto lá é maior: letra mínima de
// 12 px). Vira variáveis de CSS que só valem com data-toque na moldura (estilo/toque.css); altura (em % da altura da
// tela) é a altura máxima do bloco, que rola por dentro quando não cabe. No computador nada muda.
export function estiloPosicao(posicao) {
  const estilo = { left: `${posicao.x}%`, top: `${posicao.y}%` }
  const toque = posicao.toque
  if (toque?.x !== undefined) estilo['--x-no-toque'] = `${toque.x}%`
  if (toque?.y !== undefined) estilo['--y-no-toque'] = `${toque.y}%`
  if (toque?.altura !== undefined) estilo['--altura-no-toque'] = `${toque.altura}cqh`
  return estilo
}

// Um retângulo de dados/posicoes.js ({ x, y, largura, altura } em %, x e y no canto de cima à esquerda) em estilo CSS:
// as áreas clicáveis em cima das imagens (o Reino desenhado)
export function estiloRetangulo(retangulo) {
  return { left: `${retangulo.x}%`, top: `${retangulo.y}%`, width: `${retangulo.largura}%`, height: `${retangulo.altura}%` }
}
