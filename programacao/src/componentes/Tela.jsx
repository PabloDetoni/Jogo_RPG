import { chavesDaArte, urlDaArte } from '../arte/indice.js'
import { posicoes } from '../dados/posicoes.js'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'
import { fundoDaTela } from '../regras/arte.js'
import Botao from './Botao.jsx'
import { estiloPosicao } from './posicao.js'

// Fundo de toda tela (cinza; com a arte, a imagem da tela: dados/arte.js, fundosDasTelas), com o nome dela e os botões
// dos cantos.
// semTitulo: para a Partida, onde o jogo ocupa a caixa inteira.
// configuracoesEm: outro lugar para o botão Configurações (na Partida, dentro da faixa do HUD).
// imagemDeFundo: um fundo escolhido pela própria tela (a cutscene troca as imagens), no lugar do da lista.
export default function Tela({ className = '', semTitulo = false, configuracoesEm = posicoes.cantos.configuracoes, imagemDeFundo = null, children }) {
  const { estado, acoes } = useJogo()
  const tela = telas[estado.tela]
  const fundo = imagemDeFundo ?? urlDaArte(fundoDaTela(chavesDaArte, estado.tela))

  return (
    <div className={`tela ${className}${fundo ? ' tela-com-fundo' : ''}`} style={fundo ? { backgroundImage: `url("${fundo}")` } : undefined}>
      {!semTitulo && (
        <h1 className="titulo posicionado" style={estiloPosicao(posicoes.titulo)}>
          {tela.nome}
        </h1>
      )}

      {children}

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
