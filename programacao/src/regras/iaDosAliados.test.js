import { describe, expect, it } from 'vitest'
import {
  acompanharTremor,
  alvoComLinhaDeTiro,
  alvoDoInimigo,
  deveFicarParado,
  deveVoltar,
  direcaoDeRecuo,
  inimigoMaisForte,
  inimigosPerto,
  maisProximo,
  passagemParaOLider,
  pontoComLinhaDeTiro,
  pontoDeMaisInimigos,
  posicaoADistancia,
  posicaoDoTanque,
  posicaoParaCurar,
  posicoesDeCombate,
  quemCurar,
  temLinhaDeTiro,
  vagaEmVoltaDoAlvo,
} from './iaDosAliados.js'
import { lugarLivre } from './movimento.js'

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

describe('com quem lutar', () => {
  const lider = { x: 0, y: 0 }

  it('só inimigos vivos e perto do Líder', () => {
    const inimigos = [{ x: 100, y: 0 }, { x: 900, y: 0 }, { x: 50, y: 0, morto: true }]
    expect(inimigosPerto(inimigos, lider, 380)).toEqual([{ x: 100, y: 0 }])
  })

  it('Guerreiro: o mais próximo dele', () => {
    const guerreiro = { x: 200, y: 0 }
    expect(maisProximo(guerreiro, [{ x: 0, y: 0 }, { x: 250, y: 0 }, { x: 100, y: 0 }])).toEqual({ x: 250, y: 0 })
    expect(maisProximo(guerreiro, [])).toBeNull()
  })

  it('Mago: mira onde há mais mobs juntos, no meio deles', () => {
    const mago = { x: 0, y: 0 }
    const inimigos = [{ x: 100, y: 0 }, { x: 400, y: 0 }, { x: 440, y: 0 }, { x: 420, y: 30 }]
    const ponto = pontoDeMaisInimigos(mago, inimigos, 90)
    expect(ponto.quantos).toBe(3)
    expect(ponto.x).toBeCloseTo(420)
    expect(ponto.y).toBeCloseTo(10)
  })

  it('Mago: sem grupinho, fica com o mais perto; sem inimigos, null', () => {
    expect(pontoDeMaisInimigos({ x: 0, y: 0 }, [{ x: 500, y: 0 }, { x: 100, y: 0 }], 90)).toEqual({ x: 100, y: 0, quantos: 1 })
    expect(pontoDeMaisInimigos({ x: 0, y: 0 }, [], 90)).toBeNull()
  })
})

describe('onde ficar', () => {
  const faixa = { minima: 220, maxima: 320 }

  it('Arqueiro: perto demais do mob, recua para o meio da faixa, do mesmo lado', () => {
    const ponto = posicaoADistancia({ x: 100, y: 0 }, { x: 0, y: 0 }, faixa)
    expect(ponto).toEqual({ x: 270, y: 0 })
  })

  it('Arqueiro: longe demais, chega mais perto; dentro da faixa, fica parado', () => {
    expect(posicaoADistancia({ x: 0, y: 600 }, { x: 0, y: 0 }, faixa)).toEqual({ x: 0, y: 270 })
    expect(posicaoADistancia({ x: 250, y: 0 }, { x: 0, y: 0 }, faixa)).toEqual({ x: 250, y: 0 })
  })

  it('quem luta de perto se espalha em volta do mob: vagas diferentes, todas à mesma distância', () => {
    const alvo = { x: 0, y: 0 }
    const vagas = [0, 1, 2].map((i) => vagaEmVoltaDoAlvo(alvo, i, 3, 60, { x: -200, y: 0 }))
    for (const vaga of vagas) expect(distancia(vaga, alvo)).toBeCloseTo(60)
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect(distancia(vagas[i], vagas[j])).toBeGreaterThan(40)
    // Um só: fica do lado do Líder
    const sozinho = vagaEmVoltaDoAlvo(alvo, 0, 1, 60, { x: -200, y: 0 })
    expect(sozinho.x).toBeCloseTo(-60)
    expect(sozinho.y).toBeCloseTo(0)
  })

  it('Tanque: entre o mob e o Líder, colado no mob', () => {
    const ponto = posicaoDoTanque({ x: 300, y: 0 }, { x: 0, y: 0 }, 50)
    expect(ponto).toEqual({ x: 250, y: 0 })
  })
})

describe('voltar para o Líder', () => {
  const raios = { raioDaCorrente: 420, raioDeVolta: 160 }

  it('só começa a voltar longe, e só para de voltar perto', () => {
    expect(deveVoltar(false, 400, raios)).toBe(false)
    expect(deveVoltar(false, 430, raios)).toBe(true)
    expect(deveVoltar(true, 300, raios)).toBe(true)
    expect(deveVoltar(true, 150, raios)).toBe(false)
  })
})

describe('quem os inimigos atacam', () => {
  const raios = { raioDeDeteccao: 350, raioDeDesistencia: 550, raioDeAtracao: 260, raioDaProvocacao: 300 }
  const mob = { x: 0, y: 0 }
  const lider = { x: 200, y: 0, classe: 'mago' }
  const guerreiro = { x: 100, y: 0, classe: 'guerreiro' }
  const tanque = { x: 240, y: 0, classe: 'tanque' }

  it('sem Tanque: o mais perto dentro do raio de detecção', () => {
    expect(alvoDoInimigo(mob, [lider, guerreiro], { ...raios, alvoAtual: null })).toBe(guerreiro)
    expect(alvoDoInimigo(mob, [{ x: 400, y: 0 }], { ...raios, alvoAtual: null })).toBeNull()
  })

  it('o Tanque perto atrai o mob, mesmo com outro mais perto (TASK-043)', () => {
    expect(alvoDoInimigo(mob, [lider, guerreiro, tanque], { ...raios, alvoAtual: guerreiro })).toBe(tanque)
  })

  it('perseguindo alguém, continua até ele passar do raio de desistência', () => {
    const fugindo = { x: 500, y: 0, classe: 'arqueiro' }
    expect(alvoDoInimigo(mob, [fugindo], { ...raios, alvoAtual: fugindo })).toBe(fugindo)
    const longe = { x: 600, y: 0, classe: 'arqueiro' }
    expect(alvoDoInimigo(mob, [longe], { ...raios, alvoAtual: longe })).toBeNull()
  })

  it('quem caiu sai da lista: o mob troca de alvo', () => {
    expect(alvoDoInimigo(mob, [lider], { ...raios, alvoAtual: guerreiro })).toBe(lider)
  })

  it('a Provocação puxa os mobs no raio dela, mesmo de longe', () => {
    const provocando = { x: 290, y: 0, classe: 'tanque', provocando: true }
    expect(alvoDoInimigo(mob, [guerreiro, provocando], { ...raios, alvoAtual: guerreiro })).toBe(provocando)
    expect(alvoDoInimigo(mob, [guerreiro, provocando], { ...raios, raioDaProvocacao: 200, alvoAtual: guerreiro })).toBe(guerreiro)
  })
})

describe('parados em volta do Líder, sem tremor (5b.1)', () => {
  const zona = { minima: 50, maxima: 130, folga: 50 }

  it('com o Líder parado, para assim que entra na zona, mesmo longe da vaga', () => {
    expect(deveFicarParado({ parado: false, distanciaAoLider: 120, distanciaAVaga: 90, liderAndando: false }, zona)).toBe(true)
    expect(deveFicarParado({ parado: false, distanciaAoLider: 160, distanciaAVaga: 90, liderAndando: false }, zona)).toBe(false)
    expect(deveFicarParado({ parado: false, distanciaAoLider: 30, distanciaAVaga: 60, liderAndando: false }, zona)).toBe(false)
  })

  it('com o Líder andando, continua seguindo', () => {
    expect(deveFicarParado({ parado: false, distanciaAoLider: 90, distanciaAVaga: 10, liderAndando: true }, zona)).toBe(false)
  })

  it('parado, não se mexe enquanto o Líder estiver até a máxima + folga (não fica ligando e desligando)', () => {
    expect(deveFicarParado({ parado: true, distanciaAoLider: 170, distanciaAVaga: 200, liderAndando: true }, zona)).toBe(true)
    expect(deveFicarParado({ parado: true, distanciaAoLider: 181, distanciaAVaga: 200, liderAndando: true }, zona)).toBe(false)
  })

  it('IA média e avançada: só para perto da vaga (posição mais arrumada)', () => {
    const arrumada = { ...zona, tolerancia: 40 }
    expect(deveFicarParado({ parado: false, distanciaAoLider: 120, distanciaAVaga: 90, liderAndando: false }, arrumada)).toBe(false)
    expect(deveFicarParado({ parado: false, distanciaAoLider: 90, distanciaAVaga: 30, liderAndando: false }, arrumada)).toBe(true)
  })

  it('na zona, mas sem conseguir chegar mais perto da vaga (travado): para onde está', () => {
    const arrumada = { ...zona, tolerancia: 40 }
    expect(deveFicarParado({ parado: false, distanciaAoLider: 120, distanciaAVaga: 90, liderAndando: false, travado: true }, arrumada)).toBe(true)
    expect(deveFicarParado({ parado: false, distanciaAoLider: 160, distanciaAVaga: 90, liderAndando: false, travado: true }, arrumada)).toBe(false)
  })
})

describe('detector de tremor', () => {
  const opcoes = { msDaJanela: 600, razao: 3, deslocamentoMaximo: 12, caminhoMinimo: 15 }
  function simular(posicoes) {
    let estado = { registro: null, tremendo: false }
    const tremores = []
    posicoes.forEach((posicao, i) => {
      estado = acompanharTremor(estado.registro, { agora: i * 100, posicao }, opcoes)
      tremores.push(estado.tremendo)
    })
    return tremores.some(Boolean)
  }

  it('vai e volta sem sair do lugar: tremendo', () => {
    expect(simular(Array.from({ length: 10 }, (_, i) => ({ x: 100 + (i % 2) * 8, y: 100 })))).toBe(true)
  })

  it('andando de verdade, ou parado de verdade: não', () => {
    expect(simular(Array.from({ length: 10 }, (_, i) => ({ x: 100 + i * 20, y: 100 })))).toBe(false)
    expect(simular(Array.from({ length: 10 }, () => ({ x: 100, y: 100 })))).toBe(false)
  })
})

describe('dar passagem ao Líder', () => {
  it('o Líder anda na direção do aliado parado e encosta: o aliado vai para o lado', () => {
    const direcao = passagemParaOLider({ x: 140, y: 105 }, { x: 100, y: 100 }, { x: 220, y: 0 }, 50)
    expect(direcao).not.toBeNull()
    expect(direcao.x).toBeCloseTo(0)
    expect(direcao.y).toBeCloseTo(1) // estava um pouco abaixo: vai para baixo
  })

  it('Líder parado, longe, ou indo para o outro lado: nada', () => {
    expect(passagemParaOLider({ x: 140, y: 100 }, { x: 100, y: 100 }, { x: 0, y: 0 }, 50)).toBeNull()
    expect(passagemParaOLider({ x: 300, y: 100 }, { x: 100, y: 100 }, { x: 220, y: 0 }, 50)).toBeNull()
    expect(passagemParaOLider({ x: 140, y: 100 }, { x: 100, y: 100 }, { x: -220, y: 0 }, 50)).toBeNull()
  })
})

describe('linha de tiro (5b.1)', () => {
  const pedra = { x: 500, y: 300, largura: 60, altura: 200 } // de x 470 a 530, de y 200 a 400
  const area = { x: 500, y: 300, largura: 1000, altura: 600 }

  it('com pedra no meio, não há linha de tiro; ao lado dela, há', () => {
    expect(temLinhaDeTiro({ x: 300, y: 300 }, { x: 700, y: 300 }, [pedra], 6)).toBe(false)
    expect(temLinhaDeTiro({ x: 300, y: 100 }, { x: 700, y: 100 }, [pedra], 6)).toBe(true)
  })

  it('troca para um alvo que dá para acertar', () => {
    const atras = { x: 700, y: 300 }
    const livre = { x: 700, y: 600 } // a linha passa por baixo da pedra
    expect(alvoComLinhaDeTiro({ x: 300, y: 300 }, [atras, livre], [pedra], 6)).toBe(livre)
    expect(alvoComLinhaDeTiro({ x: 300, y: 300 }, [atras], [pedra], 6)).toBeNull()
  })

  it('acha um lugar na distância certa, fora da pedra, de onde dá para acertar', () => {
    const atirador = { x: 300, y: 300 }
    const alvo = { x: 700, y: 300 }
    const ponto = pontoComLinhaDeTiro(atirador, alvo, { pedras: [pedra], area, distanciaDoAlvo: 270, folga: 6, raioDoCorpo: 20, pontos: 16 })
    expect(ponto).not.toBeNull()
    expect(Math.hypot(ponto.x - alvo.x, ponto.y - alvo.y)).toBeCloseTo(270)
    expect(temLinhaDeTiro(ponto, alvo, [pedra], 6)).toBe(true)
    expect(lugarLivre(ponto, { area, paredes: [pedra], raio: 20 })).toBe(true)
  })
})

describe('IA avançada', () => {
  it('o mais forte: mais vida máxima; no empate, quem bate mais', () => {
    const fraco = { x: 10, y: 0, vidaMaxima: 40, dano: 8 }
    const forte = { x: 300, y: 0, vidaMaxima: 60, dano: 12 }
    const igualMasBateMais = { x: 400, y: 0, vidaMaxima: 60, dano: 20 }
    expect(inimigoMaisForte({ x: 0, y: 0 }, [fraco, forte])).toBe(forte)
    expect(inimigoMaisForte({ x: 0, y: 0 }, [fraco, forte, igualMasBateMais])).toBe(igualMasBateMais)
    expect(inimigoMaisForte({ x: 0, y: 0 }, [])).toBeNull()
  })

  it('formação de combate: Tanque na frente, Guerreiro ao lado, Arqueiro e Mago atrás lado a lado, Sacerdote no fundo', () => {
    const lider = { x: 0, y: 0 }
    const inimigos = [{ x: 400, y: -20 }, { x: 420, y: 20 }]
    const opcoes = {
      tanqueAteOMob: 60,
      guerreiroAoLado: 55,
      distanciaEntreArqueiroEMago: 120,
      sacerdoteAtras: 70,
      distanciaDoArqueiro: { minima: 220, maxima: 320 },
      distanciaDoMago: { minima: 260, maxima: 420 },
    }
    const p = posicoesDeCombate(lider, inimigos, opcoes)
    const avanco = (ponto) => ponto.x // a frente aqui é para a direita
    expect(avanco(p.tanque)).toBeGreaterThan(avanco(p.guerreiro))
    expect(avanco(p.guerreiro)).toBeGreaterThan(avanco(p.arqueiro))
    expect(avanco(p.arqueiro)).toBeGreaterThan(avanco(p.sacerdote))
    expect(avanco(p.mago)).toBeGreaterThan(avanco(p.sacerdote))
    expect(Math.abs(p.arqueiro.y - p.mago.y)).toBeCloseTo(120) // lado a lado
    expect(p.sacerdote.y).toBeCloseTo((p.arqueiro.y + p.mago.y) / 2) // entre os dois
    expect(posicoesDeCombate(lider, [], opcoes)).toBeNull()
  })

  it('recuar do golpe avisado: direção para longe do mob', () => {
    const direcao = direcaoDeRecuo({ x: 100, y: 0 }, { x: 0, y: 0 })
    expect(direcao).toEqual({ x: 1, y: 0 })
  })
})

describe('Sacerdote: quem curar (regra de 08/10: sempre que alguém não está com a vida cheia)', () => {
  const membro = (vida, extra = {}) => ({ vida, vidaMaxima: 100, x: 0, y: 0, ...extra })

  it('qualquer um abaixo de 100% precisa: até 99% conta', () => {
    const quase = membro(99)
    expect(quemCurar([membro(100), quase])).toBe(quase)
  })

  it('o mais ferido primeiro, mesmo que não seja o Líder', () => {
    const pior = membro(20)
    expect(quemCurar([membro(60, { lider: true }), membro(50), pior])).toBe(pior)
  })

  it('em empate (diferença de até 5 pontos), o Líder primeiro', () => {
    const lider = membro(43, { lider: true })
    expect(quemCurar([membro(40), lider], { empate: 0.05 })).toBe(lider)
    expect(quemCurar([membro(30), lider], { empate: 0.05 }).lider).toBeUndefined()
  })

  it('ele mesmo também conta (o Sacerdote ferido se cura)', () => {
    const sacerdote = membro(30, { classe: 'sacerdote' })
    expect(quemCurar([membro(90), sacerdote])).toBe(sacerdote)
  })

  it('a fração de vida conta, não o número: 50 de 200 é mais ferido que 40 de 60', () => {
    const tanque = membro(50, { vidaMaxima: 200 })
    expect(quemCurar([membro(40, { vidaMaxima: 60 }), tanque])).toBe(tanque)
  })

  it('todos com a vida cheia, ou só caídos e perdidos: ninguém', () => {
    expect(quemCurar([membro(100), membro(0, { caido: true }), membro(10, { perdido: true })])).toBeNull()
  })

  it('básica errando: pega o ferido mais perto dela, mesmo que não seja o mais ferido', () => {
    const perto = membro(80, { x: 30 })
    const longe = membro(10, { x: 400 })
    const de = { x: 0, y: 0 }
    expect(quemCurar([longe, perto], { de, estilo: 'basica', errou: true })).toBe(perto)
    expect(quemCurar([longe, perto], { de, estilo: 'basica', errou: false })).toBe(longe)
  })

  it('avançada: quem está sendo atacado conta como mais ferido', () => {
    const atacado = membro(50)
    const parado = membro(42)
    const atacantes = (m) => (m === atacado ? 2 : 0) // 2 mobs nele: 50% - 20% = 30% de urgência
    expect(quemCurar([parado, atacado], { estilo: 'avancada', atacantes })).toBe(atacado)
    expect(quemCurar([parado, atacado], { estilo: 'media', atacantes })).toBe(parado) // a média não olha isso
  })
})

describe('Sacerdote avançado: onde ficar para curar', () => {
  it('atrás do ferido, do lado longe do mob, a distância pedida', () => {
    const ponto = posicaoParaCurar({ x: 0, y: 0 }, { x: 200, y: 0 }, [{ x: 300, y: 0 }], 80)
    expect(ponto).toEqual({ x: 120, y: 0 })
  })

  it('sem inimigos: para a essa distância do ferido, do lado de onde vem', () => {
    expect(posicaoParaCurar({ x: 0, y: 0 }, { x: 200, y: 0 }, [], 80)).toEqual({ x: 120, y: 0 })
    expect(posicaoParaCurar({ x: 150, y: 0 }, { x: 200, y: 0 }, [], 80)).toEqual({ x: 150, y: 0 }) // já está perto
  })

  it('curando a si mesmo, fica onde está', () => {
    const sacerdote = { x: 10, y: 20 }
    expect(posicaoParaCurar(sacerdote, sacerdote, [{ x: 50, y: 20 }], 80)).toEqual({ x: 10, y: 20 })
  })
})
