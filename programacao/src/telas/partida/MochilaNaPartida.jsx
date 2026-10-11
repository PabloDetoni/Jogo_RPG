import Janela from '../../componentes/Janela.jsx'
import Barra from '../../componentes/ui/Barra.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { funcaoDoItem, usavelNaPartida } from '../../dados/itens.js'
import { itensDaJanela } from '../../regras/itensNaPartida.js'

// Mochila da partida (TASK-047, RF41; Fase 4.5): Tab abre sem pausar (janela leve, o jogo continua embaixo). A mesma grade de
// quadradinhos do Reino (ícone de 32 px), com a barra de peso. ↑ e ↓ escolhem; E usa no Líder e R no aliado de pé mais
// perto da mira. Poção não levanta quem desmaiou. Tab ou Esc fecham.
// O estado das teclas e o envio para a partida ficam em Partida.jsx; aqui só o desenho. "escolhido" é o id do item: quando
// ele acaba, nada fica escolhido (apertar E de novo não gasta outro item sem querer).
export default function MochilaNaPartida({ mochila, escolhido, aoEscolher, aoUsar }) {
  const itens = itensDaJanela(mochila?.itens)
  const atual = itens.find((item) => item.id === escolhido) ?? null
  const podeUsar = atual && usavelNaPartida(atual.dado)
  const peso = mochila?.peso ?? 0
  const capacidade = mochila?.capacidade ?? 0

  return (
    <Janela titulo="Mochila da partida" aoLado>
      <Barra fracao={peso / Math.max(1, capacidade)} texto={`Peso ${peso} de ${capacidade}`} alerta={peso >= capacidade} rotulo="Peso da mochila da partida" />
      {itens.length === 0 ? (
        <p className="vazio">Vazia. Itens do chão: chegue perto e aperte E (com esta janela fechada).</p>
      ) : (
        <div className="grade grade-pequeno mochila-na-partida-grade" role="group" aria-label="Itens da mochila da partida">
          {itens.map((item) => (
            <Slot
              key={item.id}
              id={item.id}
              quantidade={item.quantidade}
              tamanho="pequeno"
              apagado={!usavelNaPartida(item.dado)}
              escolhido={item.id === escolhido}
              onClick={() => aoEscolher(item.id)}
            />
          ))}
        </div>
      )}
      <p className="nota">{atual ? `${atual.dado.nome}: ${funcaoDoItem(atual.dado)}` : 'Escolha um item com ↑ ↓ ou com o mouse. Apagados: só servem no Reino.'}</p>
      <div className="linha">
        <BotaoDeAcao acao="usar" desativado={!podeUsar} onClick={() => aoUsar('lider')}>
          Usar no Líder (E)
        </BotaoDeAcao>
        <BotaoDeAcao acao="usar" desativado={!podeUsar} onClick={() => aoUsar('aliado')}>
          Usar no aliado (R)
        </BotaoDeAcao>
      </div>
      <p className="nota">↑ ↓ escolhe · R usa no aliado mais perto da mira · Tab ou Esc fecha · o jogo não pausa</p>
    </Janela>
  )
}
