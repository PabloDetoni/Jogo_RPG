import { describe, expect, it, vi } from 'vitest'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import {
  abandonarMissao,
  aceitarMissao,
  classesParaContratar,
  contratarPermanente,
  contratarTemporario,
  entregarMissao,
  gastarPartidaDosContratos,
  multaDaMissao,
  objetivoCumprido,
  registrarNaMissao,
} from './guilda.js'

vi.mock('../dados/balanceamento.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  contratos: { precoDoTemporario: 200, partidasDoTemporario: 3, nivelDoTemporario: 5, precoDoPermanente: 1000 },
  curvaDeXp: { base: 100, expoente: 1 },
  pontosDeAtributoPorNivel: 3,
  pontosDeHabilidadePorNivel: 1,
}))

const lobos = { id: 'cacar-lobos', tipo: 'matar', alvo: 'lobo', quantidade: 10, recompensa: { ouro: 800, xp: 101 } }
const peles = { id: 'entregar-peles', tipo: 'entregar', alvo: 'pele-de-lobo', quantidade: 5, recompensa: { ouro: 300, xp: 0 } }
const clareira = { id: 'achar-clareira', tipo: 'explorar', alvo: 'clareira', quantidade: 1, recompensa: { ouro: 50, xp: 0 } }

const comGrupo = (mudancas = {}) => ({
  ...progressoInicial(),
  personagens: [novoPersonagem('mago'), novoPersonagem('tanque')],
  lider: 'tanque',
  ...mudancas,
})

describe('missões (RF26)', () => {
  it('aceitar: uma ativa por vez, e o progresso começa em zero', () => {
    const { ok, progresso } = aceitarMissao(comGrupo(), lobos)
    expect(ok).toBe(true)
    expect(progresso.missaoAtiva).toMatchObject({ id: 'cacar-lobos', progresso: 0 })
    const segunda = aceitarMissao(progresso, peles)
    expect(segunda.ok).toBe(false)
    expect(segunda.motivo).toContain('já tem uma missão ativa')
  })

  it('o progresso soma entre partidas: 4 lobos + 6 lobos = 10/10 (exemplo do Conceito)', () => {
    let missao = { ...lobos, progresso: 0 }
    missao = registrarNaMissao(missao, { tipo: 'abate', alvo: 'lobo', quantidade: 4 }) // primeira partida
    expect(missao.progresso).toBe(4)
    missao = registrarNaMissao(missao, { tipo: 'abate', alvo: 'lobo', quantidade: 6 }) // outra partida
    expect(missao.progresso).toBe(10)
    missao = registrarNaMissao(missao, { tipo: 'abate', alvo: 'lobo', quantidade: 3 })
    expect(missao.progresso).toBe(10) // não passa do pedido
  })

  it('só conta o que combina com a missão', () => {
    const missao = { ...lobos, progresso: 2 }
    expect(registrarNaMissao(missao, { tipo: 'abate', alvo: 'urso', quantidade: 1 }).progresso).toBe(2)
    expect(registrarNaMissao(missao, { tipo: 'coleta', alvo: 'lobo', quantidade: 1 }).progresso).toBe(2)
    expect(registrarNaMissao({ ...peles, progresso: 0 }, { tipo: 'coleta', alvo: 'pele-de-lobo', quantidade: 3 }).progresso).toBe(0)
    expect(registrarNaMissao(null, { tipo: 'abate', alvo: 'lobo' })).toBeNull()
  })

  it('explorar: visitar o local cumpre a missão', () => {
    const missao = registrarNaMissao({ ...clareira, progresso: 0 }, { tipo: 'exploracao', alvo: 'clareira' })
    expect(objetivoCumprido(missao, [])).toBe(true)
  })

  it('entregar: precisa ter os itens agora, somando todas as pilhas (RF27)', () => {
    const missao = { ...peles, progresso: 0 }
    expect(objetivoCumprido(missao, [{ id: 'pele-de-lobo', quantidade: 3 }])).toBe(false)
    expect(objetivoCumprido(missao, [{ id: 'pele-de-lobo', quantidade: 3 }, { id: 'pele-de-lobo', quantidade: 2 }])).toBe(true)
  })
})

describe('entregar na Guilda (RF27, RF50)', () => {
  it('cumprir não é receber: sem entregar, nada entra; ao entregar, entram ouro e XP', () => {
    const antes = comGrupo({ ouro: 10, missaoAtiva: { ...lobos, progresso: 10 } })
    expect(antes.ouro).toBe(10) // cumprida, mas ainda não entregue
    const { ok, progresso } = entregarMissao(antes)
    expect(ok).toBe(true)
    expect(progresso.ouro).toBe(810)
    expect(progresso.missaoAtiva).toBeNull()
  })

  it('o XP é dividido entre todos os permanentes; a sobra vai para o Líder', () => {
    const { progresso, niveisGanhos } = entregarMissao(comGrupo({ missaoAtiva: { ...lobos, progresso: 10 } }))
    const tanque = progresso.personagens.find((p) => p.classe === 'tanque')
    const mago = progresso.personagens.find((p) => p.classe === 'mago')
    // 101 de XP: 51 para o Tanque (Líder) e 50 para o Mago
    expect(tanque.xp).toBe(51)
    expect(mago.xp).toBe(50)
    expect(niveisGanhos).toEqual({ mago: 0, tanque: 0 })
  })

  it('XP suficiente sobe de nível', () => {
    const missao = { ...lobos, progresso: 10, recompensa: { ouro: 0, xp: 400 } }
    const { progresso, niveisGanhos } = entregarMissao(comGrupo({ missaoAtiva: missao }))
    expect(niveisGanhos).toEqual({ mago: 1, tanque: 1 })
    expect(progresso.personagens.every((p) => p.nivel === 2 && p.pontosDeAtributo === 3)).toBe(true)
  })

  it('missão de entrega consome os itens, de várias pilhas', () => {
    const mochila = [
      { id: 'pele-de-lobo', quantidade: 3 },
      { id: 'pocao', quantidade: 1 },
      { id: 'pele-de-lobo', quantidade: 4 },
    ]
    const { progresso } = entregarMissao(comGrupo({ mochila, missaoAtiva: { ...peles, progresso: 0 } }))
    expect(progresso.mochila).toEqual([
      { id: 'pocao', quantidade: 1 },
      { id: 'pele-de-lobo', quantidade: 2 },
    ])
    expect(progresso.ouro).toBe(300)
  })

  it('vender os itens antes deixa a entrega incompleta de novo', () => {
    const resposta = entregarMissao(comGrupo({ mochila: [{ id: 'pele-de-lobo', quantidade: 2 }], missaoAtiva: { ...peles, progresso: 0 } }))
    expect(resposta.ok).toBe(false)
    expect(resposta.motivo).toContain('faltam 3')
  })

  it('sem missão ativa não há o que entregar nem abandonar', () => {
    expect(entregarMissao(comGrupo()).ok).toBe(false)
    expect(abandonarMissao(comGrupo()).ok).toBe(false)
  })
})

describe('abandonar (RF28)', () => {
  it('multa de 10% do ouro da recompensa, arredondada para baixo', () => {
    expect(multaDaMissao(lobos)).toBe(80)
    expect(multaDaMissao({ ...lobos, recompensa: { ouro: 55, xp: 0 } })).toBe(5)
  })

  it('com 50 de ouro e multa de 80, o ouro fica em 0 (critério da TASK-031)', () => {
    const { ok, multa, progresso } = abandonarMissao(comGrupo({ ouro: 50, missaoAtiva: { ...lobos, progresso: 7 } }))
    expect(ok).toBe(true)
    expect(multa).toBe(80)
    expect(progresso.ouro).toBe(0)
    expect(progresso.missaoAtiva).toBeNull()
  })
})

describe('contratos (RF29, RF52)', () => {
  it('só aparecem classes que o jogador ainda não tem como permanente', () => {
    const lista = classesParaContratar(comGrupo({ contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }] }))
    expect(lista.map((c) => c.classe)).toEqual(['guerreiro', 'sacerdote', 'arqueiro'])
    expect(lista.find((c) => c.classe === 'arqueiro')).toEqual({ classe: 'arqueiro', temporario: false, permanente: true })
  })

  it('temporário: cobra o ouro e entra com partidas e nível fixos', () => {
    const { ok, progresso } = contratarTemporario(comGrupo({ ouro: 250 }), 'arqueiro')
    expect(ok).toBe(true)
    expect(progresso.ouro).toBe(50)
    expect(progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 3, nivel: 5 }])
  })

  it('temporário recusado: classe permanente, contrato repetido ou ouro insuficiente', () => {
    expect(contratarTemporario(comGrupo({ ouro: 999 }), 'mago').ok).toBe(false)
    const comArqueiro = comGrupo({ ouro: 999, contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }] })
    expect(contratarTemporario(comArqueiro, 'arqueiro').ok).toBe(false)
    expect(contratarTemporario(comGrupo({ ouro: 199 }), 'arqueiro').motivo).toContain('Ouro insuficiente')
  })

  it('permanente encerra só o temporário da mesma classe (critério da TASK-031)', () => {
    const antes = comGrupo({
      ouro: 1500,
      contratosTemporarios: [
        { classe: 'arqueiro', partidasRestantes: 2, nivel: 5 },
        { classe: 'sacerdote', partidasRestantes: 1, nivel: 5 },
      ],
    })
    const { ok, progresso } = contratarPermanente(antes, 'arqueiro')
    expect(ok).toBe(true)
    expect(progresso.ouro).toBe(500)
    expect(progresso.personagens.map((p) => p.classe)).toEqual(['mago', 'tanque', 'arqueiro'])
    expect(progresso.personagens[2]).toEqual(novoPersonagem('arqueiro'))
    expect(progresso.contratosTemporarios).toEqual([{ classe: 'sacerdote', partidasRestantes: 1, nivel: 5 }])
    expect(progresso.lider).toBe('tanque') // o Líder não muda
  })

  it('permanente recusado: já tem a classe ou falta ouro', () => {
    expect(contratarPermanente(comGrupo({ ouro: 5000 }), 'tanque').ok).toBe(false)
    expect(contratarPermanente(comGrupo({ ouro: 999 }), 'arqueiro').ok).toBe(false)
  })

  it('ao fim de cada partida, o temporário perde uma partida; com zero, vai embora (RF52)', () => {
    const depois = gastarPartidaDosContratos([
      { classe: 'arqueiro', partidasRestantes: 2, nivel: 5 },
      { classe: 'sacerdote', partidasRestantes: 1, nivel: 5 },
    ])
    expect(depois).toEqual([{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }])
  })
})
