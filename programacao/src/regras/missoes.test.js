import { describe, expect, it } from 'vitest'
import { mundo } from '../dados/balanceamento.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { descreverMissao, missaoDoQuadro, nomeDoAlvo, quadroDeMissoes, tiposDeMissao } from '../dados/missoes.js'
import { floresta } from '../dados/mundo/floresta.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import {
  abandonarMissaoNaGuilda,
  aceitarMissaoDoQuadro,
  avancarComEventos,
  avisoDaMissao,
  entregarMissaoNaGuilda,
  missaoCumprida,
  missaoEmUmaLinha,
  progressoAgora,
} from './missoes.js'

const base = (mudancas = {}) => ({ ...progressoInicial(), personagens: [novoPersonagem('mago'), novoPersonagem('tanque')], lider: 'mago', ...mudancas })

describe('quadro de missões (TASK-078, provisório até a TASK-015)', () => {
  it('pelo menos uma de cada tipo, só com mobs, itens e áreas que existem no beta, e recompensa razoável', () => {
    expect(new Set(quadroDeMissoes.map((missao) => missao.tipo))).toEqual(new Set(tiposDeMissao))
    const tiposDeMob = new Set([...Object.keys(mundo.mobs), 'guardiao'])
    const areas = new Set(floresta.areas.map((area) => area.id))
    for (const missao of quadroDeMissoes) {
      if (missao.tipo === 'matar') expect(tiposDeMob.has(missao.alvo), missao.id).toBe(true)
      if (missao.tipo === 'coletar' || missao.tipo === 'entregar') expect(itemDoCatalogo(missao.alvo), missao.id).not.toBeNull()
      if (missao.tipo === 'explorar') expect(areas.has(missao.alvo), missao.id).toBe(true)
      expect(Number.isInteger(missao.quantidade) && missao.quantidade >= 1 && missao.quantidade <= 50, missao.id).toBe(true)
      expect(missao.recompensa.ouro > 0 && missao.recompensa.ouro <= 1000 && missao.recompensa.xp > 0 && missao.recompensa.xp <= 2000, missao.id).toBe(true)
      expect(missao.titulo.length > 3 && missao.descricao.length > 5, missao.id).toBe(true)
    }
    expect(new Set(quadroDeMissoes.map((missao) => missao.id)).size).toBe(quadroDeMissoes.length)
  })

  it('o nome do alvo e a linha do HUD do Reino', () => {
    expect(nomeDoAlvo(missaoDoQuadro('pelesParaOCurtidor'))).toBe('Pele de lobo')
    expect(nomeDoAlvo(missaoDoQuadro('coracaoDaMata'))).toBe('Coração da Mata')
    expect(nomeDoAlvo(missaoDoQuadro('oGuardiao'))).toBe('Guardião da Floresta')
    expect(descreverMissao({ ...missaoDoQuadro('cacarLobos'), progresso: 3 })).toBe('Derrotar 8 lobo (3/8)')
  })
})

describe('missões no Reino (TASK-078)', () => {
  it('aceitar do quadro guarda só o que o save precisa, com o progresso em zero', () => {
    const r = aceitarMissaoDoQuadro(base(), 'cacarLobos')
    expect(r.progresso.missaoAtiva).toEqual({ id: 'cacarLobos', tipo: 'matar', alvo: 'lobo', quantidade: 8, recompensa: { ouro: 80, xp: 120 }, progresso: 0 })
    expect(r.mensagem).toBe('Missão aceita: Caçar lobos. O progresso conta a partir de agora.')
    expect(aceitarMissaoDoQuadro(r.progresso, 'aranhasNoCaminho').ok).toBe(false) // uma por vez
    expect(aceitarMissaoDoQuadro(base(), 'naoExiste').ok).toBe(false)
  })

  it('critério do card: 4 de 10 lobos e mais 6 em outra partida → 10/10, mas o ouro só entra ao entregar', () => {
    const missao = { id: 'm', tipo: 'matar', alvo: 'lobo', quantidade: 10, progresso: 4, recompensa: { ouro: 80, xp: 100 } }
    const depois = avancarComEventos(missao, { abates: { lobo: 6, aranha: 2 } })
    expect(depois.progresso).toBe(10)
    const p = base({ ouro: 5, missaoAtiva: depois })
    expect(missaoCumprida(p)).toBe(true)
    expect(p.ouro).toBe(5)
    const entregue = entregarMissaoNaGuilda(p)
    expect(entregue.progresso.ouro).toBe(85)
    expect(entregue.progresso.missaoAtiva).toBeNull()
    expect(entregue.mensagem).toContain('+80 de ouro e 100 XP')
  })

  it('coletar conta o que foi pego; explorar, a área visitada depois de aceitar', () => {
    const coletar = avancarComEventos({ tipo: 'coletar', alvo: 'cogumelo', quantidade: 6, progresso: 1 }, { coletados: { cogumelo: 3, madeira: 9 } })
    expect(coletar.progresso).toBe(4)
    const explorar = avancarComEventos({ tipo: 'explorar', alvo: 'coracaoDaMata', quantidade: 1, progresso: 0 }, { areasVisitadas: ['riachoSeco', 'coracaoDaMata'] })
    expect(explorar.progresso).toBe(1)
    expect(avancarComEventos(null, { abates: { lobo: 1 } })).toBeNull()
  })

  it('entrega: conta o que está na Mochila agora e consome os itens', () => {
    const p = base({ missaoAtiva: { id: 'pelesParaOCurtidor', tipo: 'entregar', alvo: 'peleDeLobo', quantidade: 4, progresso: 0, recompensa: { ouro: 90, xp: 100 } }, mochila: [{ id: 'peleDeLobo', quantidade: 3 }] })
    expect(progressoAgora(p)).toBe(3)
    expect(missaoEmUmaLinha(p)).toBe('Entregar 4 Pele de lobo (3/4)')
    expect(entregarMissaoNaGuilda(p).ok).toBe(false)
    const comTudo = { ...p, mochila: [{ id: 'peleDeLobo', quantidade: 5 }] }
    expect(entregarMissaoNaGuilda(comTudo).progresso.mochila).toEqual([{ id: 'peleDeLobo', quantidade: 1 }])
  })

  it('abandonar paga 10% da recompensa (com pouco ouro, fica em zero)', () => {
    const p = base({ ouro: 5, missaoAtiva: { id: 'oGuardiao', tipo: 'matar', alvo: 'guardiao', quantidade: 1, progresso: 0, recompensa: { ouro: 400, xp: 600 } } })
    const r = abandonarMissaoNaGuilda(p)
    expect(r.progresso.ouro).toBe(0)
    expect(r.progresso.missaoAtiva).toBeNull()
    expect(r.mensagem).toBe('Missão abandonada. Multa: 40 de ouro.')
  })
})

describe('avisos da missão na partida', () => {
  const missao = { tipo: 'matar', alvo: 'lobo', quantidade: 3, progresso: 1 }
  it('avisa quando o progresso sobe e quando cumpre; depois de cumprida, não repete', () => {
    expect(avisoDaMissao(missao, 1, { abates: { lobo: 1 } })).toBe('Missão: 2/3 lobo')
    expect(avisoDaMissao(missao, 2, { abates: { lobo: 2 } })).toBe('Missão cumprida: lobo! Entregue na Guilda.')
    expect(avisoDaMissao(missao, 3, { abates: { lobo: 3 } })).toBeNull()
    expect(avisoDaMissao(missao, 1, { abates: { aranha: 1 } })).toBeNull()
  })

  it('a de entrega não avisa na partida (conta na Guilda); sem missão, nada', () => {
    expect(avisoDaMissao({ tipo: 'entregar', alvo: 'peleDeLobo', quantidade: 2, progresso: 0 }, 0, { coletados: { peleDeLobo: 2 } })).toBeNull()
    expect(avisoDaMissao(null, 0, {})).toBeNull()
  })
})
