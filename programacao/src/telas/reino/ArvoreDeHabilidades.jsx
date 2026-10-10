import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import { arvoreDaClasse } from '../../dados/arvores.js'
import { evolucaoDasHabilidades } from '../../dados/balanceamento.js'
import { habilidadesAtivasNoMaximo, nivelMaximoDaHabilidade } from '../../dados/regras.js'
import { estadoDaHabilidade, numerosNoNivel, porNaTecla, requisitoDe } from '../../regras/habilidadesDaArvore.js'
import { useNoReino } from './useNoReino.js'

// A árvore de habilidades de um personagem (TASK-077; RF24, Conceito §7): a raiz em cima e os três ramos embaixo, com o
// nível de cada uma; ao lado, o detalhe da escolhida, com aprender/evoluir e pôr ou tirar de uma das 3 teclas.
// No beta, 4 por classe; as outras aparecem como "fora do beta" (Conceito §18).

const nomesDosEstados = { foraDoBeta: 'fora do beta', bloqueada: 'bloqueada', liberada: 'dá para aprender', aprendida: 'aprendida', maxima: 'nível máximo' }
const porcento = (fracao) => `${Math.round(fracao * 100)}%`
const textoDaPassiva = { vida: 'de vida máxima', mana: 'na mana que volta', critico: 'de chance de crítico', cura: 'nas curas' }

// Os números que importam de uma ativa, numa linha
function numerosEmTexto(numeros) {
  const partes = [`${numeros.custoDeMana} de mana`, `recarga ${Math.round(numeros.recargaMs / 100) / 10} s`]
  if (numeros.dano) partes.push(`dano ${Math.round(numeros.dano)}`)
  if (numeros.cura) partes.push(`cura ${Math.round(numeros.cura)}`)
  if (numeros.bonusDeDano) partes.push(`+${porcento(numeros.bonusDeDano)} de dano`)
  if (numeros.reducaoDeDano) partes.push(`−${porcento(Math.min(0.8, numeros.reducaoDeDano))} de dano recebido`)
  if (numeros.msDeDuracao) partes.push(`por ${Math.round(numeros.msDeDuracao / 100) / 10} s`)
  return partes.join(' · ')
}

function efeitoDaPassiva(habilidade, nivel) {
  if (habilidade.efeito === 'defesa') return `+${habilidade.porNivel * nivel} de defesa`
  return `+${porcento(habilidade.porNivel * nivel)} ${textoDaPassiva[habilidade.efeito] ?? ''}`
}

// Uma habilidade na grade: nome, tipo e nível (o estado muda a aparência: bloqueada, liberada, aprendida, fora do beta)
function No({ habilidade, personagem, arvore, escolhida, aoEscolher }) {
  const nivelDoNo = personagem.habilidades[habilidade.id] ?? 0
  const estadoDoNo = estadoDaHabilidade(personagem, habilidade, arvore)
  return (
    <button
      type="button"
      className={`no-da-arvore no-${estadoDoNo}`}
      aria-pressed={habilidade.id === escolhida}
      onClick={() => aoEscolher(habilidade.id)}
      title={nomesDosEstados[estadoDoNo]}
    >
      <span className="no-da-arvore-nome">{habilidade.nome}</span>
      <span className="no-da-arvore-nivel">
        {habilidade.tipo === 'passiva' ? 'passiva' : 'ativa'} · {habilidade.noBeta ? `${nivelDoNo}/${nivelMaximoDaHabilidade}` : 'fora do beta'}
      </span>
    </button>
  )
}

export default function ArvoreDeHabilidades({ personagem }) {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const arvore = arvoreDaClasse(personagem.classe)
  const [escolhida, setEscolhida] = useState(arvore[0]?.id)
  const [trocando, setTrocando] = useState(false)
  const atual = arvore.find((h) => h.id === escolhida) ?? arvore[0]
  const nivel = personagem.habilidades[atual.id] ?? 0
  const estado = estadoDaHabilidade(personagem, atual, arvore)
  const naTecla = personagem.ativas.indexOf(atual.id)
  const nomeDe = (id) => arvore.find((h) => h.id === id)?.nome ?? id

  function escolher(id) {
    setEscolhida(id)
    setTrocando(false)
    setMensagem(null)
  }
  function porNumaTecla() {
    const tentativa = porNaTecla(progresso, personagem.classe, atual.id)
    if (tentativa.precisaTrocar) {
      setTrocando(true)
      setMensagem({ texto: tentativa.motivo, erro: false })
      return
    }
    fazer('porNaTecla', personagem.classe, atual.id)
  }
  function trocar(idQueSai) {
    fazer('trocarNaTecla', personagem.classe, idQueSai, atual.id)
    setTrocando(false)
  }

  const raiz = arvore.find((h) => h.ramo === 'raiz')
  const ramos = ['a', 'b', 'c'].map((ramo) => arvore.filter((h) => h.ramo === ramo).sort((x, y) => x.camada - y.camada))
  return (
    <div className="arvore-de-habilidades">
      <div className="arvore-de-habilidades-topo">
        <span>
          Pontos de habilidade: <strong>{personagem.pontosDeHabilidade}</strong>
        </span>
        <span>
          Teclas:{' '}
          {Array.from({ length: habilidadesAtivasNoMaximo }, (_, indice) => `${indice + 1} ${personagem.ativas[indice] ? nomeDe(personagem.ativas[indice]) : '—'}`).join(' · ')}
        </span>
      </div>
      <div className="arvore-de-habilidades-corpo">
        <div className="grade-da-arvore">
          <div className="grade-da-arvore-raiz">{raiz && <No habilidade={raiz} personagem={personagem} arvore={arvore} escolhida={atual.id} aoEscolher={escolher} />}</div>
          <div className="grade-da-arvore-ramos">
            {ramos.map((ramo, indice) => (
              <div key={indice} className="grade-da-arvore-ramo">
                {ramo.map((habilidade) => (
                  <No key={habilidade.id} habilidade={habilidade} personagem={personagem} arvore={arvore} escolhida={atual.id} aoEscolher={escolher} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="detalhe-do-item detalhe-da-habilidade">
          <h3>{atual.nome}</h3>
          <p className="nota">
            {atual.tipo === 'passiva' ? 'Passiva (sempre ligada)' : 'Ativa (vai numa tecla)'} · {nomesDosEstados[estado]}
            {atual.noBeta ? ` · nível ${nivel}/${nivelMaximoDaHabilidade}` : ''}
          </p>
          <p>{atual.descricao}</p>
          {atual.noBeta && atual.tipo === 'ativa' && (
            <p className="nota">
              {nivel > 0 ? `Agora: ${numerosEmTexto(numerosNoNivel(atual.numeros, nivel))}` : `No nível 1: ${numerosEmTexto(numerosNoNivel(atual.numeros, 1))}`}
              {nivel > 0 && nivel < nivelMaximoDaHabilidade && <br />}
              {nivel > 0 && nivel < nivelMaximoDaHabilidade && `No nível ${nivel + 1}: ${numerosEmTexto(numerosNoNivel(atual.numeros, nivel + 1))}`}
            </p>
          )}
          {atual.noBeta && atual.tipo === 'passiva' && (
            <p className="nota">
              {nivel > 0 ? `Agora: ${efeitoDaPassiva(atual, nivel)}` : `No nível 1: ${efeitoDaPassiva(atual, 1)}`}
              {nivel > 0 && nivel < nivelMaximoDaHabilidade ? ` · no nível ${nivel + 1}: ${efeitoDaPassiva(atual, nivel + 1)}` : ''}
            </p>
          )}
          {estado === 'bloqueada' && <p className="nota">Libera quando {requisitoDe(atual, arvore).nome} chegar ao nível {nivelMaximoDaHabilidade}.</p>}
          <div className="botoes-em-linha">
            {(estado === 'liberada' || estado === 'aprendida') && (
              <Botao onClick={() => fazer('evoluirHabilidade', personagem.classe, atual.id)}>
                {estado === 'liberada' ? 'Aprender' : `Evoluir para o nível ${nivel + 1}`} ({evolucaoDasHabilidades.pontosPorNivel} ponto)
              </Botao>
            )}
            {atual.tipo === 'ativa' && nivel > 0 && naTecla < 0 && <Botao onClick={porNumaTecla}>Pôr numa tecla</Botao>}
            {naTecla >= 0 && <Botao onClick={() => fazer('tirarDaTecla', personagem.classe, atual.id)}>Tirar da tecla {naTecla + 1}</Botao>}
          </div>
          {trocando && (
            <div className="confirmacao">
              <p>Trocar por qual?</p>
              <div className="botoes-em-linha">
                {personagem.ativas.map((id, indice) => (
                  <Botao key={id} onClick={() => trocar(id)}>
                    Tecla {indice + 1}: {nomeDe(id)}
                  </Botao>
                ))}
                <Botao onClick={() => setTrocando(false)}>Cancelar</Botao>
              </div>
            </div>
          )}
          {mensagem && (
            <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'} role="status">
              {mensagem.texto}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
