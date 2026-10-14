import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Icone from '../../componentes/Icone.jsx'
import Tela from '../../componentes/Tela.jsx'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import { estiloPosicao } from '../../componentes/posicao.js'
import Simbolo from '../../componentes/ui/Simbolo.jsx'
import { iconeDoOuro } from '../../dados/arte.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { arteDoLugar, lugaresDoReino } from '../../dados/interface.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { missaoEmUmaLinha } from '../../regras/missoes.js'

const pos = posicoes.reino

// Um lugar do Reino (Fase 4.5): o botão com o símbolo do lugar e, logo embaixo, uma linha dizendo o que ele é. As posições
// continuam as de dados/posicoes.js (dependem da arte do Reino, que ainda vai chegar).
function Lugar({ id, em, aoAbrir, abaixo = em.grande ? 6.6 : 5.4, children }) {
  const lugar = lugaresDoReino[id]
  return (
    <>
      <Botao em={em} onClick={aoAbrir}>
        <Simbolo simbolo={lugar.simbolo} cor="var(--texto)" arte={arteDoLugar(id)} />
        {children}
      </Botao>
      <span className="legenda-do-lugar posicionado" style={estiloPosicao({ x: em.x, y: em.y + abaixo })}>
        {lugar.legenda}
      </span>
    </>
  )
}

// Hub do jogo (RF19). Salão da Glória e Configurações vêm dos cantos de <Tela>.
export default function Reino() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, progresso } = estado
  // O apelido vem da conta (Fase 2); o resto vem do save (TASK-071)
  const apelido = tipoJogador === 'conta' ? (estado.conta?.apelido ?? 'Conta') : 'Convidado'
  const lider = progresso.lider ? nomeDaClasse(progresso.lider) : 'nenhum'
  const missao = missaoEmUmaLinha(progresso) ?? 'nenhuma' // na de entrega, conta o que está na Mochila agora

  return (
    <Tela>
      {/* HUD do Reino: apelido, Líder, ouro e missão ativa (RF19) */}
      <Area em={pos.hud} className="hud-do-reino">
        {apelido} · Líder: {lider} · <Icone nome={iconeDoOuro} tamanho="1.1em" />
        Ouro: {progresso.ouro} · Missão: {missao}
      </Area>
      <Lugar id="guilda" em={pos.guilda} aoAbrir={() => acoes.irPara('guilda')}>
        Guilda
      </Lugar>
      <Lugar id="mercado" em={pos.mercado} aoAbrir={() => acoes.irPara('mercado')}>
        Mercado
      </Lugar>
      <Lugar id="forja" em={pos.forja} aoAbrir={() => acoes.irPara('forja')}>
        Forja
      </Lugar>
      <Lugar id="mochila" em={pos.mochila} aoAbrir={() => acoes.irPara('mochila')}>
        Mochila
      </Lugar>
      <Lugar id="jogar" em={pos.jogar} aoAbrir={() => {
          pedirTelaCheia(estado.preferencias.telaCheia)
          acoes.irPara('mapa')
        }}>
        Jogar
      </Lugar>
      <Lugar id="arvores" em={pos.arvores} aoAbrir={() => acoes.irPara('arvores')} abaixo={7.6}>
        Árvores de
        <br />
        Habilidades
      </Lugar>
    </Tela>
  )
}
