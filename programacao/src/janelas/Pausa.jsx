import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { segundosRetornoNormal } from '../dados/regras.js'
import { useJogo } from '../estado/contexto.js'

// Menu de pausa (RF44). "Voltar ao Reino" não sai na hora: começa a contagem do retorno (RF45).
export default function Pausa() {
  const { estado, acoes } = useJogo()
  const retornando = estado.segundosRetorno !== null

  return (
    <Janela titulo="Pausa">
      <Botao onClick={acoes.fecharJanela}>Continuar</Botao>
      <Botao onClick={() => acoes.abrirJanela('configuracoes')}>Configurações</Botao>
      <Botao onClick={() => acoes.abrirJanela('comoJogar')}>Como jogar</Botao>
      <Botao onClick={acoes.iniciarRetorno} desativado={retornando}>
        {retornando ? 'Retorno ao Reino em andamento' : `Voltar ao Reino (${segundosRetornoNormal} s)`}
      </Botao>
    </Janela>
  )
}
