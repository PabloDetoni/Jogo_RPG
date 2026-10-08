import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import MensagemDoAcesso from '../../componentes/MensagemDoAcesso.jsx'
import Tela from '../../componentes/Tela.jsx'
import { comoMensagem, usePedido } from '../../componentes/usePedido.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { mensagemDoErro } from '../../regras/contas.js'

const pos = posicoes.login

// Login (RF04, RF05): e-mail e senha, reenvio da confirmação, "Continuar como ..." e o convidado.
export default function Login() {
  const { estado, acoes, contas } = useJogo()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [podeReenviar, setPodeReenviar] = useState(false)
  const { ocupado, resposta, pedir } = usePedido()

  // Entrar ou continuar: a conta sem apelido escolhe um antes; o e-mail não confirmado ganha o Reenviar
  const depoisDeEntrar = (recebida) => {
    if (recebida?.precisaApelido) acoes.irPara('escolherApelido')
    if (recebida?.codigo === 'naoConfirmado') setPodeReenviar(true)
    return recebida
  }
  const entrar = () => pedir(async () => depoisDeEntrar(await acoes.entrar({ email, senha })))
  const continuar = () => pedir(async () => depoisDeEntrar(await acoes.continuarNaConta()))
  const reenviar = () => pedir(() => acoes.reenviarConfirmacao(email))

  // A resposta do último clique vale mais que a mensagem que chegou com a tela (e-mail confirmado, conta em uso...)
  const indisponivel = contas?.disponivel === false ? { texto: mensagemDoErro('indisponivel'), tipo: 'erro' } : null
  const mensagem = comoMensagem(resposta) ?? estado.mensagemDoAcesso ?? indisponivel
  const guardada = contas?.guardada

  return (
    <Tela>
      <MensagemDoAcesso em={pos.mensagem} mensagem={mensagem} />
      {guardada && (
        <Botao em={pos.continuar} onClick={continuar} desativado={ocupado}>
          Continuar como {guardada.email}
        </Botao>
      )}
      <Campo em={pos.email} rotulo="E-mail" tipo="email" valor={email} aoMudar={setEmail} aoConfirmar={entrar} autoComplete="email" />
      <Campo
        em={pos.senha}
        rotulo="Senha"
        tipo="password"
        valor={senha}
        aoMudar={setSenha}
        aoConfirmar={entrar}
        autoComplete="current-password"
      />
      <Botao em={pos.entrar} onClick={entrar} desativado={ocupado}>
        {ocupado ? 'Aguarde...' : 'Entrar'}
      </Botao>
      {podeReenviar && (
        <Botao em={pos.reenviar} onClick={reenviar} desativado={ocupado}>
          Reenviar e-mail de confirmação
        </Botao>
      )}
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
