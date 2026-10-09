import { Fragment } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { biomas } from '../../dados/biomas.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { resultados } from '../../dados/resultados.js'
import { useJogo } from '../../estado/contexto.js'
import { relogio } from './formato.js'

const pos = posicoes.resumo

// Resumo da partida (RF51): resultado, motivo, ouro (ganho, taxa e recebido), XP de cada personagem e quem subiu de
// nível, pontuação, monstros, itens e os tempos. As contas vêm do fim da partida (estado/estadoDoJogo.js).
// "Jogar novamente" volta ao Mapa sem recarregar a página.
export default function Resumo() {
  const { estado, acoes } = useJogo()
  const fim = estado.ultimoResultado
  const resultado = fim ? resultados[fim.resultado] : undefined
  const bioma = biomas.find((b) => b.id === fim?.bioma)
  const grandeVitoria = fim?.resultado === 'grandeVitoria'

  const linhas = [
    ['Motivo', fim?.motivo ?? resultado?.motivo ?? '—'],
    ['Bioma', bioma?.nome ?? (fim?.bioma === 'arena' ? 'Arena de teste' : '—')],
    ['Ouro ganho', fim?.ouroGanho ?? 0],
    ['Taxa', `${fim?.taxa ?? 0}% (−${fim?.taxaEmOuro ?? 0} de ouro)`],
    ['Ouro recebido', `${fim?.ouroRecebido ?? 0}${grandeVitoria ? ' (com +10%)' : ''}`],
    ['Pontuação', `${fim?.pontuacaoFinal ?? 0} (base ${fim?.pontuacaoBase ?? 0})`],
    ['Monstros derrotados', fim?.monstros ?? 0],
    ['Itens coletados', fim?.itens?.length ? fim.itens.length : 'nenhum'],
    ['Exploração', fim?.areasNovas?.length ? `${fim.areasNovas.length} área${fim.areasNovas.length === 1 ? '' : 's'} nova${fim.areasNovas.length === 1 ? '' : 's'} (+${fim.xpDeExploracao} XP)` : 'nenhuma área nova'],
    ['Tempo total', relogio(fim?.segundosTotais ?? 0)],
    ['Tempo ativo', relogio(fim?.segundosAtivos ?? 0)],
    ['Perdidos', fim?.perdidos?.length ? fim.perdidos.map(nomeDaClasse).join(', ') : 'nenhum'],
  ]
  const personagens = fim?.personagens ?? []

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
        {personagens.length > 0 && (
          <div className="xp-do-resumo">
            <strong>XP</strong>
            {personagens.map((personagem) => (
              <span key={personagem.classe} className={personagem.niveisGanhos > 0 ? 'xp-subiu' : undefined}>
                {nomeDaClasse(personagem.classe)}: +{personagem.xp}
                {personagem.niveisGanhos > 0 ? ` · subiu para o nível ${personagem.nivel}!` : ` · nível ${personagem.nivel}`}
              </span>
            ))}
          </div>
        )}
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
