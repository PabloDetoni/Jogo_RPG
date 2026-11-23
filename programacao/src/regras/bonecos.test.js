import { describe, expect, it } from 'vitest'
import { bichosEmBlocos, chapeusDasClasses, medidasDoBoneco, poseDosBonecos } from '../dados/bonecos.js'
import { classes, corDaClasse } from '../dados/classes.js'
import { anguloNoCorpo, balancoDoBoneco, chapeuDaClasse, escalaDoBicho, escurecer, ladoDoCorpo, pecasDoBicho, pecasDoBoneco, poseEmQuadros, socoDoAtaque } from './bonecos.js'

const graus = (g) => (g * Math.PI) / 180
// O canto mais à esquerda, mais à direita, mais alto e mais baixo de uma lista de formas
function limites(pecas) {
  const xs = []
  const ys = []
  for (const p of pecas) {
    if (p.forma === 'ret') xs.push(p.x, p.x + p.largura), ys.push(p.y, p.y + p.altura)
    if (p.forma === 'poli') for (const ponto of p.pontos) xs.push(ponto.x), ys.push(ponto.y)
    if (p.forma === 'circulo') xs.push(p.x - p.raio, p.x + p.raio), ys.push(p.y - p.raio, p.y + p.raio)
    if (p.forma === 'linha') xs.push(p.x1, p.x2), ys.push(p.y1, p.y2)
  }
  return { esquerda: Math.min(...xs), direita: Math.max(...xs), topo: Math.min(...ys), baixo: Math.max(...ys) }
}

describe('bonecos em blocos dos personagens (RNF15, Parte 4)', () => {
  it('cada classe tem o seu chapéu, e o Tanque nenhum', () => {
    for (const classe of classes) expect(chapeusDasClasses, classe.id).toHaveProperty(classe.id)
    expect(chapeuDaClasse('tanque')).toBeNull()
    expect(chapeuDaClasse('guerreiro')).toBe('elmo')
    expect(chapeuDaClasse('mago')).toBe('chapeuDeMago')
    expect(chapeuDaClasse('arqueiro')).toBe('capuz')
    expect(chapeuDaClasse('sacerdote')).toBe('mitra')
  })

  it('cabeçudinho: a cabeça é maior que o tronco; mãos e pés soltos; tudo na cor da classe', () => {
    const cor = corDaClasse('tanque')
    const pecas = pecasDoBoneco({ cor, chapeu: null })
    const naCor = pecas.filter((p) => p.cor === cor)
    // 2 pés, 2 mãos, o tronco e a cabeça
    expect(naCor).toHaveLength(6)
    const [peTras, peFrente, maoTras, tronco, cabeca, maoFrente] = naCor
    expect(cabeca.largura).toBeGreaterThan(tronco.largura)
    expect(cabeca.y + cabeca.altura).toBeCloseTo(tronco.y, 0) // o tronco encosta embaixo da cabeça
    for (const pe of [peTras, peFrente]) expect(pe.y).toBeGreaterThan(tronco.y + tronco.altura) // pés soltos, embaixo
    for (const mao of [maoTras, maoFrente]) expect(Math.abs(mao.x + mao.largura / 2)).toBeGreaterThan(tronco.largura / 2) // dos lados
  })

  it('o desenho cabe perto do tamanho 40 (a hitbox não muda); o chapéu pode passar um pouco por cima', () => {
    for (const classe of classes) {
      const { esquerda, direita, baixo } = limites(pecasDoBoneco({ cor: corDaClasse(classe.id), chapeu: chapeuDaClasse(classe.id) }))
      expect(esquerda, classe.id).toBeGreaterThanOrEqual(-24)
      expect(direita, classe.id).toBeLessThanOrEqual(24)
      expect(baixo, classe.id).toBeLessThanOrEqual(23)
    }
  })

  it('olhinhos abertos; caído, fechados; o elmo cobre os olhos (a fenda no lugar)', () => {
    const olhos = (pecas) => pecas.filter((p) => p.cor === medidasDoBoneco.olhos && p.forma === 'ret' && p.largura < 4)
    expect(olhos(pecasDoBoneco({ cor: 1, chapeu: null }))).toHaveLength(2)
    const caidos = olhos(pecasDoBoneco({ cor: 1, chapeu: null }, { caido: true }))
    expect(caidos).toHaveLength(2)
    for (const o of caidos) expect(o.altura).toBeLessThan(2)
    expect(olhos(pecasDoBoneco({ cor: 1, chapeu: 'elmo' }))).toHaveLength(0)
  })

  it('olhando para a esquerda, o desenho é o espelho', () => {
    const direita = pecasDoBoneco({ cor: 1, chapeu: null }, { lado: 'direita' })
    const esquerda = pecasDoBoneco({ cor: 1, chapeu: null }, { lado: 'esquerda' })
    direita.forEach((p, i) => {
      expect(esquerda[i].x).toBeCloseTo(-(p.x + p.largura))
      expect(esquerda[i].y).toBeCloseTo(p.y)
    })
  })

  it('o "soquinho": a mão da frente vai na direção da mira (sem arma desenhada)', () => {
    const parado = pecasDoBoneco({ cor: 1 }, { lado: 'direita' }).at(-1)
    const socoFrente = pecasDoBoneco({ cor: 1 }, { lado: 'direita', soco: { angulo: 0, avanco: 8 } }).at(-1)
    expect(socoFrente.x - parado.x).toBeCloseTo(8)
    const socoCima = pecasDoBoneco({ cor: 1 }, { lado: 'direita', soco: { angulo: graus(-90), avanco: 8 } }).at(-1)
    expect(socoCima.y - parado.y).toBeCloseTo(-8)
    expect(socoDoAtaque(poseDosBonecos.soco.pico)).toBeCloseTo(poseDosBonecos.soco.distancia)
    expect(socoDoAtaque(1)).toBe(0)
    expect(socoDoAtaque(-0.1)).toBe(0)
  })
})

describe('o lado do corpo, a "viradinha" e o balanço', () => {
  it('olha para o lado da mira; perto da vertical, não vira (sem pisca-pisca)', () => {
    expect(ladoDoCorpo(0)).toBe('direita')
    expect(ladoDoCorpo(Math.PI)).toBe('esquerda')
    expect(ladoDoCorpo(graus(-90), 'esquerda')).toBe('esquerda')
    expect(ladoDoCorpo(graus(95), 'direita')).toBe('direita')
    expect(ladoDoCorpo(graus(-60), 'esquerda')).toBe('direita')
  })

  it('no lado esquerdo, o ângulo é espelhado: mirar para a esquerda é "para a frente" do corpo', () => {
    expect(anguloNoCorpo(Math.PI, 'esquerda')).toBeCloseTo(0)
    expect(anguloNoCorpo(graus(135), 'esquerda')).toBeCloseTo(graus(45))
  })

  it('parado: só sobe e desce de leve (os pés não mexem); andando: os pés alternam', () => {
    const parado = balancoDoBoneco(1, false)
    expect(parado.peDaFrente).toBe(0)
    expect(Math.abs(parado.corpoY)).toBeLessThanOrEqual(poseDosBonecos.parado.corpo)
    const andando = balancoDoBoneco(Math.PI / 2, true)
    expect(andando.peDaFrente).toBeCloseTo(poseDosBonecos.andando.pe)
    expect(andando.peDeTras).toBeCloseTo(-poseDosBonecos.andando.pe)
    expect(andando.levantaFrente).toBeGreaterThan(0)
  })

  it('escurecer: 0 não muda, 1 é preto', () => {
    expect(escurecer(0xff8a1f, 0)).toBe(0xff8a1f)
    expect(escurecer(0xff8a1f, 1)).toBe(0)
    expect(escurecer(0xffffff, 0.5)).toBe(0x808080)
  })
})

describe('mobs e animais em blocos (Parte 4b)', () => {
  it('lobo, javali e cervo são quadrúpedes com 4 pezinhos; cada um com o seu detalhe e a sua cor', () => {
    const cores = new Set()
    for (const tipo of ['lobo', 'javali', 'cervo']) {
      const receita = bichosEmBlocos[tipo]
      expect(receita.forma).toBe('quadrupede')
      expect(receita.pes.xs).toHaveLength(4)
      cores.add(receita.cor)
      // o corpo é deitado (mais largo que alto), e o desenho tem os 4 pés
      expect(receita.corpo.largura, tipo).toBeGreaterThan(receita.corpo.altura)
      expect(pecasDoBicho(tipo).length, tipo).toBeGreaterThanOrEqual(8)
    }
    expect(cores.size).toBe(3)
    expect(new Set(['lobo', 'javali', 'cervo'].map((t) => bichosEmBlocos[t].detalhe))).toEqual(new Set(['orelhas', 'presas', 'chifres']))
  })

  it('a aranha é redonda, com 4 patinhas de cada lado (cada uma com joelho) que mexem andando', () => {
    const parada = pecasDoBicho('aranha', { fase: 0, andando: false })
    expect(parada.filter((p) => p.forma === 'linha')).toHaveLength(16)
    expect(parada.filter((p) => p.forma === 'circulo')).toHaveLength(2)
    const a = pecasDoBicho('aranha', { fase: 0, andando: true }).filter((p) => p.forma === 'linha')
    const b = pecasDoBicho('aranha', { fase: 1.2, andando: true }).filter((p) => p.forma === 'linha')
    expect(a.some((p, i) => Math.abs(p.x2 - b[i].x2) > 0.5)).toBe(true)
  })

  it('espelha para o lado em que anda; sem receita, nada (o mob de teste da arena continua quadrado)', () => {
    const direita = limites(pecasDoBicho('lobo', { lado: 'direita' }))
    const esquerda = limites(pecasDoBicho('lobo', { lado: 'esquerda' }))
    expect(esquerda.direita).toBeCloseTo(-direita.esquerda)
    expect(pecasDoBicho('mobVermelho')).toEqual([])
  })

  it('a escala acompanha o tamanho do mob', () => {
    expect(escalaDoBicho('lobo', bichosEmBlocos.lobo.tamanhoDeReferencia)).toBe(1)
    expect(escalaDoBicho('lobo', bichosEmBlocos.lobo.tamanhoDeReferencia * 2)).toBe(2)
    expect(escalaDoBicho('desconhecido', 50)).toBe(1)
  })
})

describe('a pose em poucos quadros (cada quadro vira uma textura feita uma vez: desempenho)', () => {
  it('o balanço tem quadrosDoBalanco quadros por volta; o mesmo quadro dá o mesmo nome', () => {
    const nomes = new Set()
    for (let i = 0; i < 200; i++) nomes.add(poseEmQuadros({ fase: (i / 200) * Math.PI * 2, andando: true }).nome)
    expect(nomes.size).toBe(poseDosBonecos.quadrosDoBalanco)
    expect(poseEmQuadros({ fase: 0.01 }).nome).toBe(poseEmQuadros({ fase: 0.02 }).nome)
    expect(poseEmQuadros({ fase: 1, lado: 'esquerda' }).nome).not.toBe(poseEmQuadros({ fase: 1, lado: 'direita' }).nome)
  })

  it('o soquinho em poucos níveis e 8 direções; durante ele, e caído, sem balanço', () => {
    const nomes = new Set()
    for (let a = 0; a < 64; a++) for (let v = 1; v <= 9; v++) nomes.add(poseEmQuadros({ fase: a, andando: true, soco: { angulo: (a / 64) * Math.PI * 2, avanco: v } }).nome)
    expect(nomes.size).toBeLessThanOrEqual(poseDosBonecos.niveisDoSoco * 8)
    const caido = poseEmQuadros({ fase: 2, andando: true, caido: true, soco: { angulo: 0, avanco: 5 } })
    expect(caido).toMatchObject({ andando: false, fase: 0, soco: null })
  })
})

