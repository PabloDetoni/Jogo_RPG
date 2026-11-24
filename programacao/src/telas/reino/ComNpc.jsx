import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Npc from '../../componentes/ui/Npc.jsx'
import { npcDoLugar, npcs } from '../../dados/npcs.js'
import { useJogo } from '../../estado/contexto.js'
import { useNoReino } from './useNoReino.js'

// Um lugar do Reino com NPC (RF57, Parte 9): ao entrar, a conversa com o NPC; o menu dele abre a tela na aba da opção
// escolhida, e o botão "Falar com ..." volta à conversa. "Ir embora" (no NPC) e "Voltar ao Reino" (na tela) voltam ao
// Reino. O NPC conhecido fica no save (npcsConhecidos): a apresentação só aparece na primeira visita.
export default function ComNpc({ lugar, pos, abas, noTopo = false }) {
  const { acoes } = useJogo()
  const { estado, fazer } = useNoReino()
  const id = npcDoLugar(lugar)
  const [aba, setAba] = useState(null) // null: conversando com o NPC
  const conhecido = (estado.progresso.npcsConhecidos ?? []).includes(id)

  if (aba === null) {
    return (
      <Area em={pos.npc} className="area-do-npc">
        <Npc id={id} conhecido={conhecido} aoConhecer={() => fazer('conhecerNpc', id)} aoEscolher={setAba} aoSair={() => acoes.irPara('reino')} />
      </Area>
    )
  }
  return (
    <>
      <ConteudoComAbas pos={pos} abas={abas} inicial={aba} noTopo={noTopo} />
      <Botao em={pos.falarComNpc} onClick={() => setAba(null)}>
        Falar com {npcs[id].nome}
      </Botao>
    </>
  )
}
