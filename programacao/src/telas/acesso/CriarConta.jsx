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

const pos = posicoes.criarConta

// Criar conta (RF02, RF03): e-mail real, senha e apelido único. Depois vem a confirmação por e-mail.
export default function CriarConta() {
  const { estado, acoes } = useJogo()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [apelido, setApelido] = useState('')
  const { ocupado, resposta, pedir } = usePedido()
  const doConvidado = estado.perfilLocal === 'convidado'

  const criar = () =>
    pedir(async () => {
      const recebida = await acoes.cadastrar({ email, senha, apelido })
      if (recebida?.ok) acoes.irPara('confirmeEmail')
      return recebida
    })
  const campoComErro = resposta?.ok === false ? resposta.campo : null

  return (
    <Tela>
      <MensagemDoAcesso em={pos.mensagem} mensagem={comoMensagem(resposta)} />
      <Campo
        em={pos.email}
        rotulo="E-mail"
        tipo="email"
        valor={email}
        aoMudar={setEmail}
        aoConfirmar={criar}
        autoComplete="email"
        erro={campoComErro === 'email'}
      />
      <Campo
        em={pos.senha}
        rotulo="Senha"
        tipo="password"
        valor={senha}
        aoMudar={setSenha}
        aoConfirmar={criar}
        autoComplete="new-password"
        erro={campoComErro === 'senha'}
      />
      <Campo
        em={pos.apelido}
        rotulo="Apelido"
        valor={apelido}
        aoMudar={setApelido}
        aoConfirmar={criar}
        autoComplete="nickname"
        erro={campoComErro === 'apelido'}
      />
      <Area em={pos.regras} className="nota">
        Senha com pelo menos {tamanhoMinimoDaSenha} caracteres. O apelido é o seu nome no ranking: de 3 a 16 letras, números
        ou _.
        {doConvidado && (
          <>
            <br />
            No primeiro login, o progresso de convidado deste navegador passa para a conta.
          </>
        )}
      </Area>
      <Botao em={pos.criarConta} onClick={criar} desativado={ocupado}>
        {ocupado ? 'Aguarde...' : 'Criar conta'}
      </Botao>
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
