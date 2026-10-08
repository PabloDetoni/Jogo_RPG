import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import MensagemDoAcesso from '../../componentes/MensagemDoAcesso.jsx'
import Tela from '../../componentes/Tela.jsx'
import { comoMensagem, usePedido } from '../../componentes/usePedido.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.confirmeEmail

// Depois do cadastro (RF02): a conta só joga depois de abrir o link do e-mail.
export default function ConfirmeEmail() {
  const { acoes } = useJogo()
  const { ocupado, resposta, pedir } = usePedido()
  const email = acoes.emailDoCadastro?.() || 'o seu e-mail'

  return (
    <Tela>
      <Area em={pos.mensagem}>
        Enviamos um link de confirmação para <strong>{email}</strong>.
        <br />
        Abra o link (veja também o spam). Ele abre o jogo com o e-mail confirmado; depois é só entrar.
      </Area>
      <MensagemDoAcesso em={pos.resposta} mensagem={comoMensagem(resposta)} />
      <Botao em={pos.reenviar} onClick={() => pedir(() => acoes.reenviarConfirmacao())} desativado={ocupado}>
        Reenviar e-mail
      </Botao>
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
