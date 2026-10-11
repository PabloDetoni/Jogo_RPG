import { describe, expect, it } from 'vitest'
import { arteEsperada, bonecos, cutsceneDeDerrota, fundosDasTelas } from '../dados/arte.js'
import { classes } from '../dados/classes.js'
import { itens } from '../dados/itens.js'
import { telas } from '../dados/telas.js'
import {
  avisoDoTamanho,
  chaveDaArte,
  direcaoDoVetor,
  escolherAnimacao,
  escolherPedra,
  fundoDaTela,
  gramaDaRegiao,
  idDaArte,
  indiceDaArte,
  nomeDoArquivo,
  quadrosDaFaixa,
  quadrosSoltos,
  reconhecerArte,
  temArteDoBoneco,
} from './arte.js'

const conjunto = (...nomes) => new Set(nomes.map(chaveDaArte))

describe('arte: achar os arquivos (TASK-110)', () => {
  it('o nome não liga para maiúsculas, acentos, hífen, sublinhado nem espaço', () => {
    expect(chaveDaArte('Guerreiro_Andando-Baixo')).toBe('guerreiroandandobaixo')
    expect(chaveDaArte('guerreiro andando baixo')).toBe('guerreiroandandobaixo')
    expect(chaveDaArte('Poção de vida')).toBe('pocaodevida')
    expect(chaveDaArte('item-pocaoDeVida')).toBe(chaveDaArte('item-pocao-de-vida'))
  })

  it('o nome do arquivo sai do caminho, sem pasta nem extensão', () => {
    expect(nomeDoArquivo('../assets/arte/mobs/Lobo-Andando-Baixo.png')).toBe('Lobo-Andando-Baixo')
    expect(nomeDoArquivo('C:\\arte\\fundo-reino.webp')).toBe('fundo-reino')
  })

  it('o índice guarda o primeiro de cada nome e avisa os repetidos (a arte de verdade vem antes da de teste)', () => {
    const { arquivos, repetidos } = indiceDaArte([
      ['../assets/arte/lobo.png', 'url-1'],
      ['../assets/arte/mobs/Lobo.png', 'url-2'],
      ['../assets/arte-de-teste/fundo-reino.png', 'url-3'],
    ])
    expect(arquivos).toEqual({ lobo: 'url-1', fundoreino: 'url-3' })
    expect(repetidos).toEqual(['lobo'])
  })
})

describe('arte: faixas e quadros soltos', () => {
  it('quadros quadrados lado a lado; o que não fecha é um quadro só', () => {
    expect(quadrosDaFaixa(192, 48)).toBe(4)
    expect(quadrosDaFaixa(48, 48)).toBe(1)
    expect(quadrosDaFaixa(144, 48)).toBe(3)
    expect(quadrosDaFaixa(100, 48)).toBe(1) // 2,08 quadros: não fecha
    expect(quadrosDaFaixa(64, 96)).toBe(1) // árvore em pé
    expect(quadrosDaFaixa(0, 0)).toBe(1)
  })

  it('quadros soltos em ordem, começando do 0 ou do 1, com ou sem zeros na frente', () => {
    const chaves = conjunto('lobo-andar-baixo-10', 'lobo-andar-baixo-2', 'lobo-andar-baixo-01', 'lobo-andar-baixo', 'lobo-andar-baixo-x')
    expect(quadrosSoltos(chaves, 'loboandarbaixo')).toEqual(['loboandarbaixo01', 'loboandarbaixo2', 'loboandarbaixo10'])
    expect(quadrosSoltos(chaves, 'loboandarcima')).toEqual([])
  })
})

describe('arte: que animação mostrar', () => {
  it('sem imagem nenhuma, fica o quadrado (null)', () => {
    expect(escolherAnimacao(new Set(), 'guerreiro', 'andando', 'baixo')).toBeNull()
    expect(temArteDoBoneco(new Set(), 'guerreiro')).toBe(false)
  })

  it('a animação na direção pedida, em faixa ou em quadros soltos', () => {
    const chaves = conjunto('guerreiro-andando-baixo', 'guerreiro-andando-cima-1', 'guerreiro-andando-cima-2')
    expect(escolherAnimacao(chaves, 'guerreiro', 'andando', 'baixo')).toEqual({ animacao: 'andando', chaves: ['guerreiroandandobaixo'], espelhar: false })
    expect(escolherAnimacao(chaves, 'guerreiro', 'andando', 'cima')).toEqual({
      animacao: 'andando',
      chaves: ['guerreiroandandocima1', 'guerreiroandandocima2'],
      espelhar: false,
    })
  })

  it('sem a esquerda, usa a direita espelhada (e o contrário); sem os lados, a de baixo', () => {
    const soDireita = conjunto('lobo-andando-direita', 'lobo-andando-baixo')
    expect(escolherAnimacao(soDireita, 'lobo', 'andando', 'esquerda')).toMatchObject({ chaves: ['loboandandodireita'], espelhar: true })
    expect(escolherAnimacao(soDireita, 'lobo', 'andando', 'cima')).toMatchObject({ chaves: ['loboandandobaixo'], espelhar: false })
    const soBaixo = conjunto('lobo-andando-baixo')
    expect(escolherAnimacao(soBaixo, 'lobo', 'andando', 'direita')).toMatchObject({ chaves: ['loboandandobaixo'], espelhar: false })
  })

  it('sem a animação, a da reserva; por fim, a imagem única do boneco', () => {
    const parado = conjunto('mago-parado-baixo')
    expect(escolherAnimacao(parado, 'mago', 'andando', 'baixo')).toMatchObject({ animacao: 'parado', chaves: ['magoparadobaixo'] })
    expect(escolherAnimacao(parado, 'mago', 'atacando', 'baixo')).toMatchObject({ animacao: 'parado' })
    expect(escolherAnimacao(parado, 'mago', 'desmaiado', 'baixo')).toBeNull() // o desmaiado sem imagem: parado, cinza e deitado
    const unica = conjunto('javali')
    expect(escolherAnimacao(unica, 'javali', 'andando', 'esquerda')).toEqual({ animacao: 'unica', chaves: ['javali'], espelhar: false })
    expect(temArteDoBoneco(unica, 'javali')).toBe(true)
  })

  it('o aviso dos mobs usa o ataque quando não tem imagem própria', () => {
    const chaves = conjunto('aranha-atacando-baixo')
    expect(escolherAnimacao(chaves, 'aranha', 'aviso', 'baixo')).toMatchObject({ animacao: 'atacando' })
  })

  it('os nomes do PixelLab em inglês também valem', () => {
    const chaves = conjunto('Arqueiro_walk_south', 'arqueiro-idle-east', 'guardiao-attack-west')
    expect(escolherAnimacao(chaves, 'arqueiro', 'andando', 'baixo')).toMatchObject({ animacao: 'andando', chaves: ['arqueirowalksouth'] })
    expect(escolherAnimacao(chaves, 'arqueiro', 'parado', 'esquerda')).toMatchObject({ chaves: ['arqueiroidleeast'], espelhar: true })
    expect(escolherAnimacao(chaves, 'guardiao', 'atacando', 'esquerda')).toMatchObject({ chaves: ['guardiaoattackwest'], espelhar: false })
  })

  it('os mobs da arena de teste usam o desenho do lobo e da aranha', () => {
    expect(idDaArte('mobVermelho')).toBe('lobo')
    expect(idDaArte('atirador')).toBe('aranha')
    expect(idDaArte('guerreiro')).toBe('guerreiro')
    expect(escolherAnimacao(conjunto('lobo-andando-baixo'), 'mobVermelho', 'andando', 'baixo')).toMatchObject({ chaves: ['loboandandobaixo'] })
  })
})

describe('arte: para que lado olha', () => {
  it('pela direção em que anda; parado, continua como estava', () => {
    expect(direcaoDoVetor(0, 10)).toBe('baixo')
    expect(direcaoDoVetor(0, -10)).toBe('cima')
    expect(direcaoDoVetor(-10, 0)).toBe('esquerda')
    expect(direcaoDoVetor(10, 1)).toBe('direita')
    expect(direcaoDoVetor(0, 0, 'esquerda')).toBe('esquerda')
  })

  it('na diagonal, não fica trocando de lado a cada quadro', () => {
    expect(direcaoDoVetor(10, 10.5, 'direita')).toBe('direita')
    expect(direcaoDoVetor(10.5, 10, 'baixo')).toBe('baixo')
    expect(direcaoDoVetor(10, 20, 'direita')).toBe('baixo')
  })
})

describe('arte: Floresta e telas', () => {
  it('a pedra pela largura da hitbox, com a mais parecida quando falta', () => {
    const todas = conjunto('pedra-pequena', 'pedra-media', 'pedra-grande')
    expect(escolherPedra(todas, 70)).toBe('pedrapequena')
    expect(escolherPedra(todas, 90)).toBe('pedramedia')
    expect(escolherPedra(todas, 120)).toBe('pedragrande')
    expect(escolherPedra(conjunto('pedra-media'), 120)).toBe('pedramedia')
    expect(escolherPedra(conjunto('pedra'), 70)).toBe('pedra')
    expect(escolherPedra(new Set(), 70)).toBeNull()
  })

  it('a grama pronta da região vem sem tinta; a comum leva o tom da região', () => {
    expect(gramaDaRegiao(conjunto('grama-facil'), 'facil')).toEqual({ chaves: ['gramafacil'], tinta: 0xffffff })
    const comum = gramaDaRegiao(conjunto('grama-1', 'grama-3'), 'dificil')
    expect(comum.chaves).toEqual(['grama1', 'grama3'])
    expect(comum.tinta).not.toBe(0xffffff)
    expect(gramaDaRegiao(new Set(), 'facil')).toBeNull()
  })

  it('o fundo da tela: o dela primeiro, depois o da lista; sem nenhum, fica o cinza', () => {
    expect(fundoDaTela(conjunto('fundo-acesso'), 'login')).toBe('fundoacesso')
    expect(fundoDaTela(conjunto('fundo-acesso', 'fundo-login'), 'login')).toBe('fundologin')
    expect(fundoDaTela(conjunto('fundo-mercado'), 'mercado')).toBe('fundomercado')
    expect(fundoDaTela(new Set(), 'reino')).toBeNull()
    expect(fundoDaTela(conjunto('fundo-reino'), 'partida')).toBeNull()
  })

  it('todo fundo da lista é de uma tela que existe', () => {
    for (const id of Object.keys(fundosDasTelas)) expect(telas[id], id).toBeDefined()
  })
})

describe('arte: a lista do que falta (npm run conferir:arte)', () => {
  it('pede as 5 classes nas 4 direções, os mobs, o Boss, os ícones de todos os itens do beta e as telas', () => {
    const nomes = arteEsperada().flatMap((grupo) => grupo.nomes)
    for (const classe of classes) {
      expect(nomes).toContain(`${classe.id}-andando-baixo`)
      expect(nomes).toContain(`${classe.id}-desmaiado`)
      expect(nomes).toContain(`retrato-${classe.id}`)
    }
    for (const item of Object.values(itens).filter((um) => um.raridade !== 'teste')) expect(nomes).toContain(`item-${item.id}`)
    expect(nomes).toContain('guardiao-aviso-baixo')
    expect(nomes).toContain('fundo-reino')
    for (const imagem of cutsceneDeDerrota.imagens) expect(nomes).toContain(imagem)
    expect(new Set(nomes.map(chaveDaArte)).size).toBe(nomes.length) // nenhum nome repetido
  })

  it('todo boneco que usa o desenho de outro aponta para um que existe', () => {
    for (const [id, boneco] of Object.entries(bonecos)) if (boneco.usa) expect(bonecos[boneco.usa], id).toBeDefined()
  })

  it('reconhece os nomes da lista, os apelidos, os quadros soltos e os opcionais; o resto é nome errado', () => {
    expect(reconhecerArte(chaveDaArte('guerreiro-andando-baixo'))).toMatchObject({ tipo: 'personagem', quadroSolto: false })
    expect(reconhecerArte(chaveDaArte('guerreiro-walk-south'))).toMatchObject({ tipo: 'personagem', canonico: 'guerreiroandandobaixo' })
    expect(reconhecerArte(chaveDaArte('mago-dead-east'))).toMatchObject({ canonico: 'magodesmaiado' })
    expect(reconhecerArte(chaveDaArte('mago-andando'))).toMatchObject({ canonico: null }) // vale, mas não é um nome da lista
    expect(reconhecerArte(chaveDaArte('lobo-andando-baixo-3'))).toMatchObject({ tipo: 'mob', quadroSolto: true })
    expect(reconhecerArte(chaveDaArte('guardiao'))).toMatchObject({ tipo: 'boss' })
    expect(reconhecerArte(chaveDaArte('fundo-mercado'))).toMatchObject({ tipo: 'fundo' })
    expect(reconhecerArte(chaveDaArte('grama-facil'))).toMatchObject({ tipo: 'tile' })
    expect(reconhecerArte(chaveDaArte('grama-2'))).toMatchObject({ tipo: 'tile' })
    expect(reconhecerArte(chaveDaArte('item-pocaoDeVida'))).toMatchObject({ tipo: 'icone' })
    expect(reconhecerArte(chaveDaArte('guerrero-andando-baixo'))).toBeNull()
    expect(reconhecerArte(chaveDaArte('item-espada-lendaria'))).toBeNull()
  })

  it('avisa tamanho estranho sem impedir nada', () => {
    expect(avisoDoTamanho('personagem', 192, 48)).toBeNull()
    expect(avisoDoTamanho('personagem', 100, 48)).toMatch(/número inteiro de quadros/)
    expect(avisoDoTamanho('personagem', 48, 48, { quadroSolto: true })).toBeNull()
    expect(avisoDoTamanho('icone', 32, 32)).toBeNull()
    expect(avisoDoTamanho('icone', 32, 48)).toMatch(/quadrado/)
    expect(avisoDoTamanho('tile', 32, 32, { nome: 'grama-1' })).toBeNull()
    expect(avisoDoTamanho('tile', 64, 96, { nome: 'arvore' })).toBeNull()
    expect(avisoDoTamanho('tile', 32, 30, { nome: 'grama-1' })).toMatch(/quadrado/)
    expect(avisoDoTamanho('fundo', 1920, 1080)).toBeNull()
    expect(avisoDoTamanho('fundo', 1024, 1024)).toMatch(/16:9/)
    expect(avisoDoTamanho('fundo', 960, 540)).toMatch(/pequena/)
  })
})
