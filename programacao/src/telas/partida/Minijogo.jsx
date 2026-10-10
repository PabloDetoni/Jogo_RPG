import { useEffect, useRef, useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { minijogos } from '../../dados/balanceamento.js'
import { dadosDosMinijogos } from '../../dados/minijogos.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import {
  avancarFazenda,
  avancarLago,
  baterNaPedra,
  colherNaFazenda,
  comecarFazenda,
  comecarLago,
  novaPedra,
  puxarNoLago,
  sortearRaros,
} from '../../regras/minijogos.js'
import { useNoReino } from '../reino/useNoReino.js'

const pos = posicoes.minijogo
const sortear = () => Math.random()
const duracao = minijogos.segundos * 1000

// Minijogos do Planalto (TASK-080 e TASK-081; RF54): Fazenda, Mina e Lago, com a mesma base. Uma rodada de 30 s; no
// fim, os recursos vão para a Mochila do Reino e o XP é dividido entre os permanentes (regras/minijogos.js). Não é
// partida: sem taxa, ranking ou histórico. Sair no meio da rodada não dá nada. Ao sair, volta ao Mapa (decisão de
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
  const { fazer, mensagem } = useNoReino()
  const [fase, setFase] = useState('antes') // 'antes' | 'jogando' | 'fim'
  const [agora, setAgora] = useState(0)
  const [pontos, setPontos] = useState(0)
  const [cena, setCena] = useState(null) // canteiros (Fazenda), pedra (Mina) ou boia (Lago)
  const inicio = useRef(0)

  function comecar() {
    const zero = performance.now()
    inicio.current = zero
    setAgora(0)
    setPontos(0)
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
        <Botao onClick={comecar}>Começar</Botao>
      </div>
    )
  }

  if (fase === 'fim') {
    return (
      <div className="minijogo">
        <h2>Fim da rodada: {pontos} ponto{pontos === 1 ? '' : 's'}</h2>
        {mensagem && <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'}>{mensagem.texto}</p>}
        <Botao
          onClick={() => {
            aplicado.current = false
            comecar()
          }}
        >
          Jogar de novo
        </Botao>
      </div>
    )
  }

  const restante = Math.max(0, Math.ceil((duracao - agora) / 1000))
  return (
    <div className="minijogo">
      <p className="minijogo-placar">
        {dados.nome} · {restante} s · <strong>{pontos}</strong> ponto{pontos === 1 ? '' : 's'}
      </p>
      <div className={`minijogo-campo minijogo-${jogo}`}>
        {jogo === 'fazenda' &&
          cena.map((canteiro, indice) => (
            <button
              key={indice}
              type="button"
              className={`canteiro canteiro-${canteiro.estado}`}
              aria-label={`Canteiro ${indice + 1}: ${canteiro.estado}`}
              onClick={() => {
                const resultado = colherNaFazenda(cena, indice, performance.now() - inicio.current, sortear)
                setCena(resultado.canteiros)
                marcar(resultado.ponto)
              }}
            />
          ))}
        {jogo === 'mina' && (
          <button
            type="button"
            className="pedra-da-mina"
            style={{ left: `${cena.x}%`, top: `${cena.y}%` }}
            aria-label={`Pedra: faltam ${cena.golpes} golpes`}
            onClick={() => {
              const resultado = baterNaPedra(cena, sortear)
              setCena(resultado.pedra)
              marcar(resultado.ponto)
            }}
          >
            {cena.golpes}
          </button>
        )}
        {jogo === 'lago' && (
          <button
            type="button"
            className={`boia boia-${cena.estado}`}
            aria-label={cena.estado === 'fisgando' ? 'A boia afundou: puxe!' : 'Boia'}
            onClick={() => {
              const resultado = puxarNoLago(cena, performance.now() - inicio.current, sortear)
              setCena(resultado.boia)
              marcar(resultado.ponto)
            }}
          >
            {cena.estado === 'fisgando' ? '!' : cena.estado === 'assustado' ? '…' : ''}
          </button>
        )}
      </div>
    </div>
  )
}
