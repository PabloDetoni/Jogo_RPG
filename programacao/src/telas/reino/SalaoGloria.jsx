import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.salaoGloria

// Abas do ranking (RF15): visíveis para todos, até sem login.
const abasRanking = [
  { id: 'melhoresPontuacoes', nome: 'Melhores pontuações' },
  { id: 'nivelTotal', nome: 'Nível total' },
  { id: 'porClasse', nome: 'Por classe' },
  { id: 'ouro', nome: 'Ouro' },
  { id: 'monstros', nome: 'Monstros' },
  { id: 'maiorDuracao', nome: 'Maior duração' },
]

// Salão da Glória: ranking, histórico e conquistas num lugar só.
export default function SalaoGloria() {
  const { estado, acoes } = useJogo()
  const { tipoJogador } = estado

  const abas = [...abasRanking]
  // Histórico: só o próprio jogador com conta (RF16)
  if (tipoJogador === 'conta') abas.push({ id: 'historico', nome: 'Histórico' })
  // Conquistas: de quem já está jogando, convidado ou conta
  if (tipoJogador !== 'nenhum') abas.push({ id: 'conquistas', nome: 'Conquistas' })

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} />
      <Botao em={pos.voltar} onClick={acoes.voltar} desativado={estado.anteriores.length === 0}>
        Voltar
      </Botao>
    </Tela>
  )
}
