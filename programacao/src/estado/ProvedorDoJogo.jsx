import { useEffect, useMemo, useReducer } from 'react'
import { ContextoJogo } from './contexto.js'
import { atualizarEstado, estadoInicial } from './estadoDoJogo.js'

export default function ProvedorDoJogo({ children }) {
  const [estado, despachar] = useReducer(atualizarEstado, estadoInicial)

  const acoes = useMemo(
    () => ({
      irPara: (destino) => despachar({ tipo: 'irPara', destino }),
      voltar: () => despachar({ tipo: 'voltar' }),
      abrirJanela: (janela) => despachar({ tipo: 'abrirJanela', janela }),
      fecharJanela: () => despachar({ tipo: 'fecharJanela' }),
      entrar: (tipoJogador) => despachar({ tipo: 'entrar', tipoJogador }),
      trocarTipoJogador: () => despachar({ tipo: 'trocarTipoJogador' }),
      escolherClasseInicial: (classe) => despachar({ tipo: 'escolherClasseInicial', classe }),
      escolherBioma: (bioma) => despachar({ tipo: 'escolherBioma', bioma }),
      escolherPontoPartida: (pontoPartida) => despachar({ tipo: 'escolherPontoPartida', pontoPartida }),
      escolherLider: (classe) => despachar({ tipo: 'escolherLider', classe }),
      comecarPartida: () => despachar({ tipo: 'comecarPartida' }),
      iniciarRetorno: () => despachar({ tipo: 'iniciarRetorno' }),
      cancelarRetorno: () => despachar({ tipo: 'cancelarRetorno' }),
      contarRetorno: () => despachar({ tipo: 'contarRetorno' }),
      encerrarPartida: (resultado) => despachar({ tipo: 'encerrarPartida', resultado }),
      alternarPreferencia: (chave) => despachar({ tipo: 'alternarPreferencia', chave }),
      // Sair (convidado ou conta) recarrega a página e volta à Tela inicial do zero.
      sair: () => window.location.reload(),
    }),
    [],
  )

  // Esc funciona em qualquer tela.
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') despachar({ tipo: 'esc' })
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [])

  const valor = useMemo(() => ({ estado, acoes }), [estado, acoes])

  return <ContextoJogo value={valor}>{children}</ContextoJogo>
}
