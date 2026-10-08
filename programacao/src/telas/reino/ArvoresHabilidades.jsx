import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Pentagono from '../../componentes/Pentagono.jsx'
import Tela from '../../componentes/Tela.jsx'
import { classes, corDaClasseCss } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { xpParaSubir } from '../../regras/xp.js'

const pos = posicoes.arvores

// Uma aba por classe. Só os personagens permanentes têm árvore (Conceito §10.6).
// Por enquanto cada aba mostra o pentágono dos atributos, o nível, o XP e os pontos livres (TASK-071);
// distribuir os pontos e evoluir as habilidades vêm na Fase 4 (TASK-076 e TASK-077).
export default function ArvoresHabilidades() {
  const { estado, acoes } = useJogo()
  const abas = classes.map((classe) => {
    const personagem = estado.progresso.personagens.find((p) => p.classe === classe.id)
    return {
      id: classe.id,
      nome: classe.nome,
      desativada: !personagem,
      conteudo: personagem && <FichaDoPersonagem personagem={personagem} />,
    }
  })

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} semAbas="Nenhum personagem permanente ainda." />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}

function FichaDoPersonagem({ personagem }) {
  // Escala de 25 em 25, para o pentágono não ficar minúsculo no começo nem estourar depois
  const maior = Math.max(...Object.values(personagem.atributos))
  const escala = Math.max(25, Math.ceil(maior / 25) * 25)
  const proximo = xpParaSubir(personagem.nivel)
  return (
    <div className="detalhe-da-classe">
      <Pentagono valores={personagem.atributos} maximo={escala} cor={corDaClasseCss(personagem.classe)} />
      <div className="texto-da-classe">
        <p>
          Nível <strong>{personagem.nivel}</strong>
          {Number.isFinite(proximo) ? ` · XP ${personagem.xp} / ${proximo}` : ' · nível máximo'}
        </p>
        <p>
          Pontos livres: {personagem.pontosDeAtributo} de atributo e {personagem.pontosDeHabilidade} de habilidade
        </p>
        <p className="nota">Distribuir os pontos e evoluir as habilidades vem depois (TASK-076 e TASK-077).</p>
      </div>
    </div>
  )
}
