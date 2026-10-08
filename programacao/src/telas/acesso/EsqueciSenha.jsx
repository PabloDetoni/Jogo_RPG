import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import MensagemDoAcesso from '../../componentes/MensagemDoAcesso.jsx'
import Tela from '../../componentes/Tela.jsx'
import { comoMensagem, usePedido } from '../../componentes/usePedido.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.esqueciSenha

// Esqueci minha senha (RF06): o link do e-mail abre a tela da senha nova.
export default function EsqueciSenha() {
  const { acoes } = useJogo()
  const [email, setEmail] = useState('')
  const { ocupado, resposta, pedir } = usePedido()
  const enviar = () => pedir(() => acoes.pedirNovaSenha(email))

  return (
    <Tela>
      <Campo em={pos.email} rotulo="E-mail da conta" tipo="email" valor={email} aoMudar={setEmail} aoConfirmar={enviar} autoComplete="email" />
      <Botao em={pos.enviar} onClick={enviar} desativado={ocupado}>
        {ocupado ? 'Aguarde...' : 'Enviar link'}
      </Botao>
      <MensagemDoAcesso em={pos.mensagem} mensagem={comoMensagem(resposta)} />
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
