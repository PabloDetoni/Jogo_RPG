// O Reino e o Mapa em camadas (20/10): as posições vêm em pixels da imagem original (dados/posicoes.js) e a tela usa %.

// Um retângulo em pixels da imagem → posição e tamanho em % da cena (a cena tem a proporção da imagem)
export const estiloNaImagem = (r, imagem) => ({
  left: `${(r.x / imagem.largura) * 100}%`,
  top: `${(r.y / imagem.altura) * 100}%`,
  width: `${(r.largura / imagem.largura) * 100}%`,
  height: `${(r.altura / imagem.altura) * 100}%`,
})

// Um ponto em pixels da imagem → { x, y } em % (para os elementos centrados, .posicionado)
export const pontoEmPorcentagem = (p, imagem) => ({ x: (p.x / imagem.largura) * 100, y: (p.y / imagem.altura) * 100 })
