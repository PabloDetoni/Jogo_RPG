import { useState } from 'react'
import { chavesDaArte, urlDaArte } from '../arte/indice.js'
import { ajudaDasTelas, dicasDasTelas } from '../dados/ajuda.js'
import { posicoes } from '../dados/posicoes.js'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'
import { fundoDaTela } from '../regras/arte.js'
import { dicaVisivel, trilhaDaTela } from '../regras/interface.js'
import Botao from './Botao.jsx'
import { estiloPosicao } from './posicao.js'
import { ContextoDaTrilha } from './trilha.js'

const telasComTransicao = new Set(['reino', 'mapa', 'preparacao', 'partida', 'resumo'])

// Fundo de toda tela (cinza; com a arte, a imagem da tela: dados/arte.js, fundosDasTelas), com o nome dela e os botões
// dos cantos. Ajustes de 14/10: a trilha no alto ("Reino › Forja › Equipar"; cada passo de cima leva até ele) e a dica da
// primeira visita (dados/ajuda.js, dicasDasTelas), que fecha com "Entendi" ou Esc; o "?" reabre.
// semTitulo: para a Partida, onde o jogo ocupa a caixa inteira.
// configuracoesEm: outro lugar para o botão Configurações (na Partida, dentro da faixa do HUD).
// imagemDeFundo: um fundo escolhido pela própria tela (a cutscene troca as imagens), no lugar do da lista.
// dicaEm: outro lugar para a dica da primeira visita (na Partida, que não tem título, ela fica em cima da barra de ações).
export default function Tela({ className = '', semTitulo = false, configuracoesEm = posicoes.cantos.configuracoes, imagemDeFundo = null, dicaEm = null, children }) {
  const { estado, acoes } = useJogo()
  const tela = telas[estado.tela]
  const fundo = imagemDeFundo ?? urlDaArte(fundoDaTela(chavesDaArte, estado.tela))
  const [aba, setAba] = useState(null)
  const trilha = trilhaDaTela(estado.tela, estado.anteriores, aba)
  const dica = dicasDasTelas[estado.tela]
  const mostrarDica = (!semTitulo || dicaEm) && estado.janelas.length === 0 && dicaVisivel(estado.tela, estado.preferencias?.dicasVistas, estado.dicaReaberta, Boolean(dica))
  const temAjuda = Boolean(ajudaDasTelas[estado.tela])
  // Transição suave (ajustes de 14/10): o Reino, o Mapa, a Preparação, a partida e o Resumo entram num fade curto
  const comTransicao = telasComTransicao.has(estado.tela)

  return (
    <div className={`tela ${className}${fundo ? ' tela-com-fundo' : ''}${comTransicao ? ' tela-com-transicao' : ''}`} style={fundo ? { backgroundImage: `url("${fundo}")` } : undefined}>
      {!semTitulo && trilha.length > 1 && (
        <nav className="trilha posicionado" style={estiloPosicao(posicoes.trilha)} aria-label="Onde você está">
          {trilha.map((passo, indice) => {
            const atual = indice === trilha.length - 1
            return (
              <span key={`${passo.id ?? 'aba'}-${passo.nome}`} className="trilha-passo">
                {indice > 0 && <span className="trilha-separador" aria-hidden="true">›</span>}
                {passo.id && !atual && passo.id !== estado.tela ? (
                  <button type="button" className="trilha-link" onClick={() => acoes.irPara(passo.id)}>
                    {passo.nome}
                  </button>
                ) : (
                  <span aria-current={atual ? 'page' : undefined}>{passo.nome}</span>
                )}
              </span>
            )
          })}
        </nav>
      )}
      {!semTitulo && (
        <h1 className="titulo posicionado" style={estiloPosicao(posicoes.titulo)}>
          {tela.nome}
        </h1>
      )}

      <ContextoDaTrilha.Provider value={setAba}>{children}</ContextoDaTrilha.Provider>

      {mostrarDica && (
        <div className={`dica-da-tela posicionado${dicaEm ? ' dica-da-tela-leve' : ''}`} style={estiloPosicao(dicaEm ?? posicoes.dica)} role="note" aria-label={`Dica: ${tela.nome}`}>
          <p>{dica}</p>
          <div className="dica-da-tela-botoes">
            <button type="button" className="botao" onClick={acoes.fecharDica}>
              Entendi
            </button>
            {temAjuda && (
              <button type="button" className="botao botao-discreto" onClick={() => acoes.abrirJanela('ajuda')}>
                Como funciona
              </button>
            )}
          </div>
        </div>
      )}

      {/* O "?" (Fase 4.5; ajustes de 14/10): reabre a dica desta tela; sem dica, abre "Como funciona" (dados/ajuda.js) */}
      {!semTitulo && (dica || temAjuda) && (
        <button
          type="button"
          className="botao botao-ajuda posicionado"
          style={estiloPosicao(posicoes.cantos.ajuda)}
          onClick={() => (dica && !mostrarDica ? acoes.reabrirDica() : acoes.abrirJanela('ajuda'))}
          aria-label="Dica e como funciona esta tela"
          title="Dica e como funciona esta tela"
        >
          ?
        </button>
      )}

      {!tela.soConfiguracoes && (
        <Botao em={posicoes.cantos.salaoGloria} onClick={() => acoes.irPara('salaoGloria')}>
          Salão da Glória
        </Botao>
      )}
      <Botao em={configuracoesEm} onClick={() => acoes.abrirJanela('configuracoes')}>
        Configurações
      </Botao>
    </div>
  )
}
