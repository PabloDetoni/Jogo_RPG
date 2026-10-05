import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { nomeDaClasse } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.preparacao

// Escolher o Líder (só permanentes) e a mochila da partida (RF33).
// Voltar daqui não conta como partida: ao Mapa para trocar de bioma, ou ao Reino para desistir.
// (O "Voltar ao Mapa" é decisão de 04/10/2026; o diagrama de Partida só tem "Voltar ao Reino".)
export default function Preparacao() {
  const { estado, acoes } = useJogo()
  const permanentes = estado.personagens.filter((p) => p.permanente)
  const temLider = permanentes.some((p) => p.classe === estado.partida.lider)

  return (
    <Tela>
      <Area em={pos.tituloLider}>Escolha o Líder</Area>
      <Area em={pos.lideres} className="lista">
        {permanentes.map((p) => (
          <Botao
            key={p.classe}
            selecionado={estado.partida.lider === p.classe}
            onClick={() => acoes.escolherLider(p.classe)}
          >
            {nomeDaClasse(p.classe)}
          </Botao>
        ))}
        {permanentes.length === 0 && 'Nenhum personagem permanente.'}
      </Area>
      <Area em={pos.mochila}>Mochila da partida</Area>
      <Botao em={pos.comecarPartida} desativado={!temLider} onClick={acoes.comecarPartida}>
        Começar partida
      </Botao>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}
