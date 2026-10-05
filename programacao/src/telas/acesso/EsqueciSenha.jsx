import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.esqueciSenha

export default function EsqueciSenha() {
  const { acoes } = useJogo()
  const [enviado, setEnviado] = useState(false)

  return (
    <Tela>
      <Campo em={pos.email} rotulo="E-mail da conta" tipo="email" />
      <Botao em={pos.enviar} onClick={() => setEnviado(true)}>
        Enviar link
      </Botao>
      {enviado && (
        <Area em={pos.mensagem}>Enviamos um link para o seu e-mail. Use-o para criar uma senha nova.</Area>
      )}
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
