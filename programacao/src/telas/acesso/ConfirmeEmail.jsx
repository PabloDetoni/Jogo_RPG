import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.confirmeEmail

export default function ConfirmeEmail() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.mensagem}>
        Enviamos um link de confirmação para o seu e-mail.
        <br />
        Abra o link para poder jogar com a sua conta.
      </Area>
      {/* Botão de teste: some quando o login de verdade entrar (etapa 8) */}
      <Botao em={pos.jaConfirmei} onClick={() => acoes.entrar('conta')}>
        Já confirmei (teste)
      </Botao>
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
