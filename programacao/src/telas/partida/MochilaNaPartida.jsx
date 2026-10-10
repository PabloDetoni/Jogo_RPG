import Botao from '../../componentes/Botao.jsx'
import Janela from '../../componentes/Janela.jsx'
import { funcaoDoItem, usavelNaPartida } from '../../dados/itens.js'
import { itensDaJanela } from '../../regras/itensNaPartida.js'

// Mochila da partida (TASK-047, RF41): Tab abre sem pausar (janela leve, o jogo continua embaixo). ↑ e ↓ escolhem;
// E usa no Líder e R no aliado de pé mais perto da mira. Poção não levanta quem desmaiou. Tab ou Esc fecham.
// O estado das teclas e o envio para a partida ficam em Partida.jsx; aqui só o desenho. "escolhido" é o id do item: quando
// ele acaba, nada fica escolhido (apertar E de novo não gasta outro item sem querer).
export default function MochilaNaPartida({ mochila, escolhido, aoEscolher, aoUsar }) {
  const itens = itensDaJanela(mochila?.itens)
  const atual = itens.find((item) => item.id === escolhido) ?? null
  const podeUsar = atual && usavelNaPartida(atual.dado)

  return (
    <Janela titulo="Mochila da partida" aoLado>
      <p>
        Peso {mochila?.peso ?? 0} de {mochila?.capacidade ?? 0}
      </p>
      <ul className="lista-com-detalhe-itens mochila-na-partida-itens" aria-label="Itens da mochila da partida">
        {itens.length === 0 && <li className="lista-com-detalhe-vazio">Vazia. Itens do chão: chegue perto e aperte E (com esta janela fechada).</li>}
        {itens.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`lista-com-detalhe-item${usavelNaPartida(item.dado) ? '' : ' lista-com-detalhe-item-nota'}`}
              aria-pressed={item.id === escolhido}
              onClick={() => aoEscolher(item.id)}
            >
              <span className="lista-com-detalhe-nome">{item.dado.nome}</span>
              <span className="lista-com-detalhe-direita">×{item.quantidade}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="nota">{atual ? funcaoDoItem(atual.dado) : 'Escolha um item com ↑ ↓ ou com o mouse.'}</p>
      <div className="linha">
        <Botao desativado={!podeUsar} onClick={() => aoUsar('lider')}>
          Usar no Líder (E)
        </Botao>
        <Botao desativado={!podeUsar} onClick={() => aoUsar('aliado')}>
          Usar no aliado (R)
        </Botao>
      </div>
      <p className="nota">↑ ↓ escolhe · R usa no aliado mais perto da mira · Tab ou Esc fecha · o jogo não pausa</p>
    </Janela>
  )
}
