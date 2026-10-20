import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { estiloPosicao } from '../../componentes/posicao.js'
import { useAgora } from '../../componentes/useAgora.js'
import { biomas } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { podeJogarRodada, textoDasRodadas } from '../../regras/rodadasDoDia.js'

const pos = posicoes.mapa
const pontosSvg = (contorno) => contorno.map(([x, y]) => `${x},${y}`).join(' ')
const recorte = (contorno) => `polygon(${contorno.map(([x, y]) => `${x}% ${y}%`).join(', ')})`
const nomesDoPlanalto = { reino: 'Voltar ao Reino', fazenda: 'Fazenda', mina: 'Mina', lago: 'Lago' }

// O cadeado dos biomas fora do beta, desenhado em pixels (SVG), como as placas do Reino
function Cadeado() {
  return (
    <svg className="cadeado" viewBox="0 0 8 9" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M2 4V2.5a2 2 0 0 1 4 0V4" fill="none" stroke="#f0a000" strokeWidth="1" />
      <rect x="1" y="4" width="6" height="5" fill="#f0a000" />
      <rect x="3.5" y="5.5" width="1" height="2" fill="#2b1d1a" />
    </svg>
  )
}

// Mapa em ovo (RF30; visual novo, 20/10): a imagem do Pablo é o fundo, e cada lugar clica no formato dele (um botão
// recortado no contorno, clip-path) e acende o contorno ao passar o mouse ou com o foco do teclado, com o nome numa placa.
// Os biomas fora do beta ficam com cadeado e "Em breve". No Planalto: o castelo volta ao Reino; a Fazenda, a Mina e o
// Lago abrem os minijogos (RF54), com as rodadas de hoje; sem rodadas, o lugar apaga e a placa diz o motivo.
export default function Mapa() {
  const { estado, acoes } = useJogo()
  const agora = useAgora()
  const [emFoco, setEmFoco] = useState(null)
  const focar = (id) => ({ onMouseEnter: () => setEmFoco(id), onMouseLeave: () => setEmFoco(null), onFocus: () => setEmFoco(id), onBlur: () => setEmFoco(null) })

  const lugares = [
    ...biomas.map((bioma) => ({
      id: bioma.id,
      area: pos.biomas[bioma.id],
      nome: bioma.nome,
      bloqueado: !bioma.noBeta,
      detalhe: bioma.noBeta ? 'Jogar' : 'Em breve',
      aoAbrir: () => acoes.escolherBioma(bioma.id),
      className: 'regiao-do-mapa',
    })),
    { id: 'reino', area: pos.planalto.reino, nome: nomesDoPlanalto.reino, detalhe: 'o castelo', aoAbrir: () => acoes.irPara('reino'), className: 'regiao-do-mapa' },
    ...['fazenda', 'mina', 'lago'].map((id) => {
      const pode = podeJogarRodada(estado.progresso.minijogosDoDia, id, agora)
      return {
        id,
        area: pos.planalto[id],
        nome: nomesDoPlanalto[id],
        bloqueado: !pode.ok,
        motivo: pode.ok ? null : pode.motivo,
        rodadas: textoDasRodadas(estado.progresso.minijogosDoDia, id, agora),
        aoAbrir: () => acoes.irPara(id),
        className: 'regiao-do-mapa minijogo-no-mapa',
      }
    }),
  ]

  return (
    <Tela className="tela-ilustrada tela-mapa">
      {lugares.map((lugar) => (
        <div key={lugar.id} className={`${lugar.className}${emFoco === lugar.id ? ' regiao-em-foco' : ''}${lugar.bloqueado ? ' regiao-bloqueada' : ''}`}>
          <button
            type="button"
            className="regiao-area"
            style={{ clipPath: recorte(lugar.area.contorno) }}
            onClick={lugar.aoAbrir}
            disabled={lugar.bloqueado}
            title={[lugar.nome, lugar.detalhe, lugar.rodadas, lugar.motivo].filter(Boolean).join(' · ')}
            {...focar(lugar.id)}
          >
            <span className="so-leitor">{lugar.nome}</span>
          </button>
          <div className="placa-do-lugar posicionado" style={estiloPosicao(lugar.area.placa)} aria-hidden="true">
            {lugar.bloqueado && !lugar.rodadas && <Cadeado />}
            <strong>{lugar.nome}</strong>
            {lugar.detalhe && <span className="placa-do-lugar-detalhe">{lugar.detalhe}</span>}
            {lugar.rodadas && <span className="rodadas-do-dia">{lugar.rodadas}</span>}
            {lugar.motivo && <span className="placa-do-lugar-detalhe">{lugar.motivo}</span>}
          </div>
        </div>
      ))}
      {/* Os contornos que acendem (por cima de tudo, sem pegar o clique) */}
      <svg className="contornos-do-mapa" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {lugares.map((lugar) => (
          <polygon
            key={lugar.id}
            points={pontosSvg(lugar.area.contorno)}
            className={`contorno-do-lugar${emFoco === lugar.id ? ' contorno-aceso' : ''}${lugar.bloqueado ? ' contorno-bloqueado' : ''}`}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {/* Só no npm run dev: a arena da Fase 1, para testar o combate (e o roteiro do navegador) */}
      {import.meta.env.DEV && (
        <Botao em={pos.arenaDeTeste} onClick={() => acoes.escolherBioma('arena')}>
          Arena de teste
        </Botao>
      )}
    </Tela>
  )
}
