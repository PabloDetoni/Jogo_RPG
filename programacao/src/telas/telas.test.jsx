import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
import MochilaNaPartida from './partida/MochilaNaPartida.jsx'
import Pentagono from '../componentes/Pentagono.jsx'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { descreverMissao } from '../dados/missoes.js'
import { ContratosPermanentes, ContratosTemporarios } from './reino/Contratos.jsx'

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

function desenhar(tela, tipoJogador, problema = null, { contas = { disponivel: true, guardada: null }, mudancas = {} } = {}) {
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
    conta: tipoJogador === 'conta' ? { id: 'u1', email: 'a@b.com', apelido: 'Pablo' } : null,
    ...mudancas,
  }
  const TelaAtual = componentesDasTelas[tela]
  return renderToString(
    <ContextoJogo value={{ estado, acoes, salvador, contas }}>
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

  it('Configurações: convidado pode criar conta e sair; conta mostra o apelido e só sai', () => {
    const convidado = desenhar('reino', 'convidado')
    expect(convidado).toContain('>Criar conta</button>')
    expect(convidado).toContain('>Sair do jogo</button>')
    const conta = desenhar('reino', 'conta').replace(/<!-- -->/g, '')
    expect(conta).toContain('>Sair da conta</button>')
    expect(conta).not.toContain('>Criar conta</button>')
    expect(conta).toContain('Conta: <strong>Pablo</strong> (a@b.com)')
    expect(conta).toContain('Pablo · Líder: Tanque') // HUD do Reino com o apelido
  })

  it('Configurações da conta sem internet: avisa que o progresso espera neste navegador (RNF09)', () => {
    const nuvem = { situacao: 'pendente', mensagem: 'Sem conexão com a nuvem agora: seu progresso está guardado neste navegador.' }
    expect(desenhar('reino', 'conta', null, { mudancas: { nuvem } })).toContain('Sem conexão com a nuvem agora')
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

describe('telas de acesso com contas (Fase 2)', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('Login: "Continuar como" aparece quando o navegador lembra a conta; a mensagem do acesso aparece em cima', () => {
    const html = desenhar('login', 'nenhum', null, {
      contas: { disponivel: true, guardada: { id: 'u1', email: 'a@b.com' } },
      mudancas: { mensagemDoAcesso: { texto: 'E-mail confirmado! Agora é só entrar na conta.', tipo: 'bom' } },
    }).replace(/<!-- -->/g, '')
    expect(html).toContain('>Continuar como a@b.com</button>')
    expect(html).toContain('E-mail confirmado!')
    expect(html).toContain('mensagem-do-acesso-bom')
  })

  it('Login sem o Supabase (sem .env.local ou fora do ar): avisa e o convidado continua disponível', () => {
    const html = desenhar('login', 'nenhum', null, { contas: { disponivel: false, guardada: null } })
    expect(html).toContain('As contas estão indisponíveis agora')
    expect(html).toContain('>Jogar como convidado</button>')
  })

  it('Criar conta pelo convidado avisa que o progresso vai junto (RF03); Senha nova e Apelido têm os campos', () => {
    expect(desenhar('criarConta', 'convidado')).toContain('o progresso de convidado deste navegador passa para a conta')
    expect(desenhar('criarConta', 'nenhum')).not.toContain('passa para a conta')
    expect(desenhar('novaSenha', 'nenhum')).toContain('Repita a senha nova')
    expect(desenhar('escolherApelido', 'nenhum')).toContain('>Confirmar apelido</button>')
  })

  it('Salão da Glória: as 6 abas do ranking para todos (até sem login); Minhas partidas só com conta (RF15, RF16)', () => {
    const semLogin = desenhar('salaoGloria', 'nenhum')
    for (const aba of ['Melhores pontuações', 'Nível total', 'Por classe', 'Ouro', 'Monstros', 'Maior duração']) {
      expect(semLogin).toContain(`>${aba}</button>`)
    }
    expect(semLogin).toContain('Carregando o ranking...')
    expect(semLogin).toContain('Só jogadores com conta aparecem no ranking.')
    expect(semLogin).not.toContain('>Minhas partidas</button>')
    expect(semLogin).not.toContain('>Conquistas</button>')
    const conta = desenhar('salaoGloria', 'conta')
    expect(conta).toContain('>Minhas partidas</button>')
    expect(conta).toContain('>Conquistas</button>')
    expect(conta).not.toContain('Só jogadores com conta aparecem')
  })

  it('jogo publicado (fora do npm run dev): a faixa de baixo da partida mostra só as teclas, sem botões de teste', () => {
    vi.stubEnv('DEV', false)
    const html = desenhar('partida', 'convidado')
    expect(html).toContain('Q volta ao Reino · F foge · M muta')
    expect(html).not.toContain('TESTE')
    expect(html).not.toContain('>Grande Vitória</button>')
    expect(html).not.toContain('Invencível')
  })
})

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

describe('Guilda: contratos (TASK-079) e Preparação', () => {
  const comContrato = {
    ...progresso,
    contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }],
  }
  const desenharCom = (componente, tela = 'guilda') => {
    const estado = { ...criarEstadoInicial(preferenciasPadrao), tela, tipoJogador: 'convidado', progresso: comContrato }
    const salvador = { inscrever: () => () => {}, obterInfo: () => ({}) }
    return renderToString(<ContextoJogo value={{ estado, acoes, salvador }}>{componente}</ContextoJogo>).replace(/<!-- -->/g, '')
  }

  it('temporário: só as classes que o jogador não tem e sem contrato ativo, com o preço; e os contratos ativos', () => {
    const html = desenharCom(<ContratosTemporarios />)
    // o save tem Mago e Tanque permanentes e o Arqueiro temporário: sobram Guerreiro e Sacerdote
    // cada classe vem com o equipamento fixo do temporário (RF29, Fase 4)
    expect(html).toContain('<span>Guerreiro<span class="nota"> (vai com 1 Espada curta e 1 Colete de couro)</span></span>')
    expect(html).toContain('<span>Sacerdote<span class="nota">')
    expect(html).not.toContain('<span>Mago<span')
    expect(html).toContain('com equipamento fixo')
    expect(html).toContain('Contratar (200 de ouro)')
    expect(html).toContain('Arqueiro (nível 5)')
    expect(html).toContain('2 partidas restantes')
    expect(html).toContain('Ouro: <strong>120</strong>')
  })

  it('permanente: o Arqueiro aparece avisando que encerra o temporário', () => {
    const html = desenharCom(<ContratosPermanentes />)
    expect(html).toContain('Contratar (1000 de ouro)')
    expect(html).toContain('(encerra o contrato temporário)')
    expect(html).not.toContain('<span>Tanque')
  })

  it('Preparação: o temporário vai junto, mas não aparece como opção de Líder (critério do card)', () => {
    const Preparacao = componentesDasTelas.preparacao
    const html = desenharCom(<Preparacao />, 'preparacao')
    expect(html).toContain('Também vão: Arqueiro (temporário, 2 partidas)')
    expect(html).not.toContain('>Arqueiro</button>')
    expect(html).toContain('>Tanque</button>')
  })
})

describe('Pentágono, Seleção de classe e HUD do Reino (TASK-071)', () => {
  const forma = (html) => html.match(/data-forma="([^"]+)"/)[1]

  it('o pentágono muda de forma do Tanque para o Arqueiro (critério do card)', () => {
    const tanque = renderToString(<Pentagono valores={atributosIniciaisDaClasse('tanque')} maximo={25} />)
    const arqueiro = renderToString(<Pentagono valores={atributosIniciaisDaClasse('arqueiro')} maximo={25} />)
    expect(forma(tanque)).not.toBe(forma(arqueiro))
    expect(tanque).toContain('Vitalidade 18')
    expect(arqueiro).toContain('Agilidade 22')
  })

  it('valor no máximo chega na ponta; zero fica no centro', () => {
    const cheio = forma(renderToString(<Pentagono valores={{ vitalidade: 10 }} maximo={10} />))
    const [x, y] = cheio.split(' ')[0].split(',').map(Number)
    expect(x).toBeCloseTo(120)
    expect(y).toBeCloseTo(48) // centro 120, raio 72: a ponta de cima
    expect(cheio.split(' ')[1]).toBe('120.0,120.0') // Força 0: no centro
  })

  it('Seleção de classe: descrição, papel e pentágono da classe vista, e o botão de escolher', () => {
    const html = desenhar('selecaoClasse', 'convidado').replace(/<!-- -->/g, '')
    expect(html).toContain('DPS principal')
    expect(html).toContain('Equilibrado, rápido e constante')
    expect(html).toContain('class="pentagono"')
    expect(html).toContain('>Escolher Guerreiro</button>')
  })

  it('HUD do Reino: a missão ativa com o progresso', () => {
    expect(descreverMissao({ tipo: 'matar', alvo: 'lobo', quantidade: 10, progresso: 4 })).toBe('Derrotar 10 lobo (4/10)')
    expect(descreverMissao({ tipo: 'explorar', alvo: 'lago', quantidade: 1, progresso: 1 })).toBe('Explorar lago (feito)')
    expect(descreverMissao(null)).toBeNull()
    expect(desenhar('reino', 'convidado').replace(/<!-- -->/g, '')).toContain('Missão: nenhuma')
  })

  it('Árvores: a ficha do personagem com o pentágono, o nível e o XP', () => {
    const html = desenhar('arvores', 'convidado').replace(/<!-- -->/g, '')
    expect(html).toContain('class="pentagono"')
    expect(html).toContain('XP 0 / 100')
    expect(html).toContain('Pontos livres: 0 de atributo e 0 de habilidade')
  })
})

describe('Floresta no HUD e no Resumo (Fase 3)', () => {
  const daFloresta = {
    ...situacao,
    caido: false,
    regiao: { nome: 'Domínio do Boss', dificuldade: 'boss', dominioDeBoss: true },
    mochila: { peso: 20, capacidade: 20 },
    itemPerto: { nome: 'Pele de lobo', quantidade: 2, cabe: false },
    boss: { nome: 'Guardião da Floresta', vida: 1200, vidaMaxima: 2400 },
  }

  it('HUD: região em destaque no domínio do Boss e a mochila cheia', () => {
    const html = renderToString(<HudDaPartida situacao={daFloresta} />).replace(/<!-- -->/g, '')
    expect(html).toMatch(/hud-regiao hud-regiao-boss" title="Região: Domínio do Boss">Domínio do Boss</)
    expect(html).toContain('Mochila 20/20')
    expect(html).toContain('hud-mochila-cheia')
  })

  it('avisos: a barra grande do Boss e o "não cabe" da mochila', () => {
    const html = renderToString(<AvisosDaPartida situacao={daFloresta} mensagens={[]} />).replace(/<!-- -->/g, '')
    expect(html).toContain('Guardião da Floresta')
    expect(html).toContain('width:50%')
    expect(html).toContain('Mochila cheia: não cabe Pele de lobo')
    const cabe = renderToString(<AvisosDaPartida situacao={{ ...daFloresta, itemPerto: { nome: 'Cogumelo', quantidade: 1, cabe: true } }} mensagens={[]} />)
    expect(cabe).toContain('E: pegar Cogumelo')
  })

  it('Resumo: os itens com nome, a exploração e o Boss', () => {
    const ultimoResultado = {
      resultado: 'vitoria',
      bioma: 'floresta',
      itens: [{ id: 'peleDeLobo', quantidade: 2 }, { id: 'cogumelo', quantidade: 1 }],
      areasNovas: ['clareiraDasFlores', 'bosqueDosLobos'],
      xpDeExploracao: 60,
      bonusDeBoss: 500,
      personagens: [],
      perdidos: [],
    }
    const estado = { ...criarEstadoInicial(preferenciasPadrao), tela: 'resumo', ultimoResultado }
    const html = renderToString(
      <ContextoJogo value={{ estado, acoes, salvador: { inscrever: () => () => {}, obterInfo: () => ({}) } }}>
        <Resumo />
      </ContextoJogo>,
    ).replace(/<!-- -->/g, '')
    expect(html).toContain('Pele de lobo ×2, Cogumelo ×1')
    expect(html).toContain('2 áreas novas (+60 XP)')
    expect(html).toContain('derrotado (+500 pontos)')
  })
})

describe('Mochila do Reino (Fase 4, TASK-072)', () => {
  const comMochila = (mochila) => desenhar('mochila', 'convidado', null, { mudancas: { progresso: { ...progresso, mochila } } }).replace(/<!-- -->/g, '')

  it('lista os itens com a quantidade e mostra função, descrição e peso do primeiro (consumíveis primeiro)', () => {
    const html = comMochila([
      { id: 'peleDeLobo', quantidade: 5 },
      { id: 'pocaoDeVida', quantidade: 3 },
    ])
    expect(html).toContain('Pele de lobo')
    expect(html).toContain('×5')
    expect(html.indexOf('Poção de vida')).toBeLessThan(html.indexOf('Pele de lobo'))
    expect(html).toContain('Recupera 40% da vida')
    expect(html).toContain('Peso 1')
    expect(html).toContain('Descartar 1')
    expect(html).toContain('Descartar todos (3)')
    expect(html).toContain('peso total 13')
  })

  it('vazia, explica de onde vêm os itens; item fora do catálogo aparece pelo id', () => {
    expect(comMochila([])).toContain('A Mochila está vazia')
    expect(comMochila([{ id: 'itemVelho', quantidade: 1 }])).toContain('não existe mais no catálogo')
  })
})

describe('Preparação: mochila da partida (Fase 4, TASK-073)', () => {
  it('mostra o peso, a capacidade e as poções da Mochila com − e +; o que não é usável não aparece', () => {
    const html = desenhar('preparacao', 'convidado', null, {
      mudancas: {
        progresso: { ...progresso, mochila: [{ id: 'pocaoDeVida', quantidade: 3 }, { id: 'peleDeLobo', quantidade: 2 }] },
        escolhasDaPartida: { bioma: 'floresta', pontoPartida: 'inicio', levar: { pocaoDeVida: 2 } },
      },
    }).replace(/<!-- -->/g, '')
    expect(html).toContain('Mochila da partida')
    expect(html).toMatch(/Peso <strong>2<\/strong> de <strong>\d+<\/strong>/)
    expect(html).toContain('Poção de vida')
    expect(html).toContain('(tem 3, peso 1)')
    expect(html).toContain('aria-label="Levando 2"')
    expect(html).not.toContain('Pele de lobo')
  })

  it('sem poções, explica onde comprar', () => {
    expect(desenhar('preparacao', 'convidado')).toContain('Dá para comprar no Mercado')
  })
})

describe('mochila da partida com Tab (Fase 4, TASK-047)', () => {
  const mochila = { peso: 4, capacidade: 20, itens: [{ id: 'peleDeLobo', quantidade: 2 }, { id: 'pocaoDeVida', quantidade: 1 }] }
  const desenharMochila = (escolhido) =>
    renderToString(<MochilaNaPartida mochila={mochila} escolhido={escolhido} aoEscolher={() => {}} aoUsar={() => {}} />).replace(/<!-- -->/g, '')

  it('poções primeiro, o escolhido marcado com a função, e os botões de E e R', () => {
    const html = desenharMochila('pocaoDeVida')
    expect(html).toContain('Peso 4 de 20')
    expect(html.indexOf('Poção de vida')).toBeLessThan(html.indexOf('Pele de lobo'))
    expect(html).toContain('Recupera 40% da vida')
    expect(html).toContain('Usar no Líder (E)')
    expect(html).toContain('Usar no aliado (R)')
    expect(html).toContain('janela-fundo-ao-lado')
  })

  it('sem item escolhido (o escolhido acabou), pede para escolher e não deixa usar', () => {
    const html = desenharMochila(null)
    expect(html).toContain('Escolha um item')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Usar no Líder/)
  })

  it('vazia, explica como pegar itens do chão', () => {
    const html = renderToString(<MochilaNaPartida mochila={{ peso: 0, capacidade: 20, itens: [] }} escolhido={null} aoEscolher={() => {}} aoUsar={() => {}} />)
    expect(html).toContain('Vazia')
  })
})

describe('Mercado (Fase 4, TASK-074)', () => {
  it('a aba Comprar mostra o ouro, as ofertas com preço (rotativas com ★) e quando elas mudam', () => {
    const html = desenhar('mercado', 'convidado').replace(/<!-- -->/g, '')
    expect(html).toContain('Ouro: <strong>120</strong>')
    expect(html).toContain('Poção de vida')
    expect(html).toContain('25 de ouro')
    expect(html).toContain('★')
    expect(html).toMatch(/mudam em \d+ partidas?/)
    expect(html).toContain('Comprar 1 (25)')
  })
})

describe('Forja (Fase 4, TASK-075)', () => {
  it('a aba Equipar mostra o personagem, os 7 espaços, os atributos com o bônus e o que serve na Mochila', () => {
    const mago = { ...progresso.personagens[0], equipamento: { arma: 'cajadoDeCarvalho' } }
    const html = desenhar('forja', 'convidado', null, {
      mudancas: { progresso: { ...progresso, personagens: [mago, progresso.personagens[1]], mochila: [{ id: 'espadaCurta', quantidade: 1 }] } },
    }).replace(/<!-- -->/g, '')
    expect(html).toContain('Mago')
    for (const espaco of ['Capacete', 'Peitoral', 'Calças', 'Botas', 'Manoplas', 'Arma', 'Escudo']) expect(html).toContain(espaco)
    expect(html).toContain('Cajado de carvalho')
    expect(html).toContain('(+3)')
  })

})
