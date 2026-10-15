import { useState } from 'react'
import { filtrarItens } from '../../regras/interface.js'
import FiltrosDeItens from './FiltrosDeItens.jsx'
import Slot from './Slot.jsx'

// Grade de quadradinhos com os filtros por tipo (Fase 4.5): Mochila, Mercado, Forja, Catálogo e Preparação.
// itens: [{ id, quantidade?, rotulo?, apagado?, silhueta?, titulo?, chave? }]; escolhido: a chave marcada;
// aoEscolher(chave). vazio: o que fazer quando não há nada (a tela vazia explica). Os filtros sem nenhum item ficam
// apagados.
export default function GradeDeItens({ itens, escolhido, aoEscolher, vazio, rotulo, comFiltros = true, tamanho = 'grande' }) {
  const [filtro, setFiltro] = useState('todos')
  const visiveis = comFiltros ? filtrarItens(itens, filtro) : itens

  return (
    <div className="grade-de-itens">
      {comFiltros && itens.length > 0 && <FiltrosDeItens itens={itens} filtro={filtro} aoMudar={setFiltro} />}
      {visiveis.length === 0 ? (
        <p className="vazio">{itens.length === 0 ? vazio : 'Nenhum item deste tipo.'}</p>
      ) : (
        <div className={`grade grade-${tamanho}`} role="group" aria-label={rotulo}>
          {visiveis.map((item) => (
            <Slot
              key={item.chave ?? item.id}
              id={item.id}
              quantidade={item.quantidade}
              rotulo={item.rotulo}
              apagado={item.apagado}
              silhueta={item.silhueta}
              titulo={item.titulo}
              tamanho={tamanho}
              escolhido={(item.chave ?? item.id) === escolhido}
              onClick={aoEscolher ? () => aoEscolher(item.chave ?? item.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
