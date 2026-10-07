import { posicoes } from '../dados/posicoes.js'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'
import Botao from './Botao.jsx'
import { estiloPosicao } from './posicao.js'

// Fundo cinza de toda tela, com o nome dela e os botões dos cantos.
// semTitulo: para a Partida, onde o jogo ocupa a caixa inteira.
// configuracoesEm: outro lugar para o botão Configurações (na Partida, dentro da faixa do HUD).
export default function Tela({ className = '', semTitulo = false, configuracoesEm = posicoes.cantos.configuracoes, children }) {
  const { estado, acoes } = useJogo()
  const tela = telas[estado.tela]

  return (
    <div className={`tela ${className}`}>
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
