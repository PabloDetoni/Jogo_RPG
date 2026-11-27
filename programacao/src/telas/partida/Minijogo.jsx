import { useEffect, useRef, useState } from 'react'
import { tocarEfeitoDoMinijogo } from '../../audio/gerenciador.js'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import { useAgora } from '../../componentes/useAgora.js'
import { horaDoJogo } from '../../conta/horaDoServidor.js'
import { minijogos } from '../../dados/balanceamento.js'
import { dadosDosMinijogos, fazendaDesenhada, minaDesenhada } from '../../dados/minijogos.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import {
  avancarFazenda,
  avancarLago,
  baterNaPedra,
  colherNaFazenda,
  comecarFazenda,
  comecarLago,
  lugarDoCanteiro,
  novaPedra,
  puxarNoLago,
  sortearRaros,
} from '../../regras/minijogos.js'
import { podeJogarRodada, textoDasRodadas } from '../../regras/rodadasDoDia.js'
import { useNoReino } from '../reino/useNoReino.js'
import CenaDaFazenda from './CenaDaFazenda.jsx'
import CenaDaMina from './CenaDaMina.jsx'
import CenaDaPesca from './CenaDaPesca.jsx'
import { corDaClasse } from '../../dados/classes.js'
import { chapeuDaClasse } from '../../regras/bonecos.js'

const pos = posicoes.minijogo
const sortear = () => Math.random()
const duracao = minijogos.segundos * 1000
// a posição (em % do campo) de um pedaço da cena desenhada (Parte 11b): os botões ficam em cima do desenho
const porcento = ({ x, y, largura, altura }, cena) => ({ left: `${(x / cena.largura) * 100}%`, top: `${(y / cena.altura) * 100}%`, width: `${(largura / cena.largura) * 100}%`, height: `${(altura / cena.altura) * 100}%` })

// Minijogos do Planalto (TASK-080 e TASK-081; RF54): Fazenda, Mina e Lago, com a mesma base. Uma rodada de 30 s; no
// fim, os recursos vão para a Mochila do Reino e o XP é dividido entre os permanentes (regras/minijogos.js). Não é
// partida: sem taxa, ranking ou histórico. Sair no meio da rodada não dá nada. Ajustes de 14/10 (RF54): 3 rodadas por
// dia em cada minijogo (renovam à meia-noite de Brasília); a rodada conta ao começar, e sem rodadas o botão apaga. Ao sair, volta ao Mapa (decisão de
// 04/10/2026; o diagrama de Partida ainda diz "Voltar ao Reino").
export default function Minijogo() {
  const { estado, acoes } = useJogo()
  const jogo = estado.tela
  const dados = dadosDosMinijogos[jogo]

  return (
    <Tela>
      <Area em={pos.mensagem}>{dados ? <Rodada key={jogo} jogo={jogo} dados={dados} /> : 'Minijogo desconhecido.'}</Area>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}

function Rodada({ jogo, dados }) {
  const { fazer, mensagem, progresso } = useNoReino()
  const agoraDoDia = useAgora()
  const pode = podeJogarRodada(progresso.minijogosDoDia, jogo, agoraDoDia)
  const rodadas = textoDasRodadas(progresso.minijogosDoDia, jogo, agoraDoDia)
  const [fase, setFase] = useState('antes') // 'antes' | 'jogando' | 'fim'
  const [agora, setAgora] = useState(0)
  const [pontos, setPontos] = useState(0)
  const [cena, setCena] = useState(null) // canteiros (Fazenda), pedra (Mina) ou boia (Lago)
  const [puxao, setPuxao] = useState(null) // o último clique no Lago (Parte 10: a vara sobe e o peixe pula)
  const [colheita, setColheita] = useState(null) // o último clique na Fazenda (Parte 11b: o bonequinho vai até o canteiro)
  const [golpe, setGolpe] = useState(null) // o último golpe na Mina (Parte 11b: a picareta, as faíscas e a quebra)
  const lider = progresso.lider
  const inicio = useRef(0)
  const [inicioDaRodada, setInicioDaRodada] = useState(0) // o mesmo, para o desenho da Fazenda (Parte 11b)

  function comecar() {
    // A rodada conta já ao começar (no dia de Brasília, pela hora do jogo); sem rodadas, nada começa
    if (!fazer('comecarRodadaDoMinijogo', jogo, horaDoJogo())) return
    const zero = performance.now()
    inicio.current = zero
    setInicioDaRodada(zero)
    setAgora(0)
    setPontos(0)
    setColheita(null)
    setGolpe(null)
    setCena(jogo === 'fazenda' ? comecarFazenda(0, sortear) : jogo === 'mina' ? novaPedra(sortear) : comecarLago(0, sortear))
    setFase('jogando')
  }

  // O relógio da rodada: avança a cada 100 ms; no fim, o resultado vai para o progresso
  useEffect(() => {
    if (fase !== 'jogando') return undefined
    const relogio = setInterval(() => {
      const tempo = performance.now() - inicio.current
      setAgora(tempo)
      if (jogo === 'fazenda') setCena((atual) => avancarFazenda(atual, tempo, sortear))
      if (jogo === 'lago') setCena((atual) => avancarLago(atual, tempo, sortear))
      if (tempo >= duracao) setFase('fim')
    }, 100)
    return () => clearInterval(relogio)
  }, [fase, jogo])

  const aplicado = useRef(false)
  useEffect(() => {
    if (fase !== 'fim' || aplicado.current) return
    aplicado.current = true
    fazer('aplicarMinijogo', jogo, pontos, sortearRaros(jogo, pontos, sortear))
  }, [fase, jogo, pontos, fazer])

  function marcar(ponto) {
    if (ponto) setPontos((atual) => atual + 1)
  }

  if (fase === 'antes') {
    return (
      <div className="minijogo">
        <h2>
          {dados.nome}: {dados.titulo}
        </h2>
        <p>{dados.regra}</p>
        <p className="nota">Rodada de {minijogos.segundos} s. Não conta como partida (sem taxa, sem ranking).</p>
        <p className="rodadas-do-dia">{rodadas}</p>
        <BotaoDeAcao acao="jogar" desativado={!pode.ok} motivo={pode.motivo} onClick={comecar}>
          Começar rodada ({minijogos.segundos} s)
        </BotaoDeAcao>
      </div>
    )
  }

  if (fase === 'fim') {
    return (
      <div className="minijogo">
        <h2>Fim da rodada: {pontos} ponto{pontos === 1 ? '' : 's'}</h2>
        {mensagem && <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'}>{mensagem.texto}</p>}
        <p className="rodadas-do-dia">{rodadas}</p>
        <BotaoDeAcao
          acao="jogar"
          desativado={!pode.ok}
          motivo={pode.motivo}
          onClick={() => {
            aplicado.current = false
            comecar()
          }}
        >
          Jogar de novo
        </BotaoDeAcao>
      </div>
    )
  }

  const restante = Math.max(0, Math.ceil((duracao - agora) / 1000))
  return (
    <div className="minijogo">
      <p className="minijogo-placar">
        {dados.nome} · {restante} s · <strong>{pontos}</strong> ponto{pontos === 1 ? '' : 's'}
      </p>
      <div className={`minijogo-campo minijogo-${jogo}${jogo === 'lago' ? '' : ' minijogo-desenhado'}`}>
        {/* A Fazenda desenhada (Parte 11b): o canvas embaixo e um botão (sem cor) em cima de cada canteiro */}
        {jogo === 'fazenda' && <CenaDaFazenda canteiros={cena} inicio={inicioDaRodada} colheita={colheita} boneco={{ cor: corDaClasse(lider), chapeu: chapeuDaClasse(lider) }} />}
        {jogo === 'fazenda' &&
          cena.map((canteiro, indice) => (
            <button
              key={indice}
              type="button"
              className={`canteiro canteiro-${canteiro.estado}`}
              data-som="proprio"
              style={porcento(lugarDoCanteiro(indice, fazendaDesenhada.canteiros), fazendaDesenhada)}
              aria-label={`Canteiro ${indice + 1}: ${canteiro.estado}`}
              onClick={() => {
                tocarEfeitoDoMinijogo('fazenda')
                const resultado = colherNaFazenda(cena, indice, performance.now() - inicio.current, sortear)
                setCena(resultado.canteiros)
                setColheita({ indice, quando: performance.now(), ponto: resultado.ponto })
                marcar(resultado.ponto)
              }}
            />
          ))}
        {/* A Mina desenhada (Parte 11b): o canvas embaixo e o botão (sem cor) em cima da pedra */}
        {jogo === 'mina' && <CenaDaMina pedra={cena} golpe={golpe} boneco={{ cor: corDaClasse(lider), chapeu: chapeuDaClasse(lider) }} />}
        {jogo === 'mina' && (
          <button
            type="button"
            className="pedra-da-mina"
            data-som="proprio"
            style={{ left: `${cena.x}%`, top: `${cena.y}%`, width: `${((minaDesenhada.raioDaPedra * 2) / minaDesenhada.largura) * 100}%`, height: `${((minaDesenhada.raioDaPedra * 2) / minaDesenhada.altura) * 100}%` }}
            aria-label={`Pedra: faltam ${cena.golpes} golpes`}
            onClick={() => {
              tocarEfeitoDoMinijogo('mina')
              const resultado = baterNaPedra(cena, sortear)
              setGolpe({ quando: performance.now(), ponto: resultado.ponto, onde: { x: cena.x, y: cena.y } })
              setCena(resultado.pedra)
              marcar(resultado.ponto)
            }}
          />
        )}
        {jogo === 'lago' && (
          // A pesca visual (Parte 10): a cena inteira é o botão de puxar (as regras e o nome do botão são os de sempre)
          <button
            type="button"
            className={`boia pesca boia-${cena.estado}`}
            data-som="proprio"
            aria-label={cena.estado === 'fisgando' ? 'A boia afundou: puxe!' : 'Boia'}
            onClick={() => {
              tocarEfeitoDoMinijogo('lago')
              const resultado = puxarNoLago(cena, performance.now() - inicio.current, sortear)
              setCena(resultado.boia)
              setPuxao({ quando: performance.now(), ponto: resultado.ponto })
              marcar(resultado.ponto)
            }}
          >
            <CenaDaPesca estado={cena.estado} puxao={puxao} boneco={{ cor: corDaClasse(lider), chapeu: chapeuDaClasse(lider) }} />
          </button>
        )}
      </div>
    </div>
  )
}
