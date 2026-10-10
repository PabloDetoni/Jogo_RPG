import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { biomas } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.mapa

// Mapa em ovo (RF30). Os minijogos do Planalto só abrem por aqui (RF54).
export default function Mapa() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.planalto}>Planalto</Area>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
      <Botao em={pos.fazenda} onClick={() => acoes.irPara('fazenda')}>
        Fazenda
      </Botao>
      <Botao em={pos.lago} onClick={() => acoes.irPara('lago')}>
        Lago
      </Botao>
      <Botao em={pos.mina} onClick={() => acoes.irPara('mina')}>
        Mina
      </Botao>
      {/* Só no npm run dev: a arena da Fase 1, para testar o combate (e o roteiro do navegador) */}
      {import.meta.env.DEV && (
        <Botao em={pos.arenaDeTeste} onClick={() => acoes.escolherBioma('arena')}>
          Arena de teste
        </Botao>
      )}
      {biomas.map((bioma) => (
        <Botao
          key={bioma.id}
          em={pos[bioma.id]}
          desativado={!bioma.noBeta}
          onClick={() => acoes.escolherBioma(bioma.id)}
        >
          {bioma.noBeta ? bioma.nome : `${bioma.nome} (fora do beta)`}
        </Botao>
      ))}
    </Tela>
  )
}
