import { useState } from 'react'
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

// Mensagens para o jogador, por cima da tela. Cada uma fecha no seu OK.
export default function Avisos() {
  const { estado, acoes } = useJogo()
  const { problema } = useInfoDoSalvamento()
  const [problemaFechado, setProblemaFechado] = useState(null)
  const textoDoProblema = problema && problema !== problemaFechado ? textosDosProblemas[problema] : null

  if (!textoDoProblema && estado.avisos.length === 0) return null

  return (
    <Area em={posicoes.avisos} className="avisos">
      {textoDoProblema && (
        <div className="aviso" role="alert">
          <p>{textoDoProblema}</p>
          <Botao onClick={() => setProblemaFechado(problema)}>OK</Botao>
        </div>
      )}
      {estado.avisos.map((aviso) => (
        <div key={aviso.id} className="aviso" role="status">
          <p>{aviso.texto}</p>
          <Botao onClick={() => acoes.fecharAviso(aviso.id)}>OK</Botao>
        </div>
      ))}
    </Area>
  )
}
