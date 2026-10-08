import { describe, expect, it } from 'vitest'
import { preferenciasPadrao } from './preferencias.js'
import { atualizarEstado, criarEstadoInicial, dadosParaSalvar } from './estadoDoJogo.js'
import { novoPersonagem, progressoInicial } from './progresso.js'

const inicio = () => criarEstadoInicial(preferenciasPadrao)
const fazer = (estado, ...acoes) => acoes.reduce(atualizarEstado, estado)
const novoConvidado = { situacao: 'novo', progresso: progressoInicial(), partidaDescartada: false }
const progressoComMago = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }

const irAtePreparacao = [
  { tipo: 'irPara', destino: 'mapa' },
  { tipo: 'escolherBioma', bioma: 'floresta' },
  { tipo: 'escolherPontoPartida', pontoPartida: 'inicio' },
]
const comecar = { tipo: 'comecarPartida', agora: '2026-10-05T12:00:00.000Z' }

// Um convidado novo que já escolheu o Mago e está no Reino
function convidadoComMago() {
  return fazer(
    inicio(),
    { tipo: 'irPara', destino: 'login' },
    { tipo: 'entrarComoConvidado', carregamento: novoConvidado },
    { tipo: 'escolherClasseInicial', classe: 'mago' },
  )
}

describe('entrada e classe inicial', () => {
  it('convidado novo vai para a Narrativa (RF07)', () => {
    const e = fazer(inicio(), { tipo: 'entrarComoConvidado', carregamento: novoConvidado })
    expect(e).toMatchObject({ tela: 'narrativaInicial', tipoJogador: 'convidado', perfilLocal: 'convidado' })
  })

  it('escolher a classe cria o personagem, define o Líder, vai ao Reino e pede salvamento', () => {
    const e = convidadoComMago()
    expect(e.tela).toBe('reino')
    expect(e.progresso.personagens).toEqual([novoPersonagem('mago')])
    expect(e.progresso.lider).toBe('mago')
    expect(e.pedidosDeSalvamento).toBe(1)
  })

  it('a escolha da classe não se repete', () => {
    const e = fazer(convidadoComMago(), { tipo: 'escolherClasseInicial', classe: 'tanque' })
    expect(e.progresso.personagens.map((p) => p.classe)).toEqual(['mago'])
    expect(e.pedidosDeSalvamento).toBe(1)
  })

  it('o Líder só pode ser um dos próprios personagens (RF33)', () => {
    expect(fazer(convidadoComMago(), { tipo: 'escolherLider', classe: 'guerreiro' }).progresso.lider).toBe('mago')
  })
})

describe('partida', () => {
  it('"Começar partida" salva e marca a partida em andamento (RF34)', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar)
    expect(e.tela).toBe('partida')
    expect(e.pedidosDeSalvamento).toBe(2)
    expect(e.anteriores).toEqual([]) // da partida não se volta à preparação
    expect(dadosParaSalvar(e).partidaEmAndamento).toEqual({
      bioma: 'floresta',
      pontoPartida: 'inicio',
      lider: 'mago',
      iniciadaEm: '2026-10-05T12:00:00.000Z',
    })
  })

  it('durante a partida o progresso não muda (RF12)', () => {
    const antes = fazer(convidadoComMago(), ...irAtePreparacao)
    const durante = fazer(antes, comecar)
    expect(durante.progresso).toBe(antes.progresso)
  })

  it('encerrar: conta a partida, limpa a partida em andamento, salva e vai ao Resumo', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim: { resultado: 'vitoria' } })
    expect(e.tela).toBe('resumo')
    expect(e.progresso.estatisticas.partidasJogadas).toBe(1)
    expect(e.partidaAtual).toBeNull()
    expect(e.pedidosDeSalvamento).toBe(3)
    expect(e.ultimoResultado).toMatchObject({ resultado: 'vitoria', bioma: 'floresta', ouroGanho: 0, taxa: 0, ouroRecebido: 0 })
    expect(dadosParaSalvar(e).partidaEmAndamento).toBeNull()
  })

  it('ao fim da partida, cada contrato temporário perde uma partida (RF52)', () => {
    const contratos = [
      { classe: 'arqueiro', partidasRestantes: 2, nivel: 5 },
      { classe: 'sacerdote', partidasRestantes: 1, nivel: 5 },
    ]
    const comContratos = { ...convidadoComMago(), progresso: { ...convidadoComMago().progresso, contratosTemporarios: contratos } }
    const e = fazer(comContratos, ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim: { resultado: 'vitoria' } })
    expect(e.progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }])
  })

  it('contratado temporário não pode ser Líder (RF29)', () => {
    const base = convidadoComMago()
    const comArqueiro = {
      ...base,
      progresso: { ...base.progresso, contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }] },
    }
    expect(fazer(comArqueiro, { tipo: 'escolherLider', classe: 'arqueiro' }).progresso.lider).toBe('mago')
  })

  it('Derrota (todos desmaiaram) passa pela cutscene', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim: { como: 'todosDesmaiaram' } })
    expect(e.tela).toBe('cutsceneDerrota')
    expect(e.ultimoResultado).toMatchObject({ resultado: 'derrota', motivo: 'Todos os personagens desmaiaram' })
  })

  // Números da partida como a arena manda (CenaArena.terminar): ponto inicial em (0, 0) e borda a 1000 px
  const lugar = { inicio: { x: 0, y: 0 }, distanciaAteABorda: 1000 }

  it('retorno normal com números reais: Grande Vitória, ouro com +10%, XP, nível e monstros no save (TASK-048)', () => {
    const fim = { como: 'retornoNormal', ...lugar, lider: { x: 400, y: 0 }, ouroGanho: 1500, monstros: 30, segundosAtivos: 100, segundosTotais: 250, xpPorClasse: { mago: 150 } }
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim })
    // base = 30 × 10 + 1500 + 100 = 1900 > 1000 e nenhum desmaio
    expect(e.ultimoResultado).toMatchObject({ resultado: 'grandeVitoria', taxa: 0, ouroRecebido: 1650, pontuacaoBase: 1900, pontuacaoFinal: 2090 })
    expect(e.ultimoResultado).toMatchObject({ monstros: 30, segundosTotais: 250, segundosAtivos: 100, motivo: 'Retorno normal ao Reino' })
    expect(e.ultimoResultado.personagens).toEqual([{ classe: 'mago', xp: 150, nivelAntes: 1, nivel: 2, niveisGanhos: 1 }])
    const mago = e.progresso.personagens[0]
    expect(mago).toMatchObject({ nivel: 2, xp: 50, pontosDeAtributo: 3, pontosDeHabilidade: 1 })
    expect(e.progresso.ouro).toBe(1650)
    expect(e.progresso.estatisticas).toEqual({ partidasJogadas: 1, monstrosDerrotados: 30 })
  })

  it('Líder não levantado: Retorno forçado, e ele e os perdidos pagam pela distância de onde caíram (RF48)', () => {
    const fim = {
      como: 'liderNaoLevantado',
      motivo: 'Líder não levantado em 30 s',
      ...lugar,
      houveDesmaio: true,
      perdidos: [{ classe: 'tanque', x: 500, y: 0 }], // 1 + 5 × 0,5 = 3,5 → 3%
      caidosNoFim: [{ classe: 'mago', x: 0, y: 0 }], // o Líder caído no fim conta como perdido: 1%
      lider: { x: 0, y: 0 },
      ouroGanho: 200,
    }
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim })
    expect(e.tela).toBe('resumo')
    expect(e.ultimoResultado).toMatchObject({ resultado: 'retornoForcado', motivo: 'Líder não levantado em 30 s', taxa: 4, taxaEmOuro: 8, ouroRecebido: 192 })
    expect(e.ultimoResultado.perdidos).toEqual(['tanque', 'mago'])
    expect(e.progresso.ouro).toBe(192)
    expect(dadosParaSalvar(e).progresso).not.toHaveProperty('perdidos') // o save não muda de formato
  })

  it('XP é mantido em todos os resultados, até na Derrota (RF50)', () => {
    const fim = { como: 'todosDesmaiaram', ...lugar, lider: { x: 1000, y: 0 }, ouroGanho: 100, xpPorClasse: { mago: 40 } }
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim })
    expect(e.ultimoResultado).toMatchObject({ resultado: 'derrota', taxa: 40, ouroRecebido: 60 })
    expect(e.progresso.personagens[0].xp).toBe(40)
  })

  it('Voltar ao Reino pela pausa: fecha a pausa e pede à partida a contagem de 15 s (RF44, RF45)', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'esc' }, { tipo: 'iniciarRetorno' })
    expect(e.janelas).toEqual([])
    expect(e.controleDaPartida.pedido).toEqual({ id: 1, tipo: 'comecarRetorno' })
    expect(e.tela).toBe('partida')
  })

  it('partida sem "Começar" (painel de dev) não conta', () => {
    const e = fazer(convidadoComMago(), { tipo: 'irPara', destino: 'partida' }, { tipo: 'encerrarPartida', fim: { resultado: 'vitoria' } })
    expect(e.progresso.estatisticas.partidasJogadas).toBe(0)
  })

  it('sair da tela da partida sem resultado descarta a partida', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'irPara', destino: 'reino' })
    expect(e.partidaAtual).toBeNull()
  })

  it('sem Líder, "Começar partida" é ignorado', () => {
    expect(fazer(inicio(), comecar).tela).toBe('telaInicial')
  })
})

describe('contas (RF03)', () => {
  it('conta criada a partir do convidado leva o progresso dele', () => {
    const convidado = convidadoComMago()
    const e = fazer(convidado, { tipo: 'irPara', destino: 'criarConta' }, { tipo: 'confirmarConta' })
    expect(e).toMatchObject({ tipoJogador: 'conta', perfilLocal: null, tela: 'reino' })
    expect(e.progresso).toBe(convidado.progresso)
  })

  it('entrar numa conta que já existia não mistura o progresso do convidado', () => {
    const e = fazer(convidadoComMago(), { tipo: 'irPara', destino: 'login' }, { tipo: 'entrarNaConta' })
    expect(e).toMatchObject({ tipoJogador: 'conta', perfilLocal: null, tela: 'narrativaInicial' })
    expect(e.progresso).toEqual(progressoInicial())
  })

  it('conta nova sem convidado começa vazia', () => {
    expect(fazer(inicio(), { tipo: 'confirmarConta' }).progresso).toEqual(progressoInicial())
  })

  it('trocar o tipo pelo painel de dev não liga o salvamento', () => {
    expect(fazer(inicio(), { tipo: 'trocarTipoJogador' })).toMatchObject({ tipoJogador: 'convidado', perfilLocal: null })
  })
})

describe('carregar o convidado', () => {
  it('partida descartada: aviso, pedido de salvamento e Reino', () => {
    const carregamento = { situacao: 'carregado', progresso: progressoComMago, partidaDescartada: true }
    const e = fazer(inicio(), { tipo: 'entrarComoConvidado', carregamento })
    expect(e.tela).toBe('reino')
    expect(e.pedidosDeSalvamento).toBe(1)
    expect(e.avisos).toHaveLength(1)
    expect(e.avisos[0].texto).toContain('descartada')
    expect(fazer(e, { tipo: 'fecharAviso', id: e.avisos[0].id }).avisos).toHaveLength(0)
  })

  it('save estragado: aviso e começa do zero', () => {
    const carregamento = { situacao: 'corrompido', progresso: progressoInicial(), partidaDescartada: false }
    const e = fazer(inicio(), { tipo: 'entrarComoConvidado', carregamento })
    expect(e).toMatchObject({ tela: 'narrativaInicial', perfilLocal: 'convidado' })
    expect(e.avisos).toHaveLength(1)
  })

  it('save de versão mais nova do jogo: aviso e nada é salvo', () => {
    const carregamento = { situacao: 'formatoNovo', progresso: progressoInicial(), partidaDescartada: false }
    const e = fazer(inicio(), { tipo: 'entrarComoConvidado', carregamento })
    expect(e.perfilLocal).toBeNull()
    expect(e.avisos).toHaveLength(1)
  })
})

describe('navegação, janelas e preferências', () => {
  it('Voltar volta para a tela anterior; telas raiz esquecem o caminho', () => {
    let e = fazer(inicio(), { tipo: 'irPara', destino: 'salaoGloria' })
    expect(e.anteriores).toEqual(['telaInicial'])
    e = fazer(e, { tipo: 'voltar' })
    expect(e.tela).toBe('telaInicial')
  })

  it('Esc fecha a janela de cima; na Partida sem janela, pausa', () => {
    let e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'abrirJanela', janela: 'configuracoes' })
    e = fazer(e, { tipo: 'esc' })
    expect(e.janelas).toEqual([])
    e = fazer(e, { tipo: 'esc' })
    expect(e.janelas).toEqual(['pausa'])
  })

  it('música, som e tema alternam', () => {
    const e = fazer(inicio(), { tipo: 'alternarPreferencia', chave: 'tema' }, { tipo: 'alternarPreferencia', chave: 'musica' })
    expect(e.preferencias).toEqual({ musica: false, som: true, mudo: false, tema: 'escuro' })
  })

  it('o mudo (tecla M) alterna sem mexer na música nem no som (RF18)', () => {
    const e = fazer(inicio(), { tipo: 'alternarPreferencia', chave: 'mudo' })
    expect(e.preferencias).toEqual({ musica: true, som: true, mudo: true, tema: 'claro' })
    expect(fazer(e, { tipo: 'alternarPreferencia', chave: 'mudo' }).preferencias.mudo).toBe(false)
  })
})

describe('pausa, retorno e fuga na partida (TASK-040, TASK-041)', () => {
  const naPartida = () => fazer(convidadoComMago(), ...irAtePreparacao, comecar)
  const emCombate = { tipo: 'atualizarAndamento', andamento: { emCombate: true, retornando: false, fugindo: false } }

  it('Esc em combate não pausa: a recusa é contada para a Partida mostrar o aviso (RF44)', () => {
    let e = fazer(naPartida(), emCombate, { tipo: 'esc' })
    expect(e.janelas).toEqual([])
    expect(e.controleDaPartida.recusasDePausa).toBe(1)
    e = fazer(e, { tipo: 'atualizarAndamento', andamento: { emCombate: false, retornando: false, fugindo: false } }, { tipo: 'esc' })
    expect(e.janelas).toEqual(['pausa'])
  })

  it('em combate, Esc ainda fecha a janela aberta antes de tudo', () => {
    const e = fazer(naPartida(), emCombate, { tipo: 'abrirJanela', janela: 'configuracoes' }, { tipo: 'esc' })
    expect(e.janelas).toEqual([])
    expect(e.controleDaPartida.recusasDePausa).toBe(0)
  })

  it('F abre o aviso com o custo; F de novo confirma e pede a fuga à partida (RF46)', () => {
    let e = fazer(naPartida(), { tipo: 'pedirFuga', custo: { taxa: 12, ouro: 10 } })
    expect(e.janelas).toEqual(['confirmarFuga'])
    expect(e.controleDaPartida.custoDaFuga).toEqual({ taxa: 12, ouro: 10 })
    e = fazer(e, { tipo: 'confirmarFuga' })
    expect(e.janelas).toEqual([])
    expect(e.controleDaPartida.pedido).toEqual({ id: 1, tipo: 'fugir' })
  })

  it('Esc (ou Cancelar) fecha o aviso da fuga e nada é pedido', () => {
    const e = fazer(naPartida(), { tipo: 'pedirFuga', custo: { taxa: 7, ouro: 0 } }, { tipo: 'esc' })
    expect(e.janelas).toEqual([])
    expect(e.controleDaPartida.pedido).toBeNull()
    expect(fazer(e, { tipo: 'confirmarFuga' }).controleDaPartida.pedido).toBeNull() // sem aviso aberto, não confirma
  })

  it('o aviso da fuga não abre com outra janela aberta nem depois de a fuga começar', () => {
    const comPausa = fazer(naPartida(), { tipo: 'esc' }, { tipo: 'pedirFuga', custo: null })
    expect(comPausa.janelas).toEqual(['pausa'])
    const fugindo = fazer(naPartida(), { tipo: 'atualizarAndamento', andamento: { emCombate: true, retornando: false, fugindo: true } }, { tipo: 'pedirFuga', custo: null })
    expect(fugindo.janelas).toEqual([])
  })

  it('o controle da partida volta ao começo quando ela acaba', () => {
    const e = fazer(naPartida(), emCombate, { tipo: 'esc' }, { tipo: 'encerrarPartida', fim: { resultado: 'vitoria' } })
    expect(e.controleDaPartida.recusasDePausa).toBe(0)
    expect(e.controleDaPartida.andamento.emCombate).toBe(false)
  })
})

describe('Guilda: contratos (TASK-079)', () => {
  const comOuro = (ouro) => {
    const base = convidadoComMago()
    return { ...base, progresso: { ...base.progresso, ouro } }
  }

  it('temporário: paga o ouro, entra com as partidas e o nível do contrato e salva', () => {
    const e = fazer(comOuro(500), { tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    expect(e.progresso.ouro).toBe(300)
    expect(e.progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 3, nivel: 5 }])
    expect(e.pedidosDeSalvamento).toBe(2)
  })

  it('sem ouro, nada muda e nada é salvo (a tela mostra o motivo, da mesma regra)', () => {
    const antes = comOuro(50)
    const e = fazer(antes, { tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    expect(e).toBe(antes)
  })

  it('permanente: nível 1 e encerra o temporário da mesma classe', () => {
    let e = fazer(comOuro(1500), { tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    e = fazer(e, { tipo: 'contratar', contrato: 'permanente', classe: 'arqueiro' })
    expect(e.progresso.ouro).toBe(300)
    expect(e.progresso.contratosTemporarios).toEqual([])
    expect(e.progresso.personagens.map((p) => [p.classe, p.nivel])).toEqual([['mago', 1], ['arqueiro', 1]])
  })

  it('um temporário com 2 partidas fica com 1 depois de uma partida (critério do card)', () => {
    const base = comOuro(0)
    const comContrato = { ...base, progresso: { ...base.progresso, contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }] } }
    const e = fazer(comContrato, ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', fim: { resultado: 'vitoria' } })
    expect(e.progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }])
  })

  it('durante a partida não contrata (o progresso não muda, RF12)', () => {
    const antes = fazer(comOuro(5000), ...irAtePreparacao, comecar)
    expect(fazer(antes, { tipo: 'contratar', contrato: 'permanente', classe: 'tanque' }).progresso).toBe(antes.progresso)
  })
})

describe('painel DEV: mexe no save só fora da partida (5c)', () => {
  it('contratar todas as classes cria os permanentes que faltam e salva', () => {
    const e = fazer(convidadoComMago(), { tipo: 'devContratarTodas' })
    expect(e.progresso.personagens.map((p) => p.classe)).toEqual(['mago', 'guerreiro', 'tanque', 'sacerdote', 'arqueiro'])
    expect(e.progresso.lider).toBe('mago')
    expect(e.pedidosDeSalvamento).toBe(2)
  })

  it('nível +/- e "quase subir"', () => {
    let e = fazer(convidadoComMago(), { tipo: 'devMudarNivel', classe: 'mago', quantos: 28 })
    expect(e.progresso.personagens[0]).toMatchObject({ nivel: 29, xp: 0 })
    e = fazer(e, { tipo: 'devQuaseSubir', classe: 'mago' })
    expect(e.progresso.personagens[0]).toMatchObject({ nivel: 29, xp: 2899 })
    e = fazer(e, { tipo: 'devMudarNivel', classe: 'mago', quantos: -100 })
    expect(e.progresso.personagens[0].nivel).toBe(1)
  })

  it('durante a partida não mexe em nada (RF12)', () => {
    const antes = fazer(convidadoComMago(), ...irAtePreparacao, comecar)
    const depois = fazer(antes, { tipo: 'devContratarTodas' }, { tipo: 'devMudarNivel', classe: 'mago', quantos: 5 })
    expect(depois.progresso).toBe(antes.progresso)
  })

  it('avisos têm ids diferentes', () => {
    const e = fazer(inicio(), { tipo: 'mostrarAviso', texto: 'a' }, { tipo: 'mostrarAviso', texto: 'b' })
    expect(new Set(e.avisos.map((a) => a.id)).size).toBe(2)
  })

  it('ação desconhecida dá erro claro', () => {
    expect(() => atualizarEstado(inicio(), { tipo: 'voar' })).toThrow('voar')
  })
})
