// Os símbolos das placas do Reino (20/10), em pixels (SVG, sem imagem): a coroa do Salão da Glória, a engrenagem das
// Configurações, a banca do Mercado, a bigorna da Forja e as espadas do JOGAR, como na imagem do Pablo.
// Cada símbolo é uma grade de letras; cada letra é uma cor (o "." é vazio).
const cores = {
  o: '#2b1a0c', // contorno
  g: '#f8c400', // dourado
  y: '#ffe680', // dourado claro
  d: '#b06a00', // dourado escuro
  r: '#d41a1a', // vermelho
  w: '#fff6e0', // branco
  b: '#2a6cff', // azul
  s: '#c9ccd6', // aço
  l: '#f2f4fa', // aço claro
  e: '#7a7f8c', // aço escuro
  m: '#8a4a1c', // madeira
  n: '#5a2e10', // madeira escura
}

// A engrenagem: 6 dentes em volta de um disco com um furo no meio (calculada, para sair redonda)
function engrenagem(lado = 15) {
  const meio = (lado - 1) / 2
  const cheio = (x, y) => {
    const d = Math.hypot(x - meio, y - meio)
    if (d < 1.6 || d > 6.9) return false
    if (d <= 4) return true
    const angulo = ((Math.atan2(y - meio, x - meio) * 180) / Math.PI + 360 + 30) % 60
    return angulo < 14 || angulo > 46
  }
  return Array.from({ length: lado }, (_, y) =>
    Array.from({ length: lado }, (_, x) => {
      if (cheio(x, y)) return x + y > 2 * meio + 1 ? 'e' : x + y < 2 * meio - 3 ? 'l' : 's'
      return cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1) ? 'o' : '.'
    }).join(''),
  )
}

const desenhos = {
  coroa: [
    '.o....o....o.',
    'oyo..oyo..oyo',
    'ogo..ogo..ogo',
    'oggoogggooggo',
    'oygggyggggygo',
    'ogrgggbgggrgo',
    'odddddddddddo',
    '.ooooooooooo.',
  ],
  engrenagem: engrenagem(),
  banca: [
    'oooooooooooo',
    'orwrwrwrwrwo',
    'orwrwrwrwrwo',
    '.oooooooooo.',
    '.on......no.',
    '.on.y..g.no.',
    'oooooooooooo',
    'ommmmmmmmmmo',
    'onnnnnnnnnno',
    '.on......no.',
  ],
  bigorna: [
    '..ooooooooo.',
    'ooelllllllso',
    'oesssssssseo',
    '.ooeesssseo.',
    '...oessseo..',
    '...oessseo..',
    '..oeessseeo.',
    '.oeeeeeeeeeo',
    '.ooooooooooo',
  ],
  espadas: [
    'o..........o',
    'lo........ol',
    'olo......olo',
    '.olo....olo.',
    '..olo..olo..',
    '...oloolo...',
    '....ollo....',
    '...oloolo...',
    '..goo..oog..',
    '.gdo....odg.',
    'omo......omo',
    'oo........oo',
  ],
}

// Junta os pixels iguais de cada linha em um retângulo só (menos elementos no SVG)
function retangulos(linhas) {
  const lista = []
  linhas.forEach((linha, y) => {
    let x = 0
    while (x < linha.length) {
      const letra = linha[x]
      let fim = x + 1
      while (fim < linha.length && linha[fim] === letra) fim++
      if (cores[letra]) lista.push({ x, y, largura: fim - x, cor: cores[letra] })
      x = fim
    }
  })
  return lista
}

const simbolosDasPlacas = Object.fromEntries(
  Object.entries(desenhos).map(([nome, linhas]) => [nome, { largura: Math.max(...linhas.map((linha) => linha.length)), altura: linhas.length, linhas, retangulos: retangulos(linhas) }]),
)

export default function SimboloDaPlaca({ nome }) {
  const simbolo = simbolosDasPlacas[nome]
  if (!simbolo) return null
  return (
    <svg className={`simbolo simbolo-${nome}`} viewBox={`0 0 ${simbolo.largura} ${simbolo.altura}`} shapeRendering="crispEdges" aria-hidden="true">
      {simbolo.retangulos.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.largura} height={1} fill={r.cor} />
      ))}
    </svg>
  )
}
