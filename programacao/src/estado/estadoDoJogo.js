import { distanciaAteABorda } from '../dados/balanceamento.js'
import { motivosDoFim, resultados } from '../dados/resultados.js'
import { montarFimDaPartida } from '../regras/fimDaPartida.js'
import { aplicarFimNoProgresso } from '../regras/ganhosDaPartida.js'
import { contratarPermanente, contratarTemporario } from '../regras/guilda.js'
import { comPedido, controleInicialDaPartida } from './controleDaPartida.js'
import { contratarTodasAsClasses, mudarNivel, quaseSubir } from './ferramentasDeDev.js'
import { navegar } from './navegacao.js'
import { novoPersonagem, progressoInicial } from './progresso.js'

// Estado global do jogo. Só "progresso" vai para o salvamento (do convidado ou da conta);
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
    // De quem é o save deste navegador: 'convidado', 'conta' (a cópia local da conta, Fase 2) ou null (nada é salvo)
    perfilLocal: null,
    conta: null, // a conta que entrou: { id, email, apelido } (Fase 2)
    mensagemDoAcesso: null, // { texto, tipo: 'bom' | 'erro' } para a tela de Login (e-mail confirmado, conta em uso...)

    // O que fica salvo
    progresso: progressoInicial(),

    // Partida
    escolhasDaPartida: { bioma: null, pontoPartida: null },
    partidaAtual: null, // { bioma, pontoPartida, lider, iniciadaEm }, de "Começar partida" até o resultado
    controleDaPartida: controleInicialDaPartida(),
    ultimoResultado: null, // contas do fim da partida, mostradas no Resumo (ver encerrarPartida)

    preferencias,

    // Sobe a cada momento de salvamento (RF09); o ProvedorDoJogo grava quando muda
    pedidosDeSalvamento: 0,
    // Conta (Fase 2): sobe nos momentos em que o save também vai para o Supabase (RF10): começar partida, fim da
    // partida e o primeiro personagem; Sair da conta envia por conta própria
    pedidosAoBanco: 0,
    partidasParaRegistrar: [], // partidas de conta terminadas e ainda não gravadas no banco (TASK-100)
    nuvem: null, // conta: { situacao: 'ok' | 'pendente', mensagem } (o último envio ao Supabase)
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

// Momento em que a conta envia o save ao Supabase (RF10). Convidado: nada vai para o banco (RF01).
function pedirEnvioAoBanco(estado) {
  return estado.perfilLocal === 'conta' ? { ...estado, pedidosAoBanco: estado.pedidosAoBanco + 1 } : estado
}

const avisoConvidadoParaConta = 'O progresso do convidado deste navegador agora é da sua conta e está salvo na nuvem.'

// Sem personagem é o primeiro acesso: narrativa e escolha da classe (RF07).
function destinoAoEntrar(estado) {
  return estado.progresso.personagens.length > 0 ? 'reino' : 'narrativaInicial'
}

function comProgresso(estado, mudancas) {
  return { ...estado, progresso: { ...estado.progresso, ...mudancas } }
}

// Fim da partida (TASK-048). "fim" vem da partida (CenaArena.terminar): como acabou, o resultado (só nos botões de
// teste), o motivo, os perdidos e os caídos com o lugar onde caíram, o Líder, o ponto inicial e a borda, o ouro ganho,
// o XP de cada personagem, os monstros e os tempos. As contas são as da etapa 4 (regras/fimDaPartida.js).
// Toda partida conta, até entrar e sair logo em seguida (RF34): ouro recebido, XP, níveis e monstros vão para o
// progresso em qualquer resultado, e cada contrato temporário perde uma partida (regras/ganhosDaPartida.js).
// Partida interrompida (página fechada no meio) não passa por aqui e não ganha nada (RF12).
function encerrarPartida(estado, fim = {}) {
  const { partidaAtual, progresso } = estado
  const bioma = partidaAtual?.bioma ?? null
  const contas = montarFimDaPartida(fim, {
    inicio: fim.inicio ?? { x: 0, y: 0 },
    distanciaAteABorda: fim.distanciaAteABorda ?? distanciaAteABorda[bioma ?? 'floresta'],
  })

  let novo = { ...estado, controleDaPartida: controleInicialDaPartida() }
  let personagens = []
  if (partidaAtual) {
    const aplicado = aplicarFimNoProgresso(progresso, {
      ouroRecebido: contas.ouroRecebido,
      xpPorClasse: fim.xpPorClasse,
      monstros: fim.monstros,
      descobertas: fim.descobertas ?? null,
      itens: fim.itens ?? [],
    })
    novo = { ...novo, progresso: aplicado.progresso }
    personagens = aplicado.personagens
  }

  novo.ultimoResultado = {
    resultado: contas.resultado,
    motivo: fim.motivo ?? motivosDoFim[contas.como],
    bioma,
    como: contas.como,
    ouroGanho: Math.max(0, Math.floor(fim.ouroGanho ?? 0)),
    taxa: contas.taxa,
    taxaEmOuro: contas.taxaEmOuro,
    ouroRecebido: contas.ouroRecebido,
    pontuacaoBase: contas.pontuacaoBase,
    pontuacaoFinal: contas.pontuacaoFinal,
    monstros: fim.monstros ?? 0,
    itens: (fim.itens ?? []).map((item) => ({ id: item.id, quantidade: item.quantidade })), // a mochila da partida (TASK-064)
    segundosTotais: fim.segundosTotais ?? 0,
    segundosAtivos: fim.segundosAtivos ?? 0,
    perdidos: contas.perdidos,
    personagens, // XP de cada permanente: { classe, xp, nivelAntes, nivel, niveisGanhos }
    bonusDeBoss: Math.max(0, Math.floor(fim.bonusDeBoss ?? 0)), // Boss derrotado (RF49)
    // Exploração (Fase 3): as áreas descobertas pela primeira vez nesta partida e o XP que elas deram
    areasNovas: fim.descobertas?.areasNovas ?? [],
    xpDeExploracao: fim.descobertas?.xpDeExploracao ?? 0,
  }

  // Conta: a partida vai para o histórico e o ranking (TASK-100); o convidado nunca grava no banco
  if (partidaAtual && estado.perfilLocal === 'conta') {
    const registro = {
      bioma,
      resultado: contas.resultado,
      pontuacao: contas.pontuacaoFinal,
      ouro: contas.ouroRecebido,
      monstros: novo.ultimoResultado.monstros,
      tempo_ativo: novo.ultimoResultado.segundosAtivos,
      tempo_total: novo.ultimoResultado.segundosTotais,
    }
    novo = { ...novo, partidasParaRegistrar: [...estado.partidasParaRegistrar, registro] }
  }

  const destino = resultados[contas.resultado].cutscene ? 'cutsceneDerrota' : 'resumo'
  return navegar(pedirEnvioAoBanco(pedirSalvamento({ ...novo, partidaAtual: null })), destino)
}

// Painel "</> DEV": só no npm run dev e só fora da partida (o progresso não muda durante a partida, RF12).
// No build do jogo, import.meta.env.DEV é falso e esta função sempre devolve o estado como estava.
function ferramentaDeDev(estado, acao) {
  if (!import.meta.env.DEV || estado.partidaAtual) return estado
  const ferramentas = {
    devContratarTodas: (progresso) => contratarTodasAsClasses(progresso),
    devMudarNivel: (progresso) => mudarNivel(progresso, acao.classe, acao.quantos),
    devQuaseSubir: (progresso) => quaseSubir(progresso, acao.classe),
  }
  return pedirSalvamento({ ...estado, progresso: ferramentas[acao.tipo](estado.progresso) })
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

    // Esc fecha a janela de cima (inclusive o aviso da fuga, que assim é cancelada); na Partida, sem janela
    // aberta, pausa (RF35). Em combate não pausa: a Partida mostra "Você não pode pausar agora" (RF44).
    case 'esc': {
      if (estado.janelas.length > 0) return { ...estado, janelas: estado.janelas.slice(0, -1) }
      if (estado.tela !== 'partida') return estado
      const controle = estado.controleDaPartida
      if (controle.andamento.emCombate) {
        return { ...estado, controleDaPartida: { ...controle, recusasDePausa: controle.recusasDePausa + 1 } }
      }
      return { ...estado, janelas: ['pausa'] }
    }

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

    // A conta entrou (src/conta/fluxo.js já conferiu a senha, a sessão única e escolheu o progresso, RF03 e RF11).
    // escolha: { de: 'local' | 'banco' | 'convidado' | 'novo', progresso, partidaDescartada }
    case 'entrarNaConta': {
      const { conta, escolha } = acao
      let novo = {
        ...estado,
        tipoJogador: 'conta',
        perfilLocal: 'conta',
        conta,
        progresso: escolha.progresso ?? progressoInicial(),
        partidaAtual: null,
        mensagemDoAcesso: null,
        partidasParaRegistrar: [],
        nuvem: { situacao: 'ok', mensagem: null },
      }
      if (escolha.partidaDescartada) novo = comAviso(novo, avisoPartidaDescartada)
      if (escolha.de === 'convidado') novo = comAviso(novo, avisoConvidadoParaConta)
      return navegar(novo, destinoAoEntrar(novo))
    }

    // Mensagem na tela de Login (e-mail confirmado, senha trocada, conta em uso, link expirado...)
    case 'mostrarNoLogin':
      return navegar({ ...estado, mensagemDoAcesso: acao.mensagem }, 'login')

    // Conta: como foi o último envio ao Supabase ({ situacao: 'ok' | 'pendente', mensagem })
    case 'atualizarNuvem':
      return { ...estado, nuvem: acao.nuvem }

    // O banco tinha um save mais novo que este navegador: ele passa a valer (RF10, TASK-096)
    case 'usarProgressoDoBanco':
      return navegar(comAviso(pedirSalvamento({ ...estado, progresso: acao.progresso, partidaAtual: null }), acao.aviso), 'reino')

    // Partidas já gravadas no banco saem da fila
    case 'partidasRegistradas':
      return { ...estado, partidasParaRegistrar: estado.partidasParaRegistrar.slice(acao.quantas) }

    // Só para o painel de desenvolvimento: muda o que as telas mostram, não o que é salvo
    case 'trocarTipoJogador':
      return { ...estado, tipoJogador: proximoTipoJogador[estado.tipoJogador] }

    // A classe inicial é permanente e vira o primeiro Líder (RF07). A escolha não se repete.
    case 'escolherClasseInicial':
      if (estado.progresso.personagens.length > 0) return navegar(estado, 'reino')
      return navegar(
        pedirEnvioAoBanco(pedirSalvamento(comProgresso(estado, { personagens: [novoPersonagem(acao.classe)], lider: acao.classe }))),
        'reino',
      )

    // Sem outra região descoberta naquele bioma, o grupo nasce no ponto inicial e a tela Ponto de partida nem aparece
    // (RF32). A arena de teste (só no npm run dev) também vai direto para a Preparação.
    case 'escolherBioma': {
      const descobertas = (estado.progresso.regioesDescobertas[acao.bioma] ?? []).filter((regiao) => regiao !== 'inicio')
      const direto = acao.bioma === 'arena' || descobertas.length === 0
      return navegar(
        { ...estado, escolhasDaPartida: { ...estado.escolhasDaPartida, bioma: acao.bioma, pontoPartida: 'inicio' } },
        direto ? 'preparacao' : 'pontoPartida',
      )
    }

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
      return navegar(pedirEnvioAoBanco(pedirSalvamento({ ...estado, partidaAtual, controleDaPartida: controleInicialDaPartida() })), 'partida')
    }

    // "Voltar ao Reino" da pausa: não tem atalho, passa pela contagem de 15 s do Q, que roda na partida (RF44, RF45).
    case 'iniciarRetorno':
      return comPedido({ ...estado, janelas: [] }, 'comecarRetorno')

    // A partida avisou que "em combate", "retornando" ou "fugindo" mudou
    case 'atualizarAndamento':
      return { ...estado, controleDaPartida: { ...estado.controleDaPartida, andamento: { ...acao.andamento } } }

    // Primeiro F: abre o aviso com o custo atual da fuga, sem pausar (RF46). Só sem outra janela aberta e se a
    // fuga ainda não começou (uma por partida).
    case 'pedirFuga': {
      const controle = estado.controleDaPartida
      if (estado.tela !== 'partida' || estado.janelas.length > 0 || controle.andamento.fugindo) return estado
      return { ...estado, janelas: ['confirmarFuga'], controleDaPartida: { ...controle, custoDaFuga: acao.custo ?? null } }
    }

    // Segundo F (ou o botão do aviso): confirma a fuga. Esc ou Cancelar fecham o aviso e nada acontece.
    case 'confirmarFuga':
      if (estado.janelas.at(-1) !== 'confirmarFuga') return estado
      return comPedido({ ...estado, janelas: estado.janelas.slice(0, -1) }, 'fugir')

    case 'encerrarPartida':
      return encerrarPartida(estado, acao.fim)

    // Guilda (TASK-079): contrato temporário ou permanente. Sem ouro (ou classe que não pode), nada muda; a tela
    // mostra o motivo, que vem da mesma regra. Contratar é um momento de salvamento (o ouro muda).
    case 'contratar': {
      if (estado.partidaAtual) return estado
      const regra = acao.contrato === 'temporario' ? contratarTemporario : contratarPermanente
      const resultado = regra(estado.progresso, acao.classe)
      return resultado.ok ? pedirSalvamento({ ...estado, progresso: resultado.progresso }) : estado
    }

    case 'devContratarTodas':
    case 'devMudarNivel':
    case 'devQuaseSubir':
      return ferramentaDeDev(estado, acao)

    // Música, som e mudo ligam/desligam (o mudo também pela tecla M); o tema alterna entre claro e escuro.
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
