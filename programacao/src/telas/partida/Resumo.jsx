import { Fragment } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { biomas } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { resultados } from '../../dados/resultados.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.resumo

// Resumo da partida (RF51). Por enquanto os números são todos zero.
export default function Resumo() {
  const { estado, acoes } = useJogo()
  const resultado = resultados[estado.ultimoResultado]
  const bioma = biomas.find((b) => b.id === estado.partida.bioma)

  const linhas = [
    ['Motivo', resultado?.motivo ?? '—'],
    ['Bioma', bioma?.nome ?? '—'],
    ['Ouro ganho', 0],
    ['Taxa', '0%'],
    ['Ouro recebido', 0],
    ['XP', 0],
    ['Pontuação', 0],
    ['Monstros derrotados', 0],
    ['Itens coletados', 'nenhum'],
    ['Tempo total', '00:00'],
    ['Tempo ativo', '00:00'],
  ]

  return (
    <Tela>
      <Area em={pos.resultado} className={resultado?.amarelo ? 'resultado resultado-amarelo' : 'resultado'}>
        {resultado?.nome ?? 'Sem resultado'}
      </Area>
      <Area em={pos.detalhes}>
        <dl className="detalhes">
          {linhas.map(([rotulo, valor]) => (
            <Fragment key={rotulo}>
              <dt>{rotulo}</dt>
              <dd>{valor}</dd>
            </Fragment>
          ))}
        </dl>
      </Area>
      <Botao em={pos.jogarNovamente} onClick={() => acoes.irPara('mapa')}>
        Jogar novamente
      </Botao>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}
