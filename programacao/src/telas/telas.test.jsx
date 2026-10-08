import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Avisos from '../componentes/Avisos.jsx'
import PainelDev from '../componentes/PainelDev.jsx'
import { ContextoJogo } from '../estado/contexto.js'
import { criarEstadoInicial } from '../estado/estadoDoJogo.js'
import { preferenciasPadrao } from '../estado/preferencias.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { componentesDasJanelas } from '../janelas/index.js'
import { componentesDasTelas } from './index.js'
import HudDaPartida, { AvisosDaPartida } from './partida/HudDaPartida.jsx'
import Resumo from './partida/Resumo.jsx'

// Desenha cada tela com todas as janelas, os avisos e o painel, para cada tipo de jogador.
// Pega telas que quebram ao aparecer e confere o que cada uma precisa mostrar.

const acoes = new Proxy({}, { get: () => () => {} })
const progresso = {
  ...progressoInicial(),
  personagens: [novoPersonagem('mago'), novoPersonagem('tanque')],
  lider: 'tanque',
  ouro: 120,
  regioesDescobertas: { floresta: ['facil'] },
  estatisticas: { partidasJogadas: 4, monstrosDerrotados: 0 },
}

function desenhar(tela, tipoJogador, problema = null) {
  const salvador = {
    inscrever: () => () => {},
    obterInfo: () => ({ versao: 7, salvoEm: '2026-10-05T12:00:00.000Z', problema }),
  }
  const estado = {
    ...criarEstadoInicial(preferenciasPadrao),
    tela,
    tipoJogador,
    perfilLocal: tipoJogador === 'convidado' ? 'convidado' : null,
    progresso,
    escolhasDaPartida: { bioma: 'floresta', pontoPartida: 'inicio' },
    partidaAtual: tela === 'partida' ? { bioma: 'floresta', pontoPartida: 'inicio', lider: 'tanque', iniciadaEm: 'x' } : null,
    ultimoResultado: { resultado: 'retornoForcado', bioma: 'floresta' },
    janelas: Object.keys(componentesDasJanelas),
    avisos: [{ id: 1, texto: 'Aviso de teste' }],
  }
  const TelaAtual = componentesDasTelas[tela]
  return renderToString(
    <ContextoJogo value={{ estado, acoes, salvador }}>
      <TelaAtual />
      {estado.janelas.map((id) => {
        const Janela = componentesDasJanelas[id]
        return <Janela key={id} />
      })}
      <Avisos />
      <PainelDev />
    </ContextoJogo>,
  )
}

const telas = Object.keys(componentesDasTelas)
const tipos = ['nenhum', 'convidado', 'conta']

describe('todas as telas aparecem sem erro', () => {
  for (const tipo of tipos) {
    it.each(telas)(`%s (jogador: ${tipo})`, (tela) => {
      const html = desenhar(tela, tipo)
      expect(html).toContain('Aviso de teste')
      expect(html).toContain('Partidas jogadas: <!-- -->4')
      expect(html).toContain(tipo === 'convidado' ? 'versão 7' : 'nada é salvo')
    })
  }
})

describe('o que cada tela mostra', () => {
  it('Reino: HUD com o Líder e o ouro do progresso', () => {
    const html = desenhar('reino', 'convidado')
    expect(html).toContain('Líder: <!-- -->Tanque')
    expect(html).toContain('Ouro: <!-- -->120')
  })

  it('Login: aviso ao convidado (HU01)', () => {
    expect(desenhar('login', 'nenhum')).toContain('fica só neste navegador e você não aparece no ranking')
  })

  it('Ponto de partida: Fácil liberada (descoberta), Média não', () => {
    const html = desenhar('pontoPartida', 'convidado')
    expect(html).toContain('>Fácil</button>')
    expect(html).toContain('Média (não descoberta)')
  })

  it('Preparação: o Líder salvo vem selecionado', () => {
    const html = desenhar('preparacao', 'convidado')
    expect(html).toContain('aria-pressed="true">Tanque')
    expect(html).toContain('aria-pressed="false">Mago')
  })

  it('Resumo: Retorno forçado em amarelo, com o bioma', () => {
    const html = desenhar('resumo', 'convidado')
    expect(html).toContain('resultado-amarelo')
    expect(html).toContain('Floresta')
    expect(html).toContain('Fuga com a Pedra de Retorno') // sem motivo vindo da partida, o padrão
  })

  it('Partida: Configurações sem opções de conta e sem Salão da Glória', () => {
    const html = desenhar('partida', 'convidado')
    expect(html).toContain('opções de conta não aparecem')
    expect(html).not.toContain('>Sair do jogo</button>')
    expect(html).not.toContain('>Salão da Glória</button>')
  })

  it('Partida: a arena ocupa a caixa (sem título), com HUD e a barra de teste por cima', () => {
    const html = desenhar('partida', 'convidado')
    expect(html).toContain('class="arena"')
    expect(html).not.toContain('<h1')
    expect(html).toContain('Carregando a arena')
    expect(html).toContain('TESTE')
    const botoes = [
      'Grande Vitória',
      'Derrota',
      'Encher grupo',
      'Juntar todos',
      'Criar mob vermelho',
      'Criar atirador',
      'Recarregar habilidades',
      'Derrubar aliado',
      'Derrubar Líder',
      'Guerreiro',
      'Arqueiro',
    ]
    for (const botao of botoes) {
      expect(html).toContain(`>${botao}</button>`)
    }
    expect(html).toContain('>Testar foco</button>')
    expect(html).toContain('Q volta ao Reino · F foge · M muta')
  })

  it('aviso da fuga: custo, F de novo para confirmar e Esc para cancelar (RF46)', () => {
    const html = desenhar('partida', 'convidado')
    expect(html).toContain('Fugir com a Pedra de Retorno?')
    expect(html).toContain('janela-fundo-leve') // não escurece nem pausa
    expect(html).toContain('>Fugir (F)</button>')
  })

  it('Configurações: convidado pode criar conta e sair; conta só sai', () => {
    const convidado = desenhar('reino', 'convidado')
    expect(convidado).toContain('>Criar conta</button>')
    expect(convidado).toContain('>Sair do jogo</button>')
    const conta = desenhar('reino', 'conta')
    expect(conta).toContain('>Sair da conta</button>')
    expect(conta).not.toContain('>Criar conta</button>')
  })

  it('Painel de desenvolvimento: tem o símbolo de dev e o botão de minimizar', () => {
    const html = desenhar('reino', 'convidado')
    expect(html).toContain('&lt;/&gt;')
    expect(html).toContain('aria-label="Minimizar o painel"')
  })

  it('problema no salvamento aparece como aviso', () => {
    expect(desenhar('reino', 'convidado', 'conflito')).toContain('salvo por outra aba')
  })
})

// Situação como o Phaser manda (CenaArena.avisarSituacao), para o HUD completo (TASK-049)
const situacao = {
  classe: 'mago',
  vida: 40,
  vidaMaxima: 80,
  mana: 50,
  manaMaxima: 110,
  caido: true,
  segundosParaLevantar: 21,
  recargaDoAtaque: 1,
  recargaDaEsquiva: 0.5,
  habilidades: [{ nome: 'Meteoro', custo: 35, recarga: 1, semMana: false }, null, null],
  aliados: [{ classe: 'tanque', vida: 90, vidaMaxima: 180, caido: false, fragil: true, ia: 'media' }],
  perdidos: ['arqueiro'],
  emFoco: true,
  tempo: 135,
  pontuacao: 340,
  ouroGanho: 85,
  custoDaFuga: { taxa: 12, ouro: 10 },
  emCombate: true,
  retorno: { segundos: 15, interrompido: true },
  fuga: { segundos: 3 },
}

describe('HUD completo da partida (TASK-049)', () => {
  it('tempo, pontos, ouro, custo da fuga, em combate, foco, mudo e o lugar do minimapa', () => {
    const html = renderToString(<HudDaPartida situacao={situacao} mudo />).replace(/<!-- -->/g, '')
    for (const texto of ['Tempo', '02:15', 'Pontos', '340', 'Ouro', '85', 'Fuga (F): ', '12%', '10 de ouro', 'Em combate', 'Foco!', 'Mudo (M)', 'Minimapa', 'Região: —']) {
      expect(html).toContain(texto)
    }
    expect(html).toContain('IA média')
    expect(html).toContain('Arqueiro: perdido')
    expect(renderToString(<HudDaPartida situacao={{ ...situacao, emCombate: false }} />)).toContain('Fora de combate')
  })

  it('abaixo do HUD: contagens do Q e da fuga, Líder caído e as mensagens', () => {
    const mensagens = [{ id: 1, texto: 'Crítico! 45 de dano', tipo: 'critico' }]
    const html = renderToString(<AvisosDaPartida situacao={situacao} mensagens={mensagens} />).replace(/<!-- -->/g, '')
    expect(html).toContain('Fugindo com a Pedra de Retorno em 3 s')
    expect(html).toContain('Em combate: o retorno espera (15 s)')
    expect(html).toContain('O Líder desmaiou: 21 s para ser levantado')
    expect(html).toContain('Crítico! 45 de dano')
  })
})

describe('Resumo cheio de números (RF51, TASK-048)', () => {
  it('ouro, taxa, recebido, pontuação, monstros, tempos, perdidos e o XP de cada um', () => {
    const ultimoResultado = {
      resultado: 'vitoria',
      motivo: 'Retorno normal ao Reino',
      bioma: 'floresta',
      ouroGanho: 200,
      taxa: 4,
      taxaEmOuro: 8,
      ouroRecebido: 192,
      pontuacaoBase: 400,
      pontuacaoFinal: 384,
      monstros: 7,
      itens: [],
      segundosTotais: 245,
      segundosAtivos: 61,
      perdidos: ['tanque'],
      personagens: [
        { classe: 'mago', xp: 120, nivelAntes: 1, nivel: 2, niveisGanhos: 1 },
        { classe: 'guerreiro', xp: 40, nivelAntes: 3, nivel: 3, niveisGanhos: 0 },
      ],
    }
    const estado = { ...criarEstadoInicial(preferenciasPadrao), tela: 'resumo', ultimoResultado }
    const html = renderToString(
      <ContextoJogo value={{ estado, acoes, salvador: { inscrever: () => () => {}, obterInfo: () => ({}) } }}>
        <Resumo />
      </ContextoJogo>,
    ).replace(/<!-- -->/g, '')
    for (const texto of ['Vitória', 'Retorno normal ao Reino', '200', '4% (−8 de ouro)', '192', '384 (base 400)', '7', '04:05', '01:01', 'Tanque']) {
      expect(html).toContain(texto)
    }
    expect(html).toContain('Mago: +120 · subiu para o nível 2!')
    expect(html).toContain('Guerreiro: +40 · nível 3')
    expect(html).toContain('>Jogar novamente</button>')
  })
})
