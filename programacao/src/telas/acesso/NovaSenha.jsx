import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import MensagemDoAcesso from '../../componentes/MensagemDoAcesso.jsx'
import Tela from '../../componentes/Tela.jsx'
import { comoMensagem, usePedido } from '../../componentes/usePedido.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { tamanhoMinimoDaSenha } from '../../regras/contas.js'

const pos = posicoes.novaSenha

// Senha nova (RF06): aberta pelo link do e-mail. Depois de trocar, o jogo volta ao Login para entrar com ela.
export default function NovaSenha() {
  const { acoes } = useJogo()
  const [senha, setSenha] = useState('')
  const [repetir, setRepetir] = useState('')
  const { ocupado, resposta, pedir } = usePedido()

  const salvar = () =>
    pedir(async () => {
      if (senha !== repetir) {
        return { ok: false, codigo: 'campo', mensagem: 'As duas senhas estão diferentes. Escreva a mesma senha nos dois campos.' }
      }
      return acoes.trocarSenha(senha)
    })

  return (
    <Tela>
      <Area em={pos.explicacao}>Escolha a senha nova da sua conta (pelo menos {tamanhoMinimoDaSenha} caracteres).</Area>
      <Campo em={pos.senha} rotulo="Senha nova" tipo="password" valor={senha} aoMudar={setSenha} aoConfirmar={salvar} autoComplete="new-password" />
      <Campo
        em={pos.repetir}
        rotulo="Repita a senha nova"
        tipo="password"
        valor={repetir}
        aoMudar={setRepetir}
        aoConfirmar={salvar}
        autoComplete="new-password"
      />
      <Botao em={pos.salvar} onClick={salvar} desativado={ocupado}>
        {ocupado ? 'Aguarde...' : 'Salvar senha nova'}
      </Botao>
      <MensagemDoAcesso em={pos.mensagem} mensagem={comoMensagem(resposta)} />
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
