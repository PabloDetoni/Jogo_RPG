// Lista que rola à esquerda e o detalhe do escolhido à direita (Mochila, Mercado, Forja).
// itens: [{ chave, titulo, direita?, nota? }]. O escolhido fica marcado; "vazio" aparece quando não há itens.
// "topo" fica em cima da lista (filtros, ouro), e "mensagem" embaixo do painel (o que aconteceu ou o motivo).
export default function ListaComDetalhe({ rotulo, itens, escolhido, aoEscolher, detalhe, vazio = 'Nada aqui.', topo, mensagem }) {
  return (
    <div className="lista-com-detalhe">
      {topo && <div className="lista-com-detalhe-topo">{topo}</div>}
      <div className="lista-com-detalhe-corpo">
        <ul className="lista-com-detalhe-itens" aria-label={rotulo}>
          {itens.length === 0 && <li className="lista-com-detalhe-vazio">{vazio}</li>}
          {itens.map((item) => (
            <li key={item.chave}>
              <button
                type="button"
                className={`lista-com-detalhe-item${item.nota ? ' lista-com-detalhe-item-nota' : ''}`}
                aria-pressed={item.chave === escolhido}
                onClick={() => aoEscolher(item.chave)}
              >
                <span className="lista-com-detalhe-nome">{item.titulo}</span>
                {item.direita !== undefined && <span className="lista-com-detalhe-direita">{item.direita}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="lista-com-detalhe-detalhe">{detalhe}</div>
      </div>
      {mensagem && (
        <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'} role="status">
          {mensagem.texto}
        </p>
      )}
    </div>
  )
}
