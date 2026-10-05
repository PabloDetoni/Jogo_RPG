import { resultados } from '../dados/resultados.js'
import { segundosRetornoNormal } from '../dados/regras.js'
import { telas } from '../dados/telas.js'

// Estado falso, só em memória: recarregar a página volta tudo para cá.
export const estadoInicial = {
  tela: 'telaInicial',
  anteriores: [], // caminho de telas até aqui, usado pelo Voltar
  janelas: [], // janelas abertas por cima da tela; a última fica no topo
  tipoJogador: 'nenhum', // 'nenhum', 'convidado' ou 'conta'
  personagens: [], // { classe, permanente }
  partida: { bioma: null, pontoPartida: null, lider: null },
  segundosRetorno: null, // contagem do retorno ao Reino; null = parada
  ultimoResultado: null, // id de dados/resultados.js
  preferencias: { musica: true, som: true, tema: 'claro' },
}

// Usado pelo painel de desenvolvimento para alternar o tipo de jogador.
export const proximoTipoJogador = { nenhum: 'convidado', convidado: 'conta', conta: 'convidado' }

// Troca de tela e fecha as janelas abertas.
// Numa tela raiz, o caminho é esquecido. Numa tela que já está no caminho, o caminho é cortado até ela.
function navegar(estado, destino) {
  let anteriores = []
  if (!telas[destino].raiz) {
    const caminho = [...estado.anteriores, estado.tela]
    const posicao = caminho.indexOf(destino)
    anteriores = posicao >= 0 ? caminho.slice(0, posicao) : caminho
  }
  return {
    ...estado,
    tela: destino,
    anteriores,
    janelas: [],
    segundosRetorno: destino === 'partida' ? estado.segundosRetorno : null,
  }
}

function encerrarPartida(estado, resultado) {
  const destino = resultados[resultado].cutscene ? 'cutsceneDerrota' : 'resumo'
  return navegar({ ...estado, ultimoResultado: resultado, segundosRetorno: null }, destino)
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

    // Entrar, "Já confirmei" e Jogar como convidado.
    // Sem personagem, é o primeiro acesso: narrativa e escolha de classe (RF07).
    // Personagens do convidado continuam na conta criada (RF03).
    case 'entrar': {
      const destino = estado.personagens.length > 0 ? 'reino' : 'narrativaInicial'
      return navegar({ ...estado, tipoJogador: acao.tipoJogador }, destino)
    }

    // Só para o painel de desenvolvimento
    case 'trocarTipoJogador':
      return { ...estado, tipoJogador: proximoTipoJogador[estado.tipoJogador] }

    // A classe inicial é permanente e vira o primeiro Líder (RF07).
    case 'escolherClasseInicial':
      return navegar(
        {
          ...estado,
          personagens: [{ classe: acao.classe, permanente: true }],
          partida: { ...estado.partida, lider: acao.classe },
        },
        'reino',
      )

    case 'escolherBioma':
      return navegar({ ...estado, partida: { ...estado.partida, bioma: acao.bioma } }, 'pontoPartida')

    case 'escolherPontoPartida':
      return navegar(
        { ...estado, partida: { ...estado.partida, pontoPartida: acao.pontoPartida } },
        'preparacao',
      )

    case 'escolherLider':
      return { ...estado, partida: { ...estado.partida, lider: acao.classe } }

    case 'comecarPartida':
      return navegar({ ...estado, segundosRetorno: null }, 'partida')

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
      return encerrarPartida(estado, acao.resultado)

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
