import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { segundosEntreSalvamentosAutomaticos } from '../dados/regras.js'
import { travarAbaDoConvidado } from '../salvamento/abaUnica.js'
import { armazenamentoDoNavegador } from '../salvamento/armazenamento.js'
import { carregarPreferencias, salvarPreferencias } from '../salvamento/preferenciasLocais.js'
import { criarSalvadorDoConvidado } from '../salvamento/salvadorDoConvidado.js'
import { ContextoJogo } from './contexto.js'
import { atualizarEstado, criarEstadoInicial, dadosParaSalvar } from './estadoDoJogo.js'

const avisoAbaOcupada =
  'O jogo já está aberto como convidado em outra aba deste navegador. Feche a outra aba e tente de novo.'

export default function ProvedorDoJogo({ children }) {
  const [armazenamento] = useState(armazenamentoDoNavegador)
  const [salvador] = useState(() => criarSalvadorDoConvidado(armazenamento))
  // As preferências são lidas antes da primeira tela: som e tema valem antes do login (RF18)
  const [estado, despachar] = useReducer(atualizarEstado, armazenamento, (armazenamentoInicial) =>
    criarEstadoInicial(carregarPreferencias(armazenamentoInicial)),
  )

  // Último estado, para quem salva fora do React (relógio de 3 minutos, aba fechando)
  const estadoAtual = useRef(estado)
  useEffect(() => {
    estadoAtual.current = estado
  }, [estado])

  // Momentos de salvamento pedidos pelo estado: classe escolhida, começo e fim da partida (RF09)
  useEffect(() => {
    if (estado.pedidosDeSalvamento > 0) salvador.salvar(dadosParaSalvar(estadoAtual.current))
  }, [estado.pedidosDeSalvamento, salvador])

  // Enquanto há um convidado: salva a cada 3 minutos (RF09) e quando a aba fecha ou é escondida
  const salvaNoNavegador = estado.perfilLocal === 'convidado'
  useEffect(() => {
    if (!salvaNoNavegador) return undefined
    const salvarAgora = () => salvador.salvar(dadosParaSalvar(estadoAtual.current))
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') salvarAgora()
    }
    const relogio = setInterval(salvarAgora, segundosEntreSalvamentosAutomaticos * 1000)
    window.addEventListener('pagehide', salvarAgora)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => {
      clearInterval(relogio)
      window.removeEventListener('pagehide', salvarAgora)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [salvaNoNavegador, salvador])

  // Preferências: guardadas a cada mudança (RF18)
  useEffect(() => {
    salvarPreferencias(armazenamento, estado.preferencias)
  }, [armazenamento, estado.preferencias])

  // Esc funciona em qualquer tela. M liga e desliga o mudo a qualquer momento, até em combate (RF18),
  // menos enquanto se digita num campo de texto (o "m" de um e-mail não pode mutar o jogo).
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') despachar({ tipo: 'esc' })
      const digitando = evento.target instanceof HTMLElement && evento.target.matches('input, textarea, select, [contenteditable="true"]')
      const comAtalho = evento.ctrlKey || evento.altKey || evento.metaKey
      if (evento.key.toLowerCase() === 'm' && !digitando && !comAtalho && !evento.repeat) {
        despachar({ tipo: 'alternarPreferencia', chave: 'mudo' })
      }
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [])

  const entrando = useRef(false) // evita entrar duas vezes com um clique duplo

  const acoes = useMemo(() => {
    // Antes de trocar de perfil ou sair, grava o que o convidado tem agora
    const salvarAgora = () => salvador.salvar(dadosParaSalvar(estadoAtual.current))

    return {
      irPara: (destino) => despachar({ tipo: 'irPara', destino }),
      voltar: () => despachar({ tipo: 'voltar' }),
      abrirJanela: (janela) => despachar({ tipo: 'abrirJanela', janela }),
      fecharJanela: () => despachar({ tipo: 'fecharJanela' }),
      fecharAviso: (id) => despachar({ tipo: 'fecharAviso', id }),

      // RF01: uma aba por navegador no modo convidado; o progresso vem do navegador (HU01)
      entrarComoConvidado: async () => {
        if (entrando.current) return
        entrando.current = true
        try {
          const trava = await travarAbaDoConvidado()
          if (trava === 'ocupada') {
            despachar({ tipo: 'mostrarAviso', texto: avisoAbaOcupada })
            return
          }
          salvarAgora()
          despachar({ tipo: 'entrarComoConvidado', carregamento: salvador.carregar() })
        } finally {
          entrando.current = false
        }
      },
      entrarNaConta: () => {
        salvarAgora()
        despachar({ tipo: 'entrarNaConta' })
      },
      // Transferência do convidado para a conta nova: é um momento de salvamento (RF09)
      confirmarConta: () => {
        salvarAgora()
        despachar({ tipo: 'confirmarConta' })
      },
      // Sair (convidado ou conta) salva e recarrega a página: volta à Tela inicial do zero
      sair: () => {
        salvarAgora()
        window.location.reload()
      },

      trocarTipoJogador: () => despachar({ tipo: 'trocarTipoJogador' }),
      escolherClasseInicial: (classe) => despachar({ tipo: 'escolherClasseInicial', classe }),
      escolherBioma: (bioma) => despachar({ tipo: 'escolherBioma', bioma }),
      escolherPontoPartida: (pontoPartida) => despachar({ tipo: 'escolherPontoPartida', pontoPartida }),
      escolherLider: (classe) => despachar({ tipo: 'escolherLider', classe }),
      comecarPartida: () => despachar({ tipo: 'comecarPartida', agora: new Date().toISOString() }),
      iniciarRetorno: () => despachar({ tipo: 'iniciarRetorno' }),
      atualizarAndamento: (andamento) => despachar({ tipo: 'atualizarAndamento', andamento }),
      pedirFuga: (custo) => despachar({ tipo: 'pedirFuga', custo }),
      confirmarFuga: () => despachar({ tipo: 'confirmarFuga' }),
      encerrarPartida: (fim) => despachar({ tipo: 'encerrarPartida', fim }),
      contratar: (contrato, classe) => despachar({ tipo: 'contratar', contrato, classe }),
      alternarPreferencia: (chave) => despachar({ tipo: 'alternarPreferencia', chave }),

      // Painel de desenvolvimento (só no npm run dev; mexem no save só fora da partida)
      salvarAgora,
      devContratarTodas: () => despachar({ tipo: 'devContratarTodas' }),
      devMudarNivel: (classe, quantos) => despachar({ tipo: 'devMudarNivel', classe, quantos }),
      devQuaseSubir: (classe) => despachar({ tipo: 'devQuaseSubir', classe }),
      apagarProgressoDoConvidado: () => {
        salvador.apagar()
        window.location.reload()
      },
    }
  }, [salvador])

  const valor = useMemo(() => ({ estado, acoes, salvador }), [estado, acoes, salvador])

  return <ContextoJogo value={valor}>{children}</ContextoJogo>
}
