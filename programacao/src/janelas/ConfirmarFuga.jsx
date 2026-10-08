import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { segundosDaFuga } from '../dados/regras.js'
import { useJogo } from '../estado/contexto.js'

// Aviso da fuga (RF46): o primeiro F mostra o custo de agora; o segundo F (ou "Fugir") confirma. Esc ou Cancelar
// fecham o aviso e nada acontece. Não pausa: o jogo continua embaixo (é uma janela leve, sem escurecer a tela).
export default function ConfirmarFuga() {
  const { estado, acoes } = useJogo()
  const custo = estado.controleDaPartida?.custoDaFuga

  return (
    <Janela titulo="Fugir com a Pedra de Retorno?" leve>
      {custo ? (
        <p>
          Custo agora: <strong>{custo.taxa}%</strong> do ouro ganho ({custo.ouro} de ouro).
        </p>
      ) : (
        <p>O custo é a taxa de fuga pela distância do Líder até o início do bioma.</p>
      )}
      <p>
        Em {segundosDaFuga} s o grupo volta ao Reino, mesmo em combate (Retorno forçado). Vale o custo do lugar do Líder no fim;
        confirmada, não se cancela.
      </p>
      <p>
        <strong>F</strong> de novo foge · <strong>Esc</strong> cancela
      </p>
      <div className="linha">
        <Botao onClick={acoes.confirmarFuga}>Fugir (F)</Botao>
        <Botao onClick={acoes.fecharJanela}>Cancelar (Esc)</Botao>
      </div>
    </Janela>
  )
}
