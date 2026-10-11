import { acoes, arteDaAcao } from '../../dados/interface.js'
import Simbolo from './Simbolo.jsx'

// Botão de uma ação do jogo (Fase 4.5): o símbolo e a cor da ação (dados/interface.js) e o texto com o verbo e o
// resultado ("Comprar por 25 de ouro"). Desativado, diz o motivo logo embaixo (o mesmo que a regra daria).
export default function BotaoDeAcao({ acao, onClick, desativado = false, motivo, children, grande = false }) {
  const dados = acoes[acao] ?? { cor: 'var(--borda)', simbolo: '•' }
  return (
    <span className="botao-de-acao-caixa">
      <button
        type="button"
        className={`botao botao-de-acao${grande ? ' botao-de-acao-grande' : ''}`}
        style={{ '--cor-da-acao': dados.cor }}
        onClick={onClick}
        disabled={desativado}
        title={desativado && motivo ? motivo : undefined}
      >
        <Simbolo simbolo={dados.simbolo} cor={dados.cor} arte={arteDaAcao(acao)} />
        {children}
      </button>
      {desativado && motivo && <span className="motivo-do-botao">{motivo}</span>}
    </span>
  )
}
