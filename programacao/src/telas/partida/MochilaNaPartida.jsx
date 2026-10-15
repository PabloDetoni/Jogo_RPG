import Barra from '../../componentes/ui/Barra.jsx'
import GradeComMao from '../../componentes/ui/GradeComMao.jsx'
import { mundo } from '../../dados/balanceamento.js'
import { gradeComMao } from '../../dados/interface.js'
import { usavelNaPartida } from '../../dados/itens.js'

const { colunas, tamanho } = gradeComMao.partida
const segundosNoChao = Math.round(mundo.coleta.msDoItemDropado / 1000)

// Mochila da partida (TASK-047, RF41; ajustes da partida, 14/10): Tab abre no meio da tela, com o mapa um pouco escuro
// atrás. O jogo NÃO pausa, mas o Líder fica parado (não anda, não ataca, não coleta). Mexe nos itens como no Minecraft
// (componentes/ui/GradeComMao.jsx): clique pega a pilha, botão direito a metade, clique noutro quadradinho põe ou troca;
// clique fora da janela com item na mão joga ele no chão perto do Líder (some em 30 s, sem confirmação); fechar com
// item na mão devolve. Com o mouse em cima de um consumível: E usa no Líder, R no aliado que mais precisa.
// A arrumação (grade) fica guardada em Partida.jsx enquanto durar a partida; as teclas também ficam lá.
export default function MochilaNaPartida({ mochila, grade, aoSoltarNoChao }) {
  const peso = mochila?.peso ?? 0
  const capacidade = mochila?.capacidade ?? 0

  // Clique fora da janela (no mapa escurecido): o item da mão vai para o chão; sem item na mão, nada
  function cliqueFora(evento) {
    evento.preventDefault()
    if (!grade.estado.mao) return
    const noChao = grade.soltar()
    if (noChao) aoSoltarNoChao(noChao)
  }

  return (
    <div className="janela-fundo janela-fundo-mochila" onClick={cliqueFora} onContextMenu={cliqueFora}>
      <div
        className="janela janela-mochila"
        role="dialog"
        aria-label="Mochila"
        onClick={(evento) => evento.stopPropagation()}
        onContextMenu={(evento) => {
          evento.preventDefault()
          evento.stopPropagation()
        }}
      >
        <h2>MOCHILA</h2>
        <Barra fracao={peso / Math.max(1, capacidade)} texto={`Peso ${peso} / ${capacidade}`} alerta={peso >= capacidade} rotulo="Peso da mochila" />
        {!mochila?.itens?.length && <p className="vazio">Vazia. Itens do chão: chegue perto e aperte E (com esta janela fechada).</p>}
        <GradeComMao
          grade={grade}
          tamanho={tamanho}
          colunas={colunas}
          rotulo="Itens da mochila"
          dica={(_slot, item) => (usavelNaPartida(item) ? 'E: usar no Líder · R: no aliado que mais precisa' : 'Não se usa na partida: leve para o Reino.')}
        />
        <p className="nota mochila-teclas">
          Clique: pega a pilha · botão direito: pega a metade (ou põe 1) · clique fora da janela: joga no chão (some em {segundosNoChao} s) · Tab ou Esc: fecha · o
          jogo não pausa
        </p>
      </div>
    </div>
  )
}
