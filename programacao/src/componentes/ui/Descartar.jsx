import { useState } from 'react'
import { itemDoCatalogo } from '../../dados/itens.js'
import { quantidadeParaDescartar } from '../../regras/mochila.js'
import Botao from '../Botao.jsx'
import BotaoDeAcao from './BotaoDeAcao.jsx'
import Slot from './Slot.jsx'

// Descartar com escolha da quantidade (ajustes de 14/10/2026), igual nas duas mochilas: primeiro "Descartar…"; depois
// 1, − e + (várias) ou Todas, com a confirmação que mostra o item, a quantidade e o que acontece com ele ("oQueAcontece":
// na Mochila do Reino, some; na da partida, cai no chão perto do Líder). Só "Sim, descartar" faz o descarte.
export default function Descartar({ id, tem, oQueAcontece, aoConfirmar, tamanhoDoSlot = 'pequeno' }) {
  const [aberto, setAberto] = useState(false)
  const [pedida, setPedida] = useState(1)
  const quantidade = quantidadeParaDescartar(pedida, tem)
  const nome = itemDoCatalogo(id)?.nome ?? id

  if (!aberto || quantidade === 0) {
    return (
      <BotaoDeAcao acao="perder" desativado={tem <= 0} motivo="Nada para descartar" onClick={() => { setPedida(1); setAberto(true) }}>
        Descartar…
      </BotaoDeAcao>
    )
  }

  function confirmar() {
    aoConfirmar(quantidade)
    setAberto(false)
    setPedida(1)
  }

  return (
    <div className="descartar" role="group" aria-label={`Descartar ${nome}`}>
      <div className="descartar-quantidade">
        <span>Quantos?</span>
        <Botao onClick={() => setPedida(1)} selecionado={quantidade === 1}>
          1
        </Botao>
        <Botao onClick={() => setPedida(quantidade - 1)} desativado={quantidade <= 1}>
          −
        </Botao>
        <output className="descartar-numero" aria-label="Quantidade a descartar">
          {quantidade}
        </output>
        <Botao onClick={() => setPedida(quantidade + 1)} desativado={quantidade >= tem}>
          +
        </Botao>
        <Botao onClick={() => setPedida(tem)} selecionado={quantidade === tem && tem > 1}>
          Todas ({tem})
        </Botao>
      </div>
      <div className="confirmacao descartar-confirmacao">
        <Slot id={id} quantidade={quantidade} tamanho={tamanhoDoSlot} />
        <p>
          Descartar <strong>{quantidade} {nome}</strong>? {oQueAcontece(quantidade)}
        </p>
      </div>
      <div className="botoes-em-linha">
        <BotaoDeAcao acao="perder" onClick={confirmar}>
          Sim, descartar {quantidade}
        </BotaoDeAcao>
        <Botao onClick={() => setAberto(false)}>Cancelar</Botao>
      </div>
    </div>
  )
}
