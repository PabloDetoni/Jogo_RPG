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
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', resultado: 'vitoria' })
    expect(e.tela).toBe('resumo')
    expect(e.progresso.estatisticas.partidasJogadas).toBe(1)
    expect(e.partidaAtual).toBeNull()
    expect(e.pedidosDeSalvamento).toBe(3)
    expect(e.ultimoResultado).toEqual({ resultado: 'vitoria', bioma: 'floresta' })
    expect(dadosParaSalvar(e).partidaEmAndamento).toBeNull()
  })

  it('ao fim da partida, cada contrato temporário perde uma partida (RF52)', () => {
    const contratos = [
      { classe: 'arqueiro', partidasRestantes: 2, nivel: 5 },
      { classe: 'sacerdote', partidasRestantes: 1, nivel: 5 },
    ]
    const comContratos = { ...convidadoComMago(), progresso: { ...convidadoComMago().progresso, contratosTemporarios: contratos } }
    const e = fazer(comContratos, ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', resultado: 'vitoria' })
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

  it('Derrota passa pela cutscene', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'encerrarPartida', resultado: 'derrota' })
    expect(e.tela).toBe('cutsceneDerrota')
  })

  it('Voltar ao Reino pela pausa: 15 s de contagem e depois Vitória (RF45)', () => {
    let e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'esc' }, { tipo: 'iniciarRetorno' })
    expect(e.segundosRetorno).toBe(15)
    for (let i = 0; i < 14; i++) e = fazer(e, { tipo: 'contarRetorno' })
    expect(e).toMatchObject({ tela: 'partida', segundosRetorno: 1 })
    e = fazer(e, { tipo: 'contarRetorno' })
    expect(e.tela).toBe('resumo')
    expect(e.ultimoResultado.resultado).toBe('vitoria')
  })

  it('cancelar o retorno para a contagem', () => {
    const e = fazer(convidadoComMago(), ...irAtePreparacao, comecar, { tipo: 'iniciarRetorno' }, { tipo: 'cancelarRetorno' })
    expect(e.segundosRetorno).toBeNull()
  })

  it('partida sem "Começar" (painel de dev) não conta', () => {
    const e = fazer(convidadoComMago(), { tipo: 'irPara', destino: 'partida' }, { tipo: 'encerrarPartida', resultado: 'vitoria' })
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
    expect(e.preferencias).toEqual({ musica: false, som: true, tema: 'escuro' })
  })

  it('avisos têm ids diferentes', () => {
    const e = fazer(inicio(), { tipo: 'mostrarAviso', texto: 'a' }, { tipo: 'mostrarAviso', texto: 'b' })
    expect(new Set(e.avisos.map((a) => a.id)).size).toBe(2)
  })

  it('ação desconhecida dá erro claro', () => {
    expect(() => atualizarEstado(inicio(), { tipo: 'voar' })).toThrow('voar')
  })
})
