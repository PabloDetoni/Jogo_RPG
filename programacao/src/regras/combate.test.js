import { describe, expect, it } from 'vitest'
import {
  aplicarDano,
  chanceDeCritico,
  circuloTocaRetangulo,
  circuloTocaRetanguloGirado,
  curaDaAura,
  devePerseguir,
  fracaoDaRecarga,
  noArco,
  podeUsar,
  raioDaBolaMagica,
  retangulosSeTocam,
  rolarCritico,
  segmentoCortaRetangulo,
  vagaNaFormacao,
  velocidadeDoMovimento,
  velocidadeParaSeguir,
  vetorDeEmpurrao,
} from './combate.js'

const perto = (valor, esperado) => expect(valor).toBeCloseTo(esperado, 6)

describe('velocidadeDoMovimento (WASD)', () => {
  it('reto: a velocidade inteira na direção', () => {
    expect(velocidadeDoMovimento(1, 0, 220)).toEqual({ x: 220, y: 0 })
    expect(velocidadeDoMovimento(0, -1, 220)).toEqual({ x: 0, y: -220 })
  })

  it('na diagonal a velocidade é a mesma, não √2 vezes maior', () => {
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const { x, y } = velocidadeDoMovimento(dx, dy, 220)
      perto(Math.hypot(x, y), 220)
      perto(Math.abs(x), Math.abs(y))
    }
  })

  it('parado: velocidade zero', () => {
    expect(velocidadeDoMovimento(0, 0, 220)).toEqual({ x: 0, y: 0 })
  })
})

describe('aplicarDano', () => {
  it('tira o dano da vida', () => {
    expect(aplicarDano(60, 25)).toEqual({ vida: 35, danoFeito: 25 })
  })

  it('a vida nunca fica negativa', () => {
    expect(aplicarDano(10, 25)).toEqual({ vida: 0, danoFeito: 10 })
  })

  it('protegido (imune, esquivando ou invencível) não leva dano', () => {
    expect(aplicarDano(60, 25, true)).toEqual({ vida: 60, danoFeito: 0 })
  })

  it('dano zero ou negativo não cura nem tira; quem já está sem vida não leva mais', () => {
    expect(aplicarDano(60, -5)).toEqual({ vida: 60, danoFeito: 0 })
    expect(aplicarDano(0, 25)).toEqual({ vida: 0, danoFeito: 0 })
  })
})

describe('recarga', () => {
  it('nunca usado: pronto', () => {
    expect(podeUsar(0, null, 800)).toBe(true)
    expect(fracaoDaRecarga(0, null, 800)).toBe(1)
  })

  it('só pode usar de novo depois da recarga inteira', () => {
    expect(podeUsar(1799, 1000, 800)).toBe(false)
    expect(podeUsar(1800, 1000, 800)).toBe(true)
  })

  it('a fração vai de 0 a 1 e não passa disso', () => {
    expect(fracaoDaRecarga(1000, 1000, 800)).toBe(0)
    expect(fracaoDaRecarga(1400, 1000, 800)).toBe(0.5)
    expect(fracaoDaRecarga(9000, 1000, 800)).toBe(1)
  })
})

describe('devePerseguir (Conceito §11.3)', () => {
  const raios = { raioDeDeteccao: 350, raioDeDesistencia: 550 }

  it('parado: começa a perseguir só dentro do raio de detecção', () => {
    expect(devePerseguir({ ...raios, distancia: 340, perseguindo: false })).toBe(true)
    expect(devePerseguir({ ...raios, distancia: 400, perseguindo: false })).toBe(false)
  })

  it('perseguindo: continua até o raio de desistência e desiste depois dele', () => {
    expect(devePerseguir({ ...raios, distancia: 500, perseguindo: true })).toBe(true)
    expect(devePerseguir({ ...raios, distancia: 560, perseguindo: true })).toBe(false)
  })
})

describe('vetorDeEmpurrao', () => {
  it('empurra para longe da origem, com a força dada', () => {
    const { x, y } = vetorDeEmpurrao({ x: 0, y: 0 }, { x: 30, y: 40 }, 100)
    perto(x, 60)
    perto(y, 80)
  })

  it('no mesmo ponto, empurra para a direita em vez de dar NaN', () => {
    expect(vetorDeEmpurrao({ x: 5, y: 5 }, { x: 5, y: 5 }, 100)).toEqual({ x: 100, y: 0 })
  })
})

describe('noArco (espada e escudo)', () => {
  const centro = { x: 0, y: 0 }

  it('acerta quem está na frente e dentro do alcance', () => {
    expect(noArco(centro, 0, 70, 120, { x: 50, y: 10 })).toBe(true)
  })

  it('não acerta quem está longe demais ou fora do arco', () => {
    expect(noArco(centro, 0, 70, 120, { x: 80, y: 0 })).toBe(false)
    expect(noArco(centro, 0, 70, 120, { x: -50, y: 0 })).toBe(false)
    expect(noArco(centro, 0, 70, 120, { x: 10, y: 50 })).toBe(false) // 79° para o lado
  })

  it('a abertura vale para os dois lados, inclusive passando de 180°', () => {
    expect(noArco(centro, Math.PI, 70, 120, { x: -50, y: 20 })).toBe(true)
    expect(noArco(centro, Math.PI, 70, 120, { x: -50, y: -20 })).toBe(true)
  })
})

describe('raioDaBolaMagica', () => {
  it('cresce do raio inicial ao final conforme voa, e para de crescer no alcance', () => {
    expect(raioDaBolaMagica(0, 500, 10, 26)).toBe(10)
    expect(raioDaBolaMagica(250, 500, 10, 26)).toBe(18)
    expect(raioDaBolaMagica(900, 500, 10, 26)).toBe(26)
  })
})

describe('acertos de projéteis', () => {
  const pedra = { x: 100, y: 100, largura: 40, altura: 20 }

  it('círculo contra retângulo', () => {
    expect(circuloTocaRetangulo({ x: 125, y: 100, raio: 6 }, pedra)).toBe(true)
    expect(circuloTocaRetangulo({ x: 130, y: 100, raio: 6 }, pedra)).toBe(false)
    expect(circuloTocaRetangulo({ x: 100, y: 100, raio: 1 }, pedra)).toBe(true)
  })

  it('círculo contra o escudo girado: girado 90°, ele fica em pé e só pega o que está na linha dele', () => {
    const escudo = { x: 0, y: 0, largura: 70, altura: 16 }
    expect(circuloTocaRetanguloGirado({ x: 0, y: 30, raio: 7 }, escudo, Math.PI / 2)).toBe(true)
    expect(circuloTocaRetanguloGirado({ x: 30, y: 0, raio: 7 }, escudo, Math.PI / 2)).toBe(false)
    expect(circuloTocaRetanguloGirado({ x: 30, y: 0, raio: 7 }, escudo, 0)).toBe(true)
  })

  it('corpo contra corpo', () => {
    const lider = { x: 0, y: 0, largura: 40, altura: 40 }
    expect(retangulosSeTocam(lider, { x: 38, y: 0, largura: 36, altura: 36 })).toBe(true)
    expect(retangulosSeTocam(lider, { x: 39, y: 0, largura: 36, altura: 36 })).toBe(false)
  })
})

describe('curaDaAura', () => {
  const centro = { x: 0, y: 0 }
  const membros = [
    { id: 'lider', x: 0, y: 0, vida: 50, vidaMaxima: 80 },
    { id: 'perto', x: 100, y: 100, vida: 10, vidaMaxima: 120 },
    { id: 'longe', x: 200, y: 0, vida: 10, vidaMaxima: 120 },
    { id: 'cheio', x: 10, y: 0, vida: 60, vidaMaxima: 60 },
    { id: 'quaseCheio', x: 20, y: 0, vida: 57, vidaMaxima: 60 },
    { id: 'semVida', x: 5, y: 0, vida: 0, vidaMaxima: 60 },
  ]

  it('cura só quem está dentro da área, de pé e sem a vida cheia', () => {
    const curados = curaDaAura(membros, centro, 150, 8)
    expect(curados.map((c) => c.id)).toEqual(['lider', 'perto', 'quaseCheio'])
  })

  it('não passa da vida máxima', () => {
    const curados = curaDaAura(membros, centro, 150, 8)
    expect(curados.find((c) => c.id === 'lider')).toEqual({ id: 'lider', vida: 58, curado: 8 })
    expect(curados.find((c) => c.id === 'quaseCheio')).toEqual({ id: 'quaseCheio', vida: 60, curado: 3 })
  })
})

describe('segmentoCortaRetangulo (linha de visão, usada no caminho)', () => {
  const pedra = { x: 100, y: 0, largura: 40, altura: 40 } // de 80 a 120 em x, de -20 a 20 em y

  it('atravessa, passa por cima ou para antes', () => {
    expect(segmentoCortaRetangulo({ x: 0, y: 0 }, { x: 200, y: 0 }, pedra)).toBe(true)
    expect(segmentoCortaRetangulo({ x: 0, y: -30 }, { x: 200, y: -30 }, pedra)).toBe(false)
    expect(segmentoCortaRetangulo({ x: 0, y: 0 }, { x: 70, y: 0 }, pedra)).toBe(false)
    expect(segmentoCortaRetangulo({ x: 100, y: -100 }, { x: 100, y: 100 }, pedra)).toBe(true)
  })
})

describe('grupo seguindo o Líder', () => {
  it('cada aliado tem uma vaga diferente, todas à mesma distância do Líder', () => {
    const vagas = [0, 1, 2, 3].map((i) => vagaNaFormacao(i, 4, 80))
    for (const vaga of vagas) perto(Math.hypot(vaga.x, vaga.y), 80)
    for (let i = 0; i < vagas.length; i++) {
      for (let j = i + 1; j < vagas.length; j++) {
        expect(Math.hypot(vagas[i].x - vagas[j].x, vagas[i].y - vagas[j].y)).toBeGreaterThan(40)
      }
    }
  })

  it('o aliado vai até a vaga na velocidade máxima e freia ao chegar', () => {
    const longe = velocidadeParaSeguir({ x: 0, y: 0 }, { x: 300, y: 0 }, 240, 60)
    expect(longe).toEqual({ x: 240, y: 0 })
    const chegando = velocidadeParaSeguir({ x: 0, y: 0 }, { x: 30, y: 0 }, 240, 60)
    expect(chegando).toEqual({ x: 120, y: 0 })
    expect(velocidadeParaSeguir({ x: 0, y: 0 }, { x: 1, y: 0 }, 240, 60)).toEqual({ x: 0, y: 0 })
  })
})

describe('crítico pela Agilidade (Conceito §6; aprovado em 07/10)', () => {
  const critico = { chanceBase: 0.05, chancePorPontoDeAgilidade: 0.005 }

  it('5% + 0,5% por ponto de Agilidade', () => {
    perto(chanceDeCritico(0, critico), 0.05)
    perto(chanceDeCritico(22, critico), 0.16) // Arqueiro inicial
    perto(chanceDeCritico(100, critico), 0.55)
  })

  it('nunca passa de 100% nem fica abaixo da base', () => {
    expect(chanceDeCritico(10000, critico)).toBe(1)
    perto(chanceDeCritico(-50, critico), 0.05)
  })

  it('o sorteio abaixo da chance é crítico: dano vezes o multiplicador', () => {
    expect(rolarCritico(20, 0.16, 1.5, () => 0.1)).toEqual({ dano: 30, critico: true })
    expect(rolarCritico(20, 0.16, 1.5, () => 0.16)).toEqual({ dano: 20, critico: false })
    expect(rolarCritico(20, 0, 1.5, () => 0)).toEqual({ dano: 20, critico: false }) // chance 0: nunca
  })
})
