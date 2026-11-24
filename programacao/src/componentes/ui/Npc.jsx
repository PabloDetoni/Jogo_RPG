import { useMemo, useState } from 'react'
import Botao from '../Botao.jsx'
import { npcs } from '../../dados/npcs.js'
import { pecasDoNpc } from '../../regras/bonecos.js'
import { falaDaVez } from '../../regras/npcs.js'
import BonecoEmBlocos from './BonecoEmBlocos.jsx'
import BotaoDeAcao from './BotaoDeAcao.jsx'

// A última fala de cada NPC (para a próxima visita não repetir a mesma)
const ultimas = {}

// O NPC de um lugar do Reino (RF57, Parte 9): o boneco em blocos, o nome, o balão de fala e o menu.
// Na primeira visita, o balão é a apresentação (com "Continuar" entre as partes); o NPC fica conhecido ao chegar à
// última parte ou ao escolher uma opção do menu (que está sempre ali: não precisa ler tudo). Depois, uma fala sorteada.
// aoEscolher(aba): abre a tela na aba da opção; aoConhecer(): guarda no save; aoSair(): "Ir embora".
export default function Npc({ id, conhecido, aoConhecer, aoEscolher, aoSair }) {
  const npc = npcs[id]
  const [parte, setParte] = useState(0)
  // a fala sorteada da visita (uma vez, ao abrir a tela), lembrada para a próxima visita não repetir
  const [fala] = useState(() => {
    if (!conhecido) return null
    const sorteada = falaDaVez(npc, { conhecido: true, ultima: ultimas[id] ?? null })
    ultimas[id] = sorteada.indice
    return sorteada
  })
  const pecas = useMemo(() => pecasDoNpc(npc.aparencia, { lado: 'direita', fase: 0, andando: false }), [npc])
  const atual = conhecido && fala ? fala : falaDaVez(npc, { conhecido: false, parte })
  const ultimaParte = atual.apresentacao && atual.parte >= atual.partes - 1

  function continuar() {
    const proxima = parte + 1
    setParte(proxima)
    if (proxima >= npc.apresentacao.length - 1) aoConhecer()
  }
  function escolher(aba) {
    if (!conhecido) aoConhecer()
    aoEscolher(aba)
  }

  return (
    <div className="npc">
      <div className="npc-retrato">
        <BonecoEmBlocos pecas={pecas} rotulo={`${npc.nome}, ${npc.oficio}`} />
        <span className="npc-nome">{npc.nome}</span>
        <span className="npc-oficio">{npc.oficio}</span>
      </div>
      <div className="npc-conversa">
        <p className="npc-balao" aria-live="polite">
          {atual.texto}
        </p>
        {atual.apresentacao && !ultimaParte && (
          <Botao className="npc-continuar" onClick={continuar}>
            Continuar ({atual.parte + 1} de {atual.partes})
          </Botao>
        )}
        <div className="npc-menu">
          {npc.menu.map((opcao) => (
            <BotaoDeAcao key={opcao.id} acao={opcao.acao} onClick={() => escolher(opcao.aba)}>
              {opcao.rotulo}
            </BotaoDeAcao>
          ))}
          <Botao onClick={aoSair}>Ir embora</Botao>
        </div>
      </div>
    </div>
  )
}
