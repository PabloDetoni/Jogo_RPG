import { conquistas } from '../../dados/conquistas.js'
import { useJogo } from '../../estado/contexto.js'
import { conquistaConcluida, progressoDaConquista } from '../../regras/conquistas.js'

// Aba Conquistas do Salão da Glória (TASK-103; RF17, UC13): para quem já está jogando, convidado ou conta. Cada uma com
// o progresso, a recompensa e a marca de concluída (as concluídas vêm primeiro).
export function ConquistasDoJogador() {
  const { estado } = useJogo()
  const { progresso } = estado
  const lista = [...conquistas].sort((a, b) => Number(conquistaConcluida(progresso, b.id)) - Number(conquistaConcluida(progresso, a.id)))
  const feitas = conquistas.filter((uma) => conquistaConcluida(progresso, uma.id)).length

  return (
    <div className="conquistas">
      <p>
        Concluídas: <strong>{feitas}</strong> de {conquistas.length}
      </p>
      <ul className="lista-de-conquistas">
        {lista.map((conquista) => {
          const feita = conquistaConcluida(progresso, conquista.id)
          const { atual, meta } = progressoDaConquista(progresso, conquista)
          return (
            <li key={conquista.id} className={feita ? 'conquista-feita' : ''}>
              <span className="conquista-nome">
                {feita ? '✔ ' : ''}
                {conquista.nome}
              </span>
              <span className="nota">{conquista.descricao}</span>
              <span className="conquista-barra" aria-label={`${atual} de ${meta}`}>
                <span style={{ width: `${Math.round((atual / meta) * 100)}%` }} />
              </span>
              <span className="nota">
                {atual.toLocaleString('pt-BR')}/{meta.toLocaleString('pt-BR')}
                {conquista.recompensa?.ouro ? ` · ${conquista.recompensa.ouro.toLocaleString('pt-BR')} de ouro` : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
