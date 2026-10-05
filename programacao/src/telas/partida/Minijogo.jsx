import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.minijogo

// Usada pela Fazenda, pela Mina e pelo Lago. O nome vem de dados/telas.js.
// Ao sair do minijogo, volta ao Mapa, de onde ele foi aberto
// (decisão de 04/10/2026; o diagrama de Partida ainda diz "Voltar ao Reino").
export default function Minijogo() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.mensagem}>Minijogo vazio por enquanto. Não conta como partida.</Area>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}
