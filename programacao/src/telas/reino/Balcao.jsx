import { useState } from 'react'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import GradeDeItens from '../../componentes/ui/GradeDeItens.jsx'
import Mudanca from '../../componentes/ui/Mudanca.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Selo from '../../componentes/ui/Selo.jsx'
import { itemDoCatalogo } from '../../dados/itens.js'
import { catalogoDoBeta, ordenarItens, origensDoItem } from '../../regras/interface.js'
import { precoDeVenda } from '../../regras/mercado.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

// O balcão do Mercado e da Forja (Fase 4.5): a grade à esquerda (com o ouro sempre à vista) e, à direita, o item escolhido
// com o que muda antes de confirmar. As regras são as de regras/mercado.js e regras/forja.js (pelas operações de
// regras/reino.js); a prévia da mesma regra desativa o botão com o motivo.

// O ouro do jogador, sempre à vista no balcão
export function OuroAVista({ ouro }) {
  return (
    <span className="ouro-a-vista" aria-label={`Seu ouro: ${ouro}`}>
      Seu ouro: {ouro}
    </span>
  )
}

// Comprar: as ofertas em grade (o preço embaixo de cada uma; apagada se falta ouro) e, à direita, comprar 1 (ou mais),
// com o ouro antes e depois. operacao(id, quantidade) devolve os argumentos da operação do Reino.
export function ComprarNoBalcao({ ofertas, operacao, quantidades = [1], titulo, topo, legenda }) {
  const { progresso, mensagem, setMensagem, fazer, previa } = useNoReino()
  const [escolhido, setEscolhido] = useState(null)
  const atual = ofertas.find((oferta) => oferta.id === escolhido) ?? ofertas[0]
  const preco = atual ? itemDoCatalogo(atual.id).preco : 0

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo={titulo} className="balcao-grade">
          <div className="balcao-topo">
            <OuroAVista ouro={progresso.ouro} />
            {topo}
          </div>
          <GradeDeItens
            comFiltros={false}
            rotulo={titulo}
            itens={ofertas.map((oferta) => {
              const custo = itemDoCatalogo(oferta.id).preco
              return {
                id: oferta.id,
                rotulo: `${oferta.rotativa ? '★ ' : ''}${custo}`,
                apagado: custo > progresso.ouro,
                titulo: `${itemDoCatalogo(oferta.id).nome}${oferta.rotativa ? ' ★' : ''}: ${custo} de ouro`,
              }
            })}
            escolhido={atual?.id}
            aoEscolher={(id) => {
              setEscolhido(id)
              setMensagem(null)
            }}
            vazio="Nada à venda agora."
          />
          {legenda && <p className="nota">{legenda}</p>}
        </Painel>
        <Painel titulo="Comprar" className="balcao-detalhe">
          {atual && (
            <DetalheDoItem id={atual.id}>
              {atual.rotativa && <Selo cor="var(--destaque)">★ oferta da vez</Selo>}
              <p className="nota">Você tem {quantidadeNaMochila(progresso.mochila, atual.id)} na Mochila.</p>
              {progresso.ouro >= preco && <Mudanca nome="Seu ouro:" antes={progresso.ouro} depois={progresso.ouro - preco} />}
              <div className="botoes-em-linha">
                {quantidades.map((quantidade) => {
                  const resultado = previa(...operacao(atual.id, quantidade))
                  return (
                    <BotaoDeAcao
                      key={quantidade}
                      acao="comprar"
                      desativado={!resultado.ok}
                      motivo={quantidade === quantidades[0] ? resultado.motivo : undefined}
                      onClick={() => fazer(...operacao(atual.id, quantidade))}
                    >
                      {quantidade === 1 ? `Comprar por ${preco} de ouro` : `Comprar ${quantidade} por ${preco * quantidade}`}
                    </BotaoDeAcao>
                  )
                })}
              </div>
            </DetalheDoItem>
          )}
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}

// Vender: os itens que este balcão compra, em grade com o preço de venda em cada um, e vender 1 ou todos com o ouro antes e
// depois. operacao(id, quantidade) devolve os argumentos da operação do Reino.
export function VenderNoBalcao({ itens, operacao, titulo, nota, vazio }) {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const ordenados = ordenarItens(itens)
  const [escolhido, setEscolhido] = useState(null)
  const atual = ordenados.find((item) => item.id === escolhido) ?? ordenados[0]
  const preco = atual ? precoDeVenda(atual.id) : 0

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo={titulo} className="balcao-grade">
          <div className="balcao-topo">
            <OuroAVista ouro={progresso.ouro} />
            <span className="nota">{nota}</span>
          </div>
          <GradeDeItens
            rotulo={titulo}
            itens={ordenados.map((item) => ({ id: item.id, quantidade: item.quantidade, rotulo: `+${precoDeVenda(item.id)}` }))}
            escolhido={atual?.id}
            aoEscolher={(id) => {
              setEscolhido(id)
              setMensagem(null)
            }}
            vazio={vazio}
          />
        </Painel>
        <Painel titulo="Vender" className="balcao-detalhe">
          {atual ? (
            <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
              <Mudanca nome="Seu ouro:" antes={progresso.ouro} depois={progresso.ouro + preco} />
              <div className="botoes-em-linha">
                <BotaoDeAcao acao="vender" onClick={() => fazer(...operacao(atual.id, 1))}>
                  Vender 1 por {preco}
                </BotaoDeAcao>
                {atual.quantidade > 1 && (
                  <BotaoDeAcao acao="vender" onClick={() => fazer(...operacao(atual.id, atual.quantidade))}>
                    Vender todos ({atual.quantidade}) por {preco * atual.quantidade}
                  </BotaoDeAcao>
                )}
              </div>
            </DetalheDoItem>
          ) : (
            <p className="vazio">{vazio}</p>
          )}
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}

// Catálogo: tudo o que existe no beta, com filtros; o que o jogador ainda não teve aparece apagado (silhueta), com de onde
// vem, para ele saber o que procurar
export function Catalogo() {
  const { progresso } = useNoReino()
  const vistos = new Set(progresso.itensVistos ?? [])
  const todos = catalogoDoBeta()
  const [escolhido, setEscolhido] = useState(null)
  const atual = todos.find((item) => item.id === escolhido) ?? todos[0]
  const encontrados = todos.filter((item) => vistos.has(item.id)).length

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo="Catálogo do beta" className="balcao-grade">
          <p className="nota">
            Você já encontrou <strong>{encontrados}</strong> de {todos.length} itens. Os apagados ainda não apareceram para você.
          </p>
          <GradeDeItens
            rotulo="Catálogo do beta"
            itens={todos.map((item) => ({ id: item.id, silhueta: !vistos.has(item.id) }))}
            escolhido={atual?.id}
            aoEscolher={setEscolhido}
          />
        </Painel>
        <Painel titulo="Onde conseguir" className="balcao-detalhe">
          {atual && (
            <DetalheDoItem id={atual.id} silhueta={!vistos.has(atual.id)}>
              <div>
                <strong>Vem de:</strong>
                <ul className="lista-simples">
                  {origensDoItem(atual.id).map((origem) => (
                    <li key={origem}>{origem}</li>
                  ))}
                </ul>
              </div>
            </DetalheDoItem>
          )}
        </Painel>
      </div>
    </div>
  )
}
