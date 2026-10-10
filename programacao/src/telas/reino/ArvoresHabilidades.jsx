import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Pentagono from '../../componentes/Pentagono.jsx'
import Tela from '../../componentes/Tela.jsx'
import { atributoMaximo } from '../../dados/balanceamento.js'
import { atributos as listaDeAtributos, classes, corDaClasseCss } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { pontosDistribuidos } from '../../regras/arvores.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import { xpParaSubir } from '../../regras/xp.js'
import ArvoreDeHabilidades from './ArvoreDeHabilidades.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.arvores

// Uma aba por classe. Só os personagens permanentes têm árvore (Conceito §10.6). Em cada uma: os atributos (pentágono,
// pontos livres para distribuir e o pergaminho, TASK-076) e as habilidades (TASK-077).
export default function ArvoresHabilidades() {
  const { estado, acoes } = useJogo()
  const abas = classes.map((classe) => {
    const personagem = estado.progresso.personagens.find((p) => p.classe === classe.id)
    return {
      id: classe.id,
      nome: classe.nome,
      desativada: !personagem,
      conteudo: personagem && <FichaDoPersonagem key={classe.id} personagem={personagem} />,
    }
  })

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} semAbas="Nenhum personagem permanente ainda." noTopo />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}

function FichaDoPersonagem({ personagem }) {
  const [parte, setParte] = useState('atributos')
  const proximo = xpParaSubir(personagem.nivel)
  return (
    <div className="ficha-da-arvore">
      <div className="botoes-em-linha ficha-da-arvore-topo">
        <Botao selecionado={parte === 'atributos'} onClick={() => setParte('atributos')}>
          Atributos
        </Botao>
        <Botao selecionado={parte === 'habilidades'} onClick={() => setParte('habilidades')}>
          Habilidades
        </Botao>
        <span>
          Nível <strong>{personagem.nivel}</strong>
          {Number.isFinite(proximo) ? ` · XP ${personagem.xp} / ${proximo}` : ' · nível máximo'}
        </span>
      </div>
      {parte === 'atributos' ? <Atributos personagem={personagem} /> : <ArvoreDeHabilidades personagem={personagem} />}
    </div>
  )
}

// Distribuir os pontos livres (TASK-076): + e − montam a distribuição, o pentágono já mostra como fica, e "Aplicar"
// fixa (depois, só o pergaminho devolve). O pergaminho pede confirmação.
function Atributos({ personagem }) {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [pendente, setPendente] = useState({})
  const [confirmandoPergaminho, setConfirmandoPergaminho] = useState(false)
  const usados = Object.values(pendente).reduce((soma, quantos) => soma + quantos, 0)
  const livres = personagem.pontosDeAtributo - usados
  const valores = Object.fromEntries(listaDeAtributos.map(({ id }) => [id, personagem.atributos[id] + (pendente[id] ?? 0)]))
  const maior = Math.max(...Object.values(valores))
  const escala = Math.max(25, Math.ceil(maior / 25) * 25) // de 25 em 25: nem minúsculo no começo, nem estourado depois
  const pergaminhos = quantidadeNaMochila(progresso.mochila, 'pergaminhoDeRedefinicao')
  const devolveria = pontosDistribuidos(personagem)

  function mudar(id, quanto) {
    setMensagem(null)
    setPendente((atual) => ({ ...atual, [id]: Math.max(0, (atual[id] ?? 0) + quanto) }))
  }
  function aplicar() {
    if (fazer('distribuirPontos', personagem.classe, pendente)) setPendente({})
  }
  function usarPergaminho() {
    fazer('usarPergaminho', personagem.classe)
    setConfirmandoPergaminho(false)
    setPendente({})
  }

  return (
    <div className="detalhe-da-classe">
      <Pentagono valores={valores} maximo={escala} cor={corDaClasseCss(personagem.classe)} />
      <div className="texto-da-classe atributos-da-arvore">
        <p>
          Pontos livres: <strong>{livres}</strong> de atributo · {personagem.pontosDeHabilidade} de habilidade
        </p>
        <ul className="lista-de-contratos">
          {listaDeAtributos.map(({ id, nome }) => (
            <li key={id}>
              <span>
                {nome} <strong>{valores[id]}</strong>
                {pendente[id] ? <span className="nota"> (+{pendente[id]})</span> : null}
              </span>
              <span className="botoes-em-linha">
                <Botao desativado={!pendente[id]} onClick={() => mudar(id, -1)}>
                  −
                </Botao>
                <Botao desativado={livres <= 0 || valores[id] >= atributoMaximo} onClick={() => mudar(id, 1)}>
                  +
                </Botao>
              </span>
            </li>
          ))}
        </ul>
        <div className="botoes-em-linha">
          <Botao desativado={usados === 0} onClick={aplicar}>
            Aplicar {usados > 0 ? `(${usados})` : ''}
          </Botao>
          <Botao desativado={usados === 0} onClick={() => setPendente({})}>
            Desfazer
          </Botao>
        </div>
        <p className="nota">Os pontos aplicados ficam fixos; só o pergaminho de redefinição (Mercado) os devolve.</p>
        {confirmandoPergaminho ? (
          <div className="confirmacao">
            <p>
              Usar 1 pergaminho e devolver {devolveria} pontos? Os atributos voltam aos iniciais; as habilidades não mudam.
            </p>
            <div className="botoes-em-linha">
              <Botao onClick={usarPergaminho}>Sim, usar</Botao>
              <Botao onClick={() => setConfirmandoPergaminho(false)}>Cancelar</Botao>
            </div>
          </div>
        ) : (
          <Botao onClick={() => setConfirmandoPergaminho(true)} desativado={pergaminhos === 0 || devolveria === 0}>
            Usar pergaminho (tem {pergaminhos})
          </Botao>
        )}
        {mensagem && (
          <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'} role="status">
            {mensagem.texto}
          </p>
        )}
      </div>
    </div>
  )
}
