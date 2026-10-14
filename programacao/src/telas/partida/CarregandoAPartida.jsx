import { useState } from 'react'
import { dicaSorteada } from '../../dados/dicasDoCarregamento.js'

// Tela de carregamento da partida (ajustes de 14/10/2026): o progresso de verdade (o motor do jogo, a arte e os sons, e o
// mapa montado; regras/carregamento.js) e uma dica do jogo sorteada. Se demorar demais ou falhar, diz o que houve, com
// "Tentar de novo" e "Voltar ao Reino": nunca uma tela parada sem explicação.
export default function CarregandoAPartida({ progresso, problema, saindo, aoTentarDeNovo, aoVoltar }) {
  const [dica] = useState(() => dicaSorteada())
  const porcento = Math.round(progresso.fracao * 100)

  return (
    <div className={`carregando-a-partida${saindo ? ' carregando-saindo' : ''}`} role="status" aria-live="polite" aria-label="Carregando a partida">
      <div className="carregando-caixa">
        {problema ? (
          <>
            <h2>{problema.titulo}</h2>
            <p>{problema.texto}</p>
            <div className="botoes-em-linha">
              <button type="button" className="botao" onClick={aoTentarDeNovo}>
                Tentar de novo
              </button>
              <button type="button" className="botao" onClick={aoVoltar}>
                Voltar ao Reino
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Carregando a partida</h2>
            <div className="carregando-barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={porcento}>
              <div className="carregando-barra-cheia" style={{ width: `${porcento}%` }} />
            </div>
            <p className="carregando-etapa">
              {progresso.etapa} · {porcento}%
            </p>
            <p className="carregando-dica">
              <strong>Dica:</strong> {dica}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
