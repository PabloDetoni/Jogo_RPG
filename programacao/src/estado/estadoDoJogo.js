import { resultados } from '../dados/resultados.js'
import { segundosRetornoNormal } from '../dados/regras.js'
import { gastarPartidaDosContratos } from '../regras/guilda.js'
import { navegar } from './navegacao.js'
import { novoPersonagem, progressoInicial } from './progresso.js'

// Estado global do jogo. Só "progresso" vai para o salvamento do convidado;
// as preferências são salvas à parte (salvamento/preferenciasLocais.js); o resto vive só na memória.
export function criarEstadoInicial(preferencias) {
  return {
    // Telas e janelas
    tela: 'telaInicial',
    anteriores: [], // caminho de telas até aqui, usado pelo Voltar
    janelas: [], // janelas abertas por cima da tela; a última fica no topo
    avisos: [], // mensagens para o jogador: { id, texto }
    proximoIdDeAviso: 1,

    // Quem está jogando. Toda visita começa na Tela inicial (diagrama de Acesso).
    tipoJogador: 'nenhum', // 'nenhum', 'convidado' ou 'conta'
    perfilLocal: null, // 'convidado' quando o progresso é salvo neste navegador; null = nada é salvo

    // O que fica salvo
    progresso: progressoInicial(),

    // Partida
    escolhasDaPartida: { bioma: null, pontoPartida: null },
    partidaAtual: null, // { bioma, pontoPartida, lider, iniciadaEm }, de "Começar partida" até o resultado
    segundosRetorno: null, // contagem do retorno ao Reino; null = parada
    ultimoResultado: null, // { resultado, bioma }, mostrado no Resumo

    preferencias,

    // Sobe a cada momento de salvamento (RF09); o ProvedorDoJogo grava quando muda
    pedidosDeSalvamento: 0,
  }
}

// Usado pelo painel de desenvolvimento para alternar o tipo de jogador.
export const proximoTipoJogador = { nenhum: 'convidado', convidado: 'conta', conta: 'convidado' }

// O que vai para o navegador num salvamento.
// Da partida em andamento vai só a descrição: os ganhos dela nunca são salvos antes do fim (RF12).
export function dadosParaSalvar(estado) {
  const { partidaAtual } = estado
  return {
    perfil: estado.perfilLocal,
    progresso: estado.progresso,
    partidaEmAndamento: partidaAtual && {
      bioma: partidaAtual.bioma,
      pontoPartida: partidaAtual.pontoPartida,
      lider: partidaAtual.lider,
      iniciadaEm: partidaAtual.iniciadaEm,
    },
  }
}

const avisoPartidaDescartada =
  'A última partida não terminou (a página fechou no meio) e foi descartada. Nada foi ganho nem perdido.'
const avisoSalvamentoEstragado =
  'Não deu para ler o progresso salvo neste navegador, então o jogo começou do zero. Uma cópia do que estava salvo foi guardada à parte.'
const avisoVersaoMaisNova =
  'Este progresso foi salvo por uma versão mais nova do jogo. Para não estragá-lo, nada será salvo nesta aba.'

function comAviso(estado, texto) {
  return {
    ...estado,
    avisos: [...estado.avisos, { id: estado.proximoIdDeAviso, texto }],
    proximoIdDeAviso: estado.proximoIdDeAviso + 1,
  }
}

function pedirSalvamento(estado) {
  return { ...estado, pedidosDeSalvamento: estado.pedidosDeSalvamento + 1 }
}

// Sem personagem é o primeiro acesso: narrativa e escolha da classe (RF07).
function destinoAoEntrar(estado) {
  return estado.progresso.personagens.length > 0 ? 'reino' : 'narrativaInicial'
}

function comProgresso(estado, mudancas) {
  return { ...estado, progresso: { ...estado.progresso, ...mudancas } }
}

// detalhes (vindos da partida, opcionais): motivo (ex.: "Líder não levantado em 30 s"), houveDesmaio e
// perdidos ({ classe, x, y }). Ficam no ultimoResultado para o Resumo; a TASK-048 usa os dois últimos
// para o resultado e a taxa.
function encerrarPartida(estado, resultado, detalhes = {}) {
  const { partidaAtual, progresso } = estado
  const extras = Object.fromEntries(
    ['motivo', 'houveDesmaio', 'perdidos'].filter((chave) => detalhes[chave] !== undefined).map((chave) => [chave, detalhes[chave]]),
  )
  let novo = { ...estado, segundosRetorno: null, ultimoResultado: { resultado, bioma: partidaAtual?.bioma ?? null, ...extras } }

  // Os ganhos (ouro com taxa, XP, itens) entram aqui na etapa 5.
  // Toda partida conta, até entrar e sair logo em seguida (RF34), e cada contrato temporário
  // perde uma partida (RF52). Partida interrompida não passa por aqui (RF12).
  if (partidaAtual) {
    const { estatisticas } = progresso
    novo = comProgresso(novo, {
      estatisticas: { ...estatisticas, partidasJogadas: estatisticas.partidasJogadas + 1 },
      contratosTemporarios: gastarPartidaDosContratos(progresso.contratosTemporarios),
    })
  }

  const destino = resultados[resultado].cutscene ? 'cutsceneDerrota' : 'resumo'
  return navegar(pedirSalvamento({ ...novo, partidaAtual: null }), destino)
}

export function atualizarEstado(estado, acao) {
  switch (acao.tipo) {
    case 'irPara':
      return navegar(estado, acao.destino)

    case 'voltar':
      if (estado.anteriores.length === 0) return estado
      return navegar(estado, estado.anteriores.at(-1))

    case 'abrirJanela':
      if (estado.janelas.at(-1) === acao.janela) return estado
      return { ...estado, janelas: [...estado.janelas, acao.janela] }

    case 'fecharJanela':
      return { ...estado, janelas: estado.janelas.slice(0, -1) }

    // Esc fecha a janela de cima; na Partida, sem janela aberta, pausa (RF35).
    case 'esc':
      if (estado.janelas.length > 0) return { ...estado, janelas: estado.janelas.slice(0, -1) }
      if (estado.tela === 'partida') return { ...estado, janelas: ['pausa'] }
      return estado

    case 'mostrarAviso':
      return comAviso(estado, acao.texto)

    case 'fecharAviso':
      return { ...estado, avisos: estado.avisos.filter((aviso) => aviso.id !== acao.id) }

    // "Jogar como convidado": o progresso vem do navegador (o ProvedorDoJogo carrega e manda aqui).
    case 'entrarComoConvidado': {
      const { carregamento } = acao
      let novo = {
        ...estado,
        tipoJogador: 'convidado',
        perfilLocal: carregamento.situacao === 'formatoNovo' ? null : 'convidado',
        progresso: carregamento.progresso,
        partidaAtual: null,
      }
      if (carregamento.partidaDescartada) novo = pedirSalvamento(comAviso(novo, avisoPartidaDescartada))
      if (carregamento.situacao === 'corrompido') novo = comAviso(novo, avisoSalvamentoEstragado)
      if (carregamento.situacao === 'formatoNovo') novo = comAviso(novo, avisoVersaoMaisNova)
      return navegar(novo, destinoAoEntrar(novo))
    }

    // Login → Entrar: conta que já existia. Não mistura o progresso do convidado (RF03).
    // Até a etapa 8 a conta é de teste: começa vazia e nada dela é salvo.
    case 'entrarNaConta': {
      const novo = { ...estado, tipoJogador: 'conta', perfilLocal: null, progresso: progressoInicial() }
      return navegar(novo, destinoAoEntrar(novo))
    }

    // "Já confirmei": primeiro login da conta criada. Se ela foi criada a partir do
    // convidado, o progresso dele vai junto (RF03); senão, a conta começa vazia.
    case 'confirmarConta': {
      const veioDoConvidado = estado.perfilLocal === 'convidado'
      const novo = {
        ...estado,
        tipoJogador: 'conta',
        perfilLocal: null,
        progresso: veioDoConvidado ? estado.progresso : progressoInicial(),
      }
      return navegar(novo, destinoAoEntrar(novo))
    }

    // Só para o painel de desenvolvimento: muda o que as telas mostram, não o que é salvo
    case 'trocarTipoJogador':
      return { ...estado, tipoJogador: proximoTipoJogador[estado.tipoJogador] }

    // A classe inicial é permanente e vira o primeiro Líder (RF07). A escolha não se repete.
    case 'escolherClasseInicial':
      if (estado.progresso.personagens.length > 0) return navegar(estado, 'reino')
      return navegar(
        pedirSalvamento(comProgresso(estado, { personagens: [novoPersonagem(acao.classe)], lider: acao.classe })),
        'reino',
      )

    case 'escolherBioma':
      return navegar(
        { ...estado, escolhasDaPartida: { ...estado.escolhasDaPartida, bioma: acao.bioma } },
        'pontoPartida',
      )

    case 'escolherPontoPartida':
      return navegar(
        { ...estado, escolhasDaPartida: { ...estado.escolhasDaPartida, pontoPartida: acao.pontoPartida } },
        'preparacao',
      )

    // O Líder é sempre um personagem permanente (RF33)
    case 'escolherLider':
      if (!estado.progresso.personagens.some((p) => p.classe === acao.classe)) return estado
      return comProgresso(estado, { lider: acao.classe })

    // "Começar partida" salva o progresso (RF34), já marcando a partida em andamento.
    case 'comecarPartida': {
      const { lider, personagens } = estado.progresso
      if (!personagens.some((p) => p.classe === lider)) return estado
      const partidaAtual = { ...estado.escolhasDaPartida, lider, iniciadaEm: acao.agora }
      return navegar(pedirSalvamento({ ...estado, partidaAtual, segundosRetorno: null }), 'partida')
    }

    // "Voltar ao Reino" da pausa: não tem atalho, passa pela contagem (RF45).
    case 'iniciarRetorno':
      return { ...estado, janelas: [], segundosRetorno: segundosRetornoNormal }

    case 'cancelarRetorno':
      return { ...estado, segundosRetorno: null }

    // Chamado a cada segundo pela tela da Partida.
    // No fim: retorno normal sem desmaio, mas pontuação 0 fica abaixo do mínimo, então é Vitória (RF47).
    case 'contarRetorno':
      if (estado.segundosRetorno === null) return estado
      if (estado.segundosRetorno > 1) return { ...estado, segundosRetorno: estado.segundosRetorno - 1 }
      return encerrarPartida(estado, 'vitoria')

    case 'encerrarPartida':
      return encerrarPartida(estado, acao.resultado, acao.detalhes)

    // Música e som ligam/desligam; o tema alterna entre claro e escuro.
    case 'alternarPreferencia': {
      const { preferencias } = estado
      const valor =
        acao.chave === 'tema'
          ? preferencias.tema === 'claro' ? 'escuro' : 'claro'
          : !preferencias[acao.chave]
      return { ...estado, preferencias: { ...preferencias, [acao.chave]: valor } }
    }

    default:
      throw new Error(`Ação desconhecida: ${acao.tipo}`)
  }
}
