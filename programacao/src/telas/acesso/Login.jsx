import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.login

export default function Login() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Campo em={pos.email} rotulo="E-mail" tipo="email" />
      <Campo em={pos.senha} rotulo="Senha" tipo="password" />
      <Botao em={pos.entrar} onClick={acoes.entrarNaConta}>
        Entrar
      </Botao>
      <Botao em={pos.criarConta} onClick={() => acoes.irPara('criarConta')}>
        Criar conta
      </Botao>
      <Botao em={pos.esqueciSenha} onClick={() => acoes.irPara('esqueciSenha')}>
        Esqueci minha senha
      </Botao>
      <Botao em={pos.jogarComoConvidado} onClick={acoes.entrarComoConvidado}>
        Jogar como convidado
      </Botao>
      {/* HU01: o convidado é avisado antes de entrar */}
      <Area em={pos.avisoConvidado} className="nota">
        Como convidado, o progresso fica só neste navegador e você não aparece no ranking.
      </Area>
      <Botao em={pos.voltar} onClick={() => acoes.irPara('telaInicial')}>
        Voltar
      </Botao>
    </Tela>
  )
}
