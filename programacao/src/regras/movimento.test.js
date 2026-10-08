import { describe, expect, it } from 'vitest'
import {
  acompanharTravamento,
  caminhoNaGrade,
  criarGrade,
  desfazerSobreposicoes,
  escorregar,
  linhaLivre,
  lugarLivre,
  manobraParaDestravar,
  pontoDeDesvio,
  pontoLivreMaisProximo,
  separacao,
  tirarDasParedes,
} from './movimento.js'

const tamanho = (v) => Math.hypot(v.x, v.y)
const config = { folga: 10, forca: 300 }
const area = { x: 500, y: 300, largura: 1000, altura: 600 } // de (0, 0) a (1000, 600)

describe('separação', () => {
  it('longe um do outro, ninguém é empurrado', () => {
    const [a, b] = separacao([{ x: 0, y: 0, raio: 20 }, { x: 60, y: 0, raio: 20 }], config)
    expect(a).toEqual({ x: 0, y: 0 })
    expect(b).toEqual({ x: 0, y: 0 })
  })

  it('perto demais, os dois se afastam um do outro, igual', () => {
    const [a, b] = separacao([{ x: 0, y: 0, raio: 20 }, { x: 30, y: 0, raio: 20 }], config)
    expect(a.x).toBeLessThan(0)
    expect(b.x).toBeGreaterThan(0)
    expect(a.x).toBeCloseTo(-b.x)
    expect(a.y).toBeCloseTo(0)
  })

  it('aos poucos: quanto mais um entra na zona do outro, mais forte o empurrão', () => {
    const empurrao = (ate) => tamanho(separacao([{ x: 0, y: 0, raio: 20 }, { x: ate, y: 0, raio: 20 }], config)[0])
    expect(empurrao(45)).toBeGreaterThan(0)
    expect(empurrao(45)).toBeLessThan(empurrao(30))
    expect(empurrao(30)).toBeLessThan(empurrao(10))
  })

  it('nunca passa da força, nem com muitos em cima', () => {
    const corpos = Array.from({ length: 8 }, (_, i) => ({ x: i, y: 0, raio: 20 }))
    for (const velocidade of separacao(corpos, config)) expect(tamanho(velocidade)).toBeLessThanOrEqual(config.forca + 1e-9)
  })

  it('o mais pesado (o Líder) se mexe menos', () => {
    const [lider, aliado] = separacao([{ x: 0, y: 0, raio: 20, peso: 4 }, { x: 30, y: 0, raio: 20, peso: 1 }], config)
    expect(tamanho(aliado)).toBeCloseTo(tamanho(lider) * 4)
  })

  it('quem é fixo (caído) não se mexe, e o outro sai sozinho', () => {
    const [caido, outro] = separacao([{ x: 0, y: 0, raio: 20, fixo: true }, { x: 30, y: 0, raio: 20 }], config)
    expect(caido).toEqual({ x: 0, y: 0 })
    expect(outro.x).toBeGreaterThan(0)
  })

  it('todos no mesmo ponto: cada um sai numa direção diferente (Juntar todos)', () => {
    const corpos = Array.from({ length: 6 }, () => ({ x: 100, y: 100, raio: 20 }))
    const velocidades = separacao(corpos, config)
    for (const velocidade of velocidades) expect(tamanho(velocidade)).toBeGreaterThan(10)
    const direcoes = velocidades.map((v) => Math.round(Math.atan2(v.y, v.x) * 100))
    expect(new Set(direcoes).size).toBe(corpos.length)
  })
})

describe('escorregar em pedras e na borda', () => {
  const pedra = { x: 100, y: 100, largura: 40, altura: 100 } // de x 80 a 120, de y 50 a 150

  it('sem parede na frente, a velocidade não muda', () => {
    expect(escorregar({ x: 100, y: 50 }, { x: 300, y: 300, raio: 20 }, [pedra], area)).toEqual({ x: 100, y: 50 })
  })

  it('empurrado de frente contra a pedra, escorrega para a ponta mais perto', () => {
    // Encostado à esquerda da pedra, um pouco acima do meio dela: sobe
    const resultado = escorregar({ x: 200, y: 0 }, { x: 60, y: 80, raio: 20 }, [pedra], area)
    expect(resultado.x).toBe(0)
    expect(resultado.y).toBeLessThan(-100)
  })

  it('empurrado na diagonal, só a parte que entra na pedra some', () => {
    const resultado = escorregar({ x: 150, y: 120 }, { x: 60, y: 100, raio: 20 }, [pedra], area)
    expect(resultado).toEqual({ x: 0, y: 120 })
  })

  it('contra a borda, segue para o lado em que já ia', () => {
    const resultado = escorregar({ x: -200, y: 30 }, { x: 20, y: 300, raio: 20 }, [], area)
    expect(resultado.x).toBe(0)
    expect(resultado.y).toBeGreaterThan(100)
  })

  it('rápido: enxerga a parede pelo tanto que vai andar no quadro (não entra nela)', () => {
    // A 10 px da pedra, a 600 px/s num quadro de 1/30 s (20 px): sem olhar o quadro, entraria 10 px
    const corpo = { x: 50, y: 100, raio: 20 }
    expect(escorregar({ x: 600, y: 0 }, corpo, [pedra], area).x).toBe(600)
    expect(escorregar({ x: 600, y: 0 }, corpo, [pedra], area, 4, 1 / 30).x).toBe(0)
    // Devagar, a mesma distância está livre
    expect(escorregar({ x: 60, y: 0 }, corpo, [pedra], area, 4, 1 / 30).x).toBe(60)
  })

  it('quem ficou um pouco dentro da pedra consegue sair dela', () => {
    // Corpo de x 41 a 81: entrou 1 px na pedra (que começa em 80)
    expect(escorregar({ x: -100, y: 0 }, { x: 61, y: 100, raio: 20 }, [pedra], area)).toEqual({ x: -100, y: 0 })
    expect(escorregar({ x: 0, y: 100 }, { x: 61, y: 100, raio: 20 }, [pedra], area)).toEqual({ x: 0, y: 100 })
  })

  it('num canto fechado, para', () => {
    expect(escorregar({ x: -100, y: -100 }, { x: 20, y: 20, raio: 20 }, [], area)).toEqual({ x: 0, y: 0 })
  })
})

describe('tirar de dentro das pedras', () => {
  const pedra = { x: 100, y: 100, largura: 40, altura: 100 } // de x 80 a 120, de y 50 a 150

  it('fora das pedras, ninguém se mexe', () => {
    expect(tirarDasParedes([{ x: 300, y: 300, raio: 20 }], [pedra], area)).toEqual([{ x: 300, y: 300 }])
  })

  it('5 px dentro da quina: sai pelo lado em que entrou menos, e só encosta', () => {
    // Corpo de x 45 a 85 (5 px dentro em x) e de y 35 a 75 (25 px dentro em y)
    const [saiu] = tirarDasParedes([{ x: 65, y: 55, raio: 20 }], [pedra], area)
    expect(saiu).toEqual({ x: 60, y: 55 })
  })

  it('se o lado mais curto dá em outra pedra, sai por outro', () => {
    const vizinha = { x: 40, y: 100, largura: 40, altura: 100 } // de x 20 a 60, colada à esquerda
    const [saiu] = tirarDasParedes([{ x: 75, y: 70, raio: 20 }], [pedra, vizinha], area)
    expect(lugarLivre(saiu, { area, paredes: [pedra, vizinha], raio: 20 })).toBe(true)
  })
})

describe('desfazer sobreposições (aperto)', () => {
  const pedra = { x: 100, y: 100, largura: 40, altura: 100 } // de x 80 a 120
  const sobrepoem = (a, b, raio = 20) => Math.abs(a.x - b.x) < 2 * raio - 0.01 && Math.abs(a.y - b.y) < 2 * raio - 0.01

  it('sem sobreposição, ninguém se mexe', () => {
    const corpos = [{ x: 200, y: 200, raio: 20 }, { x: 250, y: 200, raio: 20 }]
    expect(desfazerSobreposicoes(corpos, [], area)).toEqual([{ x: 200, y: 200 }, { x: 250, y: 200 }])
  })

  it('dois um dentro do outro: cada um sai metade, até só encostar', () => {
    const [a, b] = desfazerSobreposicoes([{ x: 200, y: 200, raio: 20 }, { x: 230, y: 205, raio: 20 }], [], area)
    expect(a).toEqual({ x: 195, y: 200 })
    expect(b).toEqual({ x: 235, y: 205 })
  })

  it('um encostado na pedra: ele fica, e o outro sai todo (ninguém entra na pedra)', () => {
    // A encostado na pedra (x 40 a 80); B entrou 12 px nele pela esquerda
    const [a, b] = desfazerSobreposicoes([{ x: 60, y: 100, raio: 20 }, { x: 32, y: 100, raio: 20 }], [pedra], area)
    expect(a).toEqual({ x: 60, y: 100 })
    expect(b.x).toBeCloseTo(20)
  })

  it('caído (fixo) não se mexe; no bolo do "Juntar todos" (ignorar), nada muda', () => {
    const [caido, outro] = desfazerSobreposicoes([{ x: 200, y: 200, raio: 20, fixo: true }, { x: 230, y: 200, raio: 20 }], [], area)
    expect(caido).toEqual({ x: 200, y: 200 })
    expect(outro).toEqual({ x: 240, y: 200 })
    const juntos = [{ x: 200, y: 200, raio: 20, ignorar: true }, { x: 200, y: 200, raio: 20 }]
    expect(desfazerSobreposicoes(juntos, [], area)).toEqual([{ x: 200, y: 200 }, { x: 200, y: 200 }])
  })

  it('os dois encostados em pedras no eixo em que entraram: saem pelo outro eixo, sem entrar em pedra', () => {
    // Entre duas pedras (x 80 a 120 e x 160 a 200), dois corpos lado a lado em cima um do outro em y
    const pedras = [
      { x: 100, y: 300, largura: 40, altura: 400 },
      { x: 180, y: 300, largura: 40, altura: 400 },
    ]
    // Corredor de x 120 a 160 (só 40 px): A e B entraram 10 px um no outro em x e 30 px em y
    const [a, b] = desfazerSobreposicoes([{ x: 140, y: 300, raio: 20 }, { x: 140, y: 310, raio: 20 }], pedras, area)
    const dentro = (p) => pedras.some((pedra) => Math.abs(p.x - pedra.x) < 20 + pedra.largura / 2 - 0.01 && Math.abs(p.y - pedra.y) < 20 + pedra.altura / 2 - 0.01)
    expect(dentro(a)).toBe(false)
    expect(dentro(b)).toBe(false)
    expect(Math.abs(a.y - b.y)).toBeGreaterThanOrEqual(40 - 0.01)
  })

  it('travados nos dois eixos: ninguém é empurrado para dentro de uma pedra', () => {
    const caixa = { x: 500, y: 300, largura: 1000, altura: 600 }
    // Num buraco do tamanho de um corpo e meio, cercado de pedras: não há para onde ir
    const pedras = [
      { x: 140, y: 230, largura: 200, altura: 40 },
      { x: 140, y: 370, largura: 200, altura: 40 },
      { x: 30, y: 300, largura: 20, altura: 200 },
      { x: 250, y: 300, largura: 20, altura: 200 },
    ]
    const [a, b] = desfazerSobreposicoes([{ x: 120, y: 300, raio: 20 }, { x: 150, y: 300, raio: 20 }], pedras, caixa)
    const dentro = (p) => pedras.some((pedra) => Math.abs(p.x - pedra.x) < 20 + pedra.largura / 2 - 0.01 && Math.abs(p.y - pedra.y) < 20 + pedra.altura / 2 - 0.01)
    expect(dentro(a)).toBe(false)
    expect(dentro(b)).toBe(false)
  })

  it('três espremidos numa fila contra a pedra: no fim ninguém está dentro de ninguém nem da pedra', () => {
    const outraPedra = { x: 300, y: 100, largura: 40, altura: 100 } // de x 280 a 320
    // A encostado na pedra; B entrou 12 px em A; C entrou 13 px em B
    const fila = [
      { x: 260, y: 100, raio: 20 },
      { x: 232, y: 100, raio: 20 },
      { x: 205, y: 100, raio: 20 },
    ]
    const [a, b, c] = desfazerSobreposicoes(fila, [outraPedra], area, 6)
    expect(a).toEqual({ x: 260, y: 100 })
    expect(sobrepoem(a, b)).toBe(false)
    expect(sobrepoem(b, c)).toBe(false)
    expect(sobrepoem(a, c)).toBe(false)
  })
})

describe('caminho na grade', () => {
  const opcoes = { celula: 20, folga: 22 }
  const segmentosLivres = (inicio, caminho, paredes) =>
    [inicio, ...caminho].every((ponto, i, lista) => i === 0 || linhaLivre(lista[i - 1], ponto, paredes, 18))

  it('sem nada no meio, vai direto', () => {
    const grade = criarGrade(area, [], opcoes)
    expect(caminhoNaGrade(grade, { x: 100, y: 100 }, { x: 800, y: 400 })).toEqual([{ x: 800, y: 400 }])
  })

  it('com uma pedra no meio, dá a volta sem atravessar a pedra', () => {
    const paredes = [{ x: 500, y: 300, largura: 100, altura: 300 }]
    const grade = criarGrade(area, paredes, opcoes)
    const inicio = { x: 300, y: 300 }
    const caminho = caminhoNaGrade(grade, inicio, { x: 700, y: 300 })
    expect(caminho.length).toBeGreaterThan(1)
    expect(caminho.at(-1)).toEqual({ x: 700, y: 300 })
    expect(segmentosLivres(inicio, caminho, paredes)).toBe(true)
  })

  it('duas pedras coladas em L: sai do canto e chega do outro lado', () => {
    // O canto de dentro do L fica em (500, 400); quem está em (440, 340) está preso nele
    const paredes = [
      { x: 425, y: 425, largura: 150, altura: 50 },
      { x: 525, y: 375, largura: 50, altura: 150 },
    ]
    const grade = criarGrade(area, paredes, opcoes)
    const inicio = { x: 440, y: 340 }
    const fim = { x: 620, y: 500 }
    expect(linhaLivre(inicio, fim, paredes, 20)).toBe(false)
    const caminho = caminhoNaGrade(grade, inicio, fim)
    expect(caminho.at(-1)).toEqual(fim)
    expect(segmentosLivres(inicio, caminho, paredes)).toBe(true)
  })

  it('alvo dentro de uma pedra: termina no lugar livre mais perto dela', () => {
    const paredes = [{ x: 500, y: 300, largura: 100, altura: 100 }]
    const grade = criarGrade(area, paredes, opcoes)
    const caminho = caminhoNaGrade(grade, { x: 200, y: 300 }, { x: 500, y: 300 })
    const ultimo = caminho.at(-1)
    expect(lugarLivre(ultimo, { area, paredes, raio: 20 })).toBe(true)
    expect(Math.hypot(ultimo.x - 500, ultimo.y - 300)).toBeLessThan(110)
  })

  it('sem saída (cercado por pedras), devolve caminho vazio', () => {
    const paredes = [
      { x: 500, y: 200, largura: 300, altura: 40 },
      { x: 500, y: 400, largura: 300, altura: 40 },
      { x: 370, y: 300, largura: 40, altura: 240 },
      { x: 630, y: 300, largura: 40, altura: 240 },
    ]
    const grade = criarGrade(area, paredes, opcoes)
    expect(caminhoNaGrade(grade, { x: 500, y: 300 }, { x: 900, y: 500 })).toEqual([])
  })
})

describe('travamento', () => {
  const opcoes = { msDaJanela: 600, fracaoMinima: 0.25 }
  const passo = (registro, agora, posicao, velocidadeQuerida) =>
    acompanharTravamento(registro, { agora, segundos: 0.1, posicao, velocidadeQuerida }, opcoes)

  function simular(posicoes, velocidadeQuerida) {
    let registro = null
    posicoes.forEach((posicao, i) => {
      registro = passo(registro, i * 100, posicao, velocidadeQuerida)
    })
    return registro
  }

  it('parado de propósito não conta como travado', () => {
    const registro = simular(Array.from({ length: 20 }, () => ({ x: 0, y: 0 })), { x: 0, y: 0 })
    expect(registro.nivel).toBe(0)
  })

  it('tentando andar e andando: nível 0', () => {
    const registro = simular(Array.from({ length: 14 }, (_, i) => ({ x: i * 20, y: 0 })), { x: 200, y: 0 })
    expect(registro.nivel).toBe(0)
  })

  it('tentando andar e sem sair do lugar: o nível sobe a cada janela', () => {
    const preso = (n) => simular(Array.from({ length: n }, () => ({ x: 50, y: 50 })), { x: 200, y: 0 })
    expect(preso(8).nivel).toBe(1)
    expect(preso(15).nivel).toBe(2)
  })

  it('voltar a andar zera o nível', () => {
    let registro = simular(Array.from({ length: 8 }, () => ({ x: 0, y: 0 })), { x: 200, y: 0 })
    expect(registro.nivel).toBe(1)
    for (let i = 8; i < 16; i++) registro = passo(registro, i * 100, { x: (i - 7) * 20, y: 0 }, { x: 200, y: 0 })
    expect(registro.nivel).toBe(0)
  })

  it('manobras: escorregar para um lado, depois para o outro, dar a volta e, por último, o ponto livre', () => {
    const frente = { x: 100, y: 0 }
    expect(manobraParaDestravar(0, frente, 4).tipo).toBe('nenhuma')
    const primeira = manobraParaDestravar(1, frente, 4)
    const segunda = manobraParaDestravar(2, frente, 4)
    expect(primeira.tipo).toBe('escorregar')
    expect(Math.abs(primeira.direcao.y)).toBeCloseTo(1)
    expect(segunda.direcao.y).toBeCloseTo(-primeira.direcao.y)
    const volta = manobraParaDestravar(3, frente, 4)
    expect(volta.tipo).toBe('darAVolta')
    expect(volta.direcao.x).toBeGreaterThan(0)
    expect(tamanho(volta.direcao)).toBeCloseTo(1)
    expect(manobraParaDestravar(4, frente, 4).tipo).toBe('pontoLivre')
  })
})

describe('ponto livre', () => {
  const pedra = { x: 500, y: 300, largura: 100, altura: 100 }
  const regras = { area, paredes: [pedra], raio: 20 }

  it('um lugar livre é ele mesmo', () => {
    expect(pontoLivreMaisProximo({ x: 200, y: 200 }, regras)).toEqual({ x: 200, y: 200 })
  })

  it('dentro de uma pedra: vai para fora, logo ao lado dela', () => {
    const ponto = pontoLivreMaisProximo({ x: 520, y: 300 }, regras)
    expect(lugarLivre(ponto, regras)).toBe(true)
    expect(Math.hypot(ponto.x - 520, ponto.y - 300)).toBeLessThanOrEqual(30 + 20 + 8)
  })

  it('em cima de outro corpo: sai de cima dele', () => {
    const ocupados = [{ x: 200, y: 200, raio: 20 }]
    const ponto = pontoLivreMaisProximo({ x: 200, y: 200 }, { ...regras, ocupados })
    expect(Math.max(Math.abs(ponto.x - 200), Math.abs(ponto.y - 200))).toBeGreaterThanOrEqual(40)
  })

  it('fora da borda: volta para dentro', () => {
    const ponto = pontoLivreMaisProximo({ x: -50, y: 300 }, regras)
    expect(lugarLivre(ponto, regras)).toBe(true)
    expect(ponto.x).toBeGreaterThanOrEqual(20)
  })

  it('a folga pede mais espaço em volta', () => {
    expect(lugarLivre({ x: 430, y: 300 }, regras)).toBe(true)
    expect(lugarLivre({ x: 430, y: 300 }, { ...regras, folga: 12 })).toBe(false)
  })
})

describe('pontoDeDesvio: a IA de nível alto contorna quem está parado no caminho (08/10)', () => {
  const regra = { raio: 20, alcance: 140, folga: 10 }

  it('caminho livre: nenhum desvio', () => {
    expect(pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, [{ x: 150, y: 80, raio: 20 }], regra)).toBeNull()
  })

  it('corpo parado bem na reta: um ponto ao lado dele, com folga das bordas', () => {
    const ponto = pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, [{ x: 100, y: 0, raio: 20 }], regra)
    expect(ponto.x).toBeCloseTo(100)
    expect(Math.abs(ponto.y)).toBeCloseTo(50) // 20 + 20 + 10
  })

  it('passa pelo lado em que a reta já está: corpo um pouco abaixo → passa por cima', () => {
    const ponto = pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, [{ x: 100, y: 15, raio: 20 }], regra)
    expect(ponto.y).toBeLessThan(0)
  })

  it('longe demais para ver: a avançada (140 px) desvia, a média (45 px) ainda não', () => {
    const corpos = [{ x: 120, y: 0, raio: 20 }]
    expect(pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, corpos, regra)).not.toBeNull()
    expect(pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, corpos, { raio: 20, alcance: 45, folga: 6 })).toBeNull()
    expect(pontoDeDesvio({ x: 75, y: 0 }, { x: 300, y: 0 }, corpos, { raio: 20, alcance: 45, folga: 6 })).not.toBeNull()
  })

  it('o corpo mais perto é o que conta; atrás de quem anda não conta', () => {
    const ponto = pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, [{ x: 130, y: 0, raio: 20 }, { x: 60, y: 0, raio: 20 }, { x: -50, y: 0, raio: 20 }], regra)
    expect(ponto.x).toBeCloseTo(60)
  })

  it('o lado escolhido para o mesmo corpo continua no quadro seguinte (não troca de lado vindo de frente)', () => {
    const corpo = { x: 100, y: 3, raio: 20, id: 'guerreiro' }
    const primeiro = pontoDeDesvio({ x: 0, y: 0 }, { x: 300, y: 0 }, [corpo], regra)
    expect(primeiro).toMatchObject({ lado: -1, id: 'guerreiro' }) // corpo um pouco abaixo: passa por cima
    // no quadro seguinte o corpo ficou um pouco acima da reta, mas o lado continua o mesmo
    const depois = pontoDeDesvio({ x: 10, y: 0 }, { x: 300, y: 0 }, [{ ...corpo, y: -3 }], { ...regra, ladoAnterior: primeiro })
    expect(depois.lado).toBe(-1)
    // outro corpo: o lado anterior não vale
    const outro = pontoDeDesvio({ x: 10, y: 0 }, { x: 300, y: 0 }, [{ ...corpo, y: -3, id: 'tanque' }], { ...regra, ladoAnterior: primeiro })
    expect(outro.lado).toBe(1)
  })

  it('corpo em cima do destino não conta (é para lá que se vai, como o ferido que o Sacerdote vai curar)', () => {
    expect(pontoDeDesvio({ x: 0, y: 0 }, { x: 100, y: 0 }, [{ x: 110, y: 0, raio: 20 }], regra)).toBeNull()
  })
})
