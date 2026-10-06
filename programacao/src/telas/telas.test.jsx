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
    segundosRetorno: 7,
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
  })

  it('Partida: Configurações sem opções de conta e sem Salão da Glória', () => {
    const html = desenhar('partida', 'convidado')
    expect(html).toContain('opções de conta não aparecem')
    expect(html).not.toContain('>Sair do jogo</button>')
    expect(html).not.toContain('>Salão da Glória</button>')
  })

  it('Configurações: convidado pode criar conta e sair; conta só sai', () => {
    const convidado = desenhar('reino', 'convidado')
    expect(convidado).toContain('>Criar conta</button>')
    expect(convidado).toContain('>Sair do jogo</button>')
    const conta = desenhar('reino', 'conta')
    expect(conta).toContain('>Sair da conta</button>')
    expect(conta).not.toContain('>Criar conta</button>')
  })

  it('problema no salvamento aparece como aviso', () => {
    expect(desenhar('reino', 'convidado', 'conflito')).toContain('salvo por outra aba')
  })
})
