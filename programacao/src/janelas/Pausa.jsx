import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { segundosRetornoNormal } from '../dados/regras.js'
import { useJogo } from '../estado/contexto.js'

// Menu de pausa (RF44). Só abre fora de combate. "Voltar ao Reino" não sai na hora: fecha a pausa e começa a mesma
// contagem de 15 s do Q, que roda na partida (RF45).
export default function Pausa() {
  const { estado, acoes } = useJogo()
  const retornando = Boolean(estado.controleDaPartida?.andamento.retornando)

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
