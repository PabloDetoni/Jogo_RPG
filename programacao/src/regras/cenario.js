// O Reino e o Mapa em camadas (20/10/2026): regras puras do clique pelo desenho e das animações do cenário.
// Tudo em pixels da imagem original (dados/posicoes.js); a tela só converte o ponto do mouse para eles.

// ---------- Clique pelo formato da peça ----------

// O ponto do mouse (na tela) em pixels da imagem: "caixa" é o retângulo da cena na tela (getBoundingClientRect)
export function pontoNaImagem(caixa, x, y, imagem) {
  return {
    x: ((x - caixa.left) / caixa.width) * imagem.largura,
    y: ((y - caixa.top) / caixa.height) * imagem.altura,
  }
}

// A máscara de uma peça a partir da transparência dela (os alfas, um por pixel, numa grade largura × altura, que pode
// ser menor que a peça): 1 onde o desenho é visível. "folga" engorda a máscara em volta (em pontos da grade), para o
// clique bem na beirada do desenho também valer; nunca vira um retângulo que pega o vizinho.
export function mascaraDaTransparencia(alfas, largura, altura, { limiar = 40, folga = 1 } = {}) {
  const visivel = new Uint8Array(largura * altura)
  for (let i = 0; i < visivel.length; i++) visivel[i] = alfas[i] > limiar ? 1 : 0
  let dados = visivel
  for (let passo = 0; passo < folga; passo++) {
    const maior = new Uint8Array(dados)
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        if (dados[y * largura + x]) continue
        const vizinho =
          (x > 0 && dados[y * largura + x - 1]) ||
          (x < largura - 1 && dados[y * largura + x + 1]) ||
          (y > 0 && dados[(y - 1) * largura + x]) ||
          (y < altura - 1 && dados[(y + 1) * largura + x])
        if (vizinho) maior[y * largura + x] = 1
      }
    }
    dados = maior
  }
  return { largura, altura, dados }
}

// O ponto cai no desenho da peça? Sem máscara (a imagem ainda não chegou), vale o retângulo dela.
export function tocaNaPeca(peca, ponto, mascara = null) {
  const dentro = ponto.x >= peca.x && ponto.x < peca.x + peca.largura && ponto.y >= peca.y && ponto.y < peca.y + peca.altura
  if (!dentro) return false
  if (!mascara) return true
  const mx = Math.min(mascara.largura - 1, Math.floor(((ponto.x - peca.x) / peca.largura) * mascara.largura))
  const my = Math.min(mascara.altura - 1, Math.floor(((ponto.y - peca.y) / peca.altura) * mascara.altura))
  return mascara.dados[my * mascara.largura + mx] === 1
}

// A peça clicável no ponto: as peças vêm da de cima para a de baixo, e a de cima ganha. Uma peça sem clique (o
// castelo do Reino, a base do Planalto) por cima tapa as de baixo. null: nenhuma (o chão entre dois objetos).
export function pecaNoPonto(pecas, ponto, mascaras = {}) {
  for (const peca of pecas) {
    if (tocaNaPeca(peca, ponto, mascaras[peca.id] ?? null)) return peca.clicavel === false ? null : peca.id
  }
  return null
}

// ---------- Animações (todas lentas; "segundos" é o tempo desde que a tela abriu) ----------

// Animação ligada: a opção das Configurações e o "reduzir movimento" do sistema (este manda)
export function animacoesLigadas(preferencia, reduzirMovimento) {
  return preferencia !== false && !reduzirMovimento
}

// Um número entre 0 e 1 sempre igual para o mesmo índice (as partículas não precisam guardar nada)
export function sorteioFixo(indice) {
  const x = Math.sin(indice * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Onde a nuvem está (x): anda para a direita e, passando de "fim", volta antes de "inicio" (escondida atrás da copa).
// No tempo 0 está no lugar da imagem.
export function posicaoDaNuvem(nuvem, segundos, velocidade, inicio, fim) {
  const volta = fim - inicio + nuvem.largura
  const andado = nuvem.x - inicio + nuvem.largura + velocidade * segundos
  return inicio - nuvem.largura + (((andado % volta) + volta) % volta)
}

// A luz da lanterna: tremula de leve (duas ondas lentas somadas), nunca apaga nem estoura
export function brilhoDaLanterna(segundos, { base, variacao, periodo }) {
  const onda = 0.6 * Math.sin((2 * Math.PI * segundos) / periodo) + 0.4 * Math.sin((2 * Math.PI * segundos) / (periodo * 0.37) + 1)
  return Math.max(0, base + variacao * onda)
}

// Uma bolinha de fumaça (índice 0, 1, 2...): sobe, abre e some; as bolinhas saem uma depois da outra
export function particulaDeFumaca(segundos, indice, { vida, quantas, subida, deriva, raioInicial, raioFinal, alfa }) {
  const idade = (segundos + (indice * vida) / quantas) % vida
  const p = idade / vida
  const balancando = Math.sin(segundos * 0.9 + indice * 1.7) * 2
  return {
    dx: deriva * p + balancando * p,
    dy: -subida * p,
    raio: raioInicial + (raioFinal - raioInicial) * p,
    alfa: alfa * (p < 0.15 ? p / 0.15 : (1 - p) / 0.85),
  }
}

// O brilho de um ponto na água: acende e apaga devagar, cada ponto no seu tempo
export function brilhoNaAgua(segundos, indice, { periodo, alfa }) {
  const fase = sorteioFixo(indice) * periodo
  const onda = Math.sin((2 * Math.PI * (segundos + fase)) / periodo)
  return onda > 0.55 ? alfa * ((onda - 0.55) / 0.45) : 0
}

// A lava clareando e escurecendo (a força do brilho por cima dela, entre o mínimo e o máximo)
export function pulsoDaLava(segundos, { periodo, minimo, maximo }) {
  return minimo + (maximo - minimo) * (0.5 - 0.5 * Math.cos((2 * Math.PI * segundos) / periodo))
}

// A fumaça do vulcão (a peça do Pablo): duas cópias que sobem devagar, uma depois da outra; cada uma aparece embaixo,
// cresce um pouco e some em cima. "indice" é a cópia (0 ou 1). No tempo 0, a cópia 0 está inteira no lugar da imagem
// (é o quadro parado) e a outra começa a aparecer; somadas, a fumaça nunca some nem fica mais forte que a peça.
export function fumacaQueSobe(segundos, indice, { periodo, copias, subida, crescimento }) {
  const p = (((segundos / periodo + 0.5 + indice / copias) % 1) + 1) % 1
  return {
    dy: subida * (0.5 - p),
    escala: 1 + crescimento * (p - 0.5),
    alfa: Math.sin(Math.PI * p),
  }
}

// Um floco de neve dentro da área (x, y, largura, altura): cai devagar balançando e volta por cima
export function flocoDeNeve(segundos, indice, area, { velocidade, balanco: lado }) {
  const x0 = sorteioFixo(indice) * area.largura
  const y0 = sorteioFixo(indice + 500) * area.altura
  const queda = (y0 + segundos * velocidade * (0.7 + 0.6 * sorteioFixo(indice + 900))) % area.altura
  return { x: area.x + x0 + Math.sin(segundos * 0.8 + indice) * lado, y: area.y + queda }
}

// Onde está a faixa de vento passando pela área (x do meio), da esquerda para a direita, uma vez a cada período
export function faixaDeVento(segundos, { periodo, largura }, area) {
  const p = (segundos % periodo) / periodo
  return area.x - largura + p * (area.largura + 2 * largura)
}
