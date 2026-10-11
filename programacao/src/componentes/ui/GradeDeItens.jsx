import { useState } from 'react'
import { filtrosDeItens } from '../../dados/interface.js'
import { contarPorFiltro, filtrarItens } from '../../regras/interface.js'
import Slot from './Slot.jsx'

// Grade de quadradinhos com os filtros por tipo (Fase 4.5): Mochila, Mercado, Forja, Catálogo e Preparação.
// itens: [{ id, quantidade?, rotulo?, apagado?, silhueta?, titulo?, chave? }]; escolhido: a chave marcada;
// aoEscolher(chave). vazio: o que fazer quando não há nada (a tela vazia explica). Os filtros sem nenhum item ficam
// apagados.
export default function GradeDeItens({ itens, escolhido, aoEscolher, vazio, rotulo, comFiltros = true, tamanho = 'grande' }) {
  const [filtro, setFiltro] = useState('todos')
  const contagem = contarPorFiltro(itens)
  const visiveis = comFiltros ? filtrarItens(itens, filtro) : itens

  return (
    <div className="grade-de-itens">
      {comFiltros && itens.length > 0 && (
        <div className="filtros" role="group" aria-label="Filtrar por tipo">
          {filtrosDeItens.map((um) => (
            <button
              key={um.id}
              type="button"
              className="botao filtro"
              aria-pressed={um.id === filtro}
              disabled={um.id !== 'todos' && contagem[um.id] === 0}
              onClick={() => setFiltro(um.id)}
            >
              {um.nome} <span className="filtro-contagem">{contagem[um.id]}</span>
            </button>
          ))}
        </div>
      )}
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
