import { useEffect, useState } from 'react'
import { msDoAvisoDeConquista } from '../dados/interface.js'
import { posicoes } from '../dados/posicoes.js'
import { useInfoDoSalvamento, useJogo } from '../estado/contexto.js'
import Area from './Area.jsx'
import Botao from './Botao.jsx'

// Problemas do salvamento do convidado (salvamento/salvadorDoConvidado.js)
const textosDosProblemas = {
  indisponivel: 'Este navegador não está deixando o jogo guardar dados. O progresso de convidado não será salvo.',
  cheio: 'Acabou o espaço do navegador para guardar dados. O progresso não foi salvo.',
  conflito:
    'O progresso foi salvo por outra aba ou janela. Recarregue a página para continuar de onde parou; nada mais será salvo nesta aba.',
  formatoNovo: null, // já avisado ao entrar como convidado
}

// Mensagens para o jogador, por cima da tela. Cada uma fecha no seu OK. As de conquista (Fase 4.5) ficam no canto, embaixo
// das Configurações, e somem sozinhas depois de alguns segundos: não tapam as abas das telas.
export default function Avisos() {
  const { estado, acoes } = useJogo()
  const { problema } = useInfoDoSalvamento()
  const [problemaFechado, setProblemaFechado] = useState(null)
  const textoDoProblema = problema && problema !== problemaFechado ? textosDosProblemas[problema] : null
  const conquistas = estado.avisos.filter((aviso) => aviso.tipo === 'conquista')
  const outros = estado.avisos.filter((aviso) => aviso.tipo !== 'conquista')

  return (
    <>
      {(textoDoProblema || outros.length > 0) && (
        <Area em={posicoes.avisos} className="avisos">
          {textoDoProblema && (
            <div className="aviso" role="alert">
              <p>{textoDoProblema}</p>
              <Botao onClick={() => setProblemaFechado(problema)}>OK</Botao>
            </div>
          )}
          {outros.map((aviso) => (
            <div key={aviso.id} className="aviso" role="status">
              <p>{aviso.texto}</p>
              <Botao onClick={() => acoes.fecharAviso(aviso.id)}>OK</Botao>
            </div>
          ))}
        </Area>
      )}
      {conquistas.length > 0 && (
        <Area em={posicoes.avisosDeConquista} className="avisos avisos-de-conquista">
          {conquistas.map((aviso) => (
            <AvisoDeConquista key={aviso.id} aviso={aviso} fechar={() => acoes.fecharAviso(aviso.id)} />
          ))}
        </Area>
      )}
    </>
  )
}

function AvisoDeConquista({ aviso, fechar }) {
  useEffect(() => {
    const espera = setTimeout(fechar, msDoAvisoDeConquista)
    return () => clearTimeout(espera)
    // fechar muda a cada desenho; o tempo conta desde que o aviso apareceu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aviso.id])
  return (
    <div className="aviso aviso-de-conquista" role="status">
      <span className="aviso-de-conquista-selo" aria-hidden="true">★</span>
      <p>{aviso.texto}</p>
      <Botao onClick={fechar}>OK</Botao>
    </div>
  )
}
