import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { biomas, pontosDePartida } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.pontoPartida

// Onde nascer (RF32). As regiões só liberam depois de descobertas.
export default function PontoPartida() {
  const { estado, acoes } = useJogo()
  const bioma = biomas.find((b) => b.id === estado.partida.bioma)

  return (
    <Tela>
      <Area em={pos.bioma}>Bioma: {bioma?.nome ?? 'nenhum'}</Area>
      {pontosDePartida.map((ponto) => (
        <Botao
          key={ponto.id}
          em={pos[ponto.id]}
          desativado={!ponto.sempreLiberado}
          onClick={() => acoes.escolherPontoPartida(ponto.id)}
        >
          {ponto.sempreLiberado ? ponto.nome : `${ponto.nome} (não descoberta)`}
        </Botao>
      ))}
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}
