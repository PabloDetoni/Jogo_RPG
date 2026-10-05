import { useEffect } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.partida

// Lugar da partida de verdade (etapa 5). Os 4 botões de resultado são só para teste.
export default function Partida() {
  const { estado, acoes } = useJogo()
  const retornando = estado.segundosRetorno !== null
  const pausado = estado.janelas.includes('pausa')
  const contando = retornando && !pausado

  // A contagem do retorno anda de 1 em 1 segundo e para enquanto a pausa está aberta.
  // As Configurações não pausam, então a contagem continua com elas abertas.
  useEffect(() => {
    if (!contando) return
    const relogio = setInterval(acoes.contarRetorno, 1000)
    return () => clearInterval(relogio)
  }, [contando, acoes])

  return (
    <Tela className="tela-partida">
      <Area em={pos.dica}>Esc abre a pausa. Os botões de baixo são só para teste.</Area>

      {retornando && (
        <>
          <Area em={pos.retorno}>Voltando ao Reino em {estado.segundosRetorno} s</Area>
          <Botao em={pos.cancelarRetorno} onClick={acoes.cancelarRetorno}>
            Cancelar retorno
          </Botao>
        </>
      )}

      <Botao em={pos.grandeVitoria} onClick={() => acoes.encerrarPartida('grandeVitoria')}>
        Grande Vitória
      </Botao>
      <Botao em={pos.vitoria} onClick={() => acoes.encerrarPartida('vitoria')}>
        Vitória
      </Botao>
      <Botao em={pos.retornoForcado} onClick={() => acoes.encerrarPartida('retornoForcado')}>
        Retorno forçado
      </Botao>
      <Botao em={pos.derrota} onClick={() => acoes.encerrarPartida('derrota')}>
        Derrota
      </Botao>
    </Tela>
  )
}
