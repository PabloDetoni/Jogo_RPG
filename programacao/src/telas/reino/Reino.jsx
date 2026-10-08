import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { nomeDaClasse } from '../../dados/classes.js'
import { descreverMissao } from '../../dados/missoes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.reino

// Hub do jogo (RF19). Salão da Glória e Configurações vêm dos cantos de <Tela>.
export default function Reino() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, progresso } = estado
  // O apelido vem da conta (Fase 2); o resto vem do save (TASK-071)
  const apelido = tipoJogador === 'conta' ? (estado.conta?.apelido ?? 'Conta') : 'Convidado'
  const lider = progresso.lider ? nomeDaClasse(progresso.lider) : 'nenhum'
  const missao = descreverMissao(progresso.missaoAtiva) ?? 'nenhuma'

  return (
    <Tela>
      {/* HUD do Reino: apelido, Líder, ouro e missão ativa (RF19) */}
      <Area em={pos.hud}>
        {apelido} · Líder: {lider} · Ouro: {progresso.ouro} · Missão: {missao}
      </Area>
      <Botao em={pos.guilda} onClick={() => acoes.irPara('guilda')}>
        Guilda
      </Botao>
      <Botao em={pos.mercado} onClick={() => acoes.irPara('mercado')}>
        Mercado
      </Botao>
      <Botao em={pos.forja} onClick={() => acoes.irPara('forja')}>
        Forja
      </Botao>
      <Botao em={pos.mochila} onClick={() => acoes.irPara('mochila')}>
        Mochila
      </Botao>
      <Botao em={pos.jogar} onClick={() => acoes.irPara('mapa')}>
        Jogar
      </Botao>
      <Botao em={pos.arvores} onClick={() => acoes.irPara('arvores')}>
        Árvores de
        <br />
        Habilidades
      </Botao>
    </Tela>
  )
}
