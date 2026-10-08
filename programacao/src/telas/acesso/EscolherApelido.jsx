import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Campo from '../../componentes/Campo.jsx'
import MensagemDoAcesso from '../../componentes/MensagemDoAcesso.jsx'
import Tela from '../../componentes/Tela.jsx'
import { comoMensagem, usePedido } from '../../componentes/usePedido.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.escolherApelido

// A conta entrou, mas ainda não tem apelido (foi criada fora do jogo, pelo painel do Supabase, por exemplo).
// O apelido é o nome no ranking (RF02); ao confirmar, o jogo segue como num login normal.
export default function EscolherApelido() {
  const { acoes } = useJogo()
  const [apelido, setApelido] = useState('')
  const { ocupado, resposta, pedir } = usePedido()
  const confirmar = () => pedir(() => acoes.escolherApelido(apelido))

  return (
    <Tela>
      <Area em={pos.explicacao}>Sua conta ainda não tem apelido. Ele é o seu nome no ranking: de 3 a 16 letras, números ou _.</Area>
      <Campo em={pos.apelido} rotulo="Apelido" valor={apelido} aoMudar={setApelido} aoConfirmar={confirmar} autoComplete="nickname" />
      <Botao em={pos.confirmar} onClick={confirmar} desativado={ocupado}>
        {ocupado ? 'Aguarde...' : 'Confirmar apelido'}
      </Botao>
      <MensagemDoAcesso em={pos.mensagem} mensagem={comoMensagem(resposta)} />
      <Botao em={pos.voltarAoLogin} onClick={() => acoes.irPara('login')}>
        Voltar ao Login
      </Botao>
    </Tela>
  )
}
