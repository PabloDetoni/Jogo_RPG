import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.criarConta

export default function CriarConta() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Campo em={pos.email} rotulo="E-mail" tipo="email" />
      <Campo em={pos.senha} rotulo="Senha" tipo="password" />
      <Campo em={pos.apelido} rotulo="Apelido" />
      <Botao em={pos.criarConta} onClick={() => acoes.irPara('confirmeEmail')}>
        Criar conta
      </Botao>
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
