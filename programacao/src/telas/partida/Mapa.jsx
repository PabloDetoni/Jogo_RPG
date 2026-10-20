import { useState } from 'react'
import { urlDaArte } from '../../arte/indice.js'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import CamadaAnimada from '../../componentes/cenario/CamadaAnimada.jsx'
import { useReduzirMovimento } from '../../componentes/cenario/useReduzirMovimento.js'
import CenaEmCamadas from '../../componentes/cenario/CenaEmCamadas.jsx'
import { pontoEmPorcentagem } from '../../componentes/cenario/naImagem.js'
import { desenharMapa, imagensDoMapa, prepararMapa } from '../../componentes/cenario/desenhoDoMapa.js'
import { estiloPosicao } from '../../componentes/posicao.js'
import { useAgora } from '../../componentes/useAgora.js'
import { animacoesDoCenario } from '../../dados/animacoesDoCenario.js'
import { camadasDoMapa } from '../../dados/arte.js'
import { biomas } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { animacoesLigadas } from '../../regras/cenario.js'
import { podeJogarRodada, textoDasRodadas } from '../../regras/rodadasDoDia.js'

const pos = posicoes.mapa
const oceano = urlDaArte(camadasDoMapa.oceano)
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

// Mapa em ovo (RF30). Em camadas (20/10): o oceano (com ondas), o Planalto, os 4 biomas recortados da imagem do Pablo
// e, por cima, os lugares do Planalto. Cada lugar clica no formato do desenho dele e, com o mouse em cima (ou o foco do
// teclado), ganha o contorno dourado e a placa com o nome. Tundra, Vulcânico e Deserto ficam com as cores normais e só
// ao passar o mouse mostram o cadeado e "Em breve" (não abrem). O castelo volta ao Reino; Fazenda, Mina e Lago são os
// minijogos (RF54), com as rodadas de hoje; sem rodadas, a placa diz o motivo e o lugar não abre.
export default function Mapa() {
  const { estado, acoes } = useJogo()
  const agora = useAgora()
  const [emFoco, setEmFoco] = useState(null)
  const reduzirMovimento = useReduzirMovimento()
  const ligada = animacoesLigadas(estado.preferencias.animacoesDoCenario, reduzirMovimento)

  const doPlanalto = Object.entries(pos.planalto).map(([id, r]) => {
    if (id === 'reino') return { id, ...r, nome: nomesDoPlanalto.reino, detalhe: 'o castelo', aoAbrir: () => acoes.irPara('reino') }
    const pode = podeJogarRodada(estado.progresso.minijogosDoDia, id, agora)
    return {
      id,
      ...r,
      nome: nomesDoPlanalto[id],
      minijogo: true,
      bloqueado: !pode.ok,
      motivo: pode.ok ? null : pode.motivo,
      rodadas: textoDasRodadas(estado.progresso.minijogosDoDia, id, agora),
      aoAbrir: () => acoes.irPara(id),
    }
  })
  const dosBiomas = Object.entries(pos.biomas).map(([id, r]) => {
    const bioma = biomas.find((b) => b.id === id)
    return { id, ...r, nome: bioma.nome, bloqueado: !bioma.noBeta, detalhe: bioma.noBeta ? 'Jogar' : 'Em breve', aoAbrir: () => acoes.escolherBioma(id) }
  })
  // Da peça de cima para a de baixo: os lugares do Planalto, a base dele (sem clique) e os biomas
  const lugares = [...doPlanalto, { id: 'planalto', ...pos.base, clicavel: false }, ...dosBiomas]
  const pecas = lugares.map((lugar) => ({ ...lugar, url: oceano ? urlDaArte(lugar.peca) : null }))
  const abrir = (id) => lugares.find((lugar) => lugar.id === id)?.aoAbrir?.()

  return (
    <Tela className="tela-ilustrada tela-mapa" imagemDeFundo={oceano}>
      <CenaEmCamadas
        imagem={pos.imagem}
        pecas={pecas}
        emFoco={emFoco}
        aoFocar={setEmFoco}
        aoAbrir={abrir}
        className={`cena-do-mapa${ligada ? ' cena-animada' : ''}`}
        estilo={{ '--periodo-das-ondas': `${animacoesDoCenario.ondas.periodo}s` }}
        atras={oceano && <div className="oceano-do-mapa" style={{ backgroundImage: `url("${oceano}")` }} aria-hidden="true" />}
        frente={oceano && <CamadaAnimada imagem={pos.imagem} imagens={imagensDoMapa} preparar={prepararMapa} desenhar={desenharMapa} ligada={ligada} />}
      >
        {lugares
          .filter((lugar) => lugar.clicavel !== false)
          .map((lugar) => (
            <div
              key={lugar.id}
              className={`regiao-do-mapa${lugar.minijogo ? ' minijogo-no-mapa' : ''}${emFoco === lugar.id ? ' regiao-em-foco' : ''}${lugar.bloqueado ? ' regiao-bloqueada' : ''}`}
            >
              {/* O botão de verdade (teclado e leitor de tela); o mouse clica pelo desenho da peça */}
              <button
                type="button"
                data-lugar={lugar.id}
                className="regiao-area so-leitor"
                aria-disabled={lugar.bloqueado || undefined}
                onClick={() => !lugar.bloqueado && lugar.aoAbrir()}
                onFocus={() => setEmFoco(lugar.id)}
                onBlur={() => setEmFoco(null)}
                title={[lugar.nome, lugar.detalhe, lugar.rodadas, lugar.motivo].filter(Boolean).join(' · ')}
              >
                {lugar.nome}
              </button>
              <div className="placa-do-lugar posicionado" style={estiloPosicao(pontoEmPorcentagem(lugar.placa, pos.imagem))} aria-hidden="true">
                {lugar.bloqueado && !lugar.minijogo && <Cadeado />}
                <strong>{lugar.nome}</strong>
                {lugar.detalhe && <span className="placa-do-lugar-detalhe">{lugar.detalhe}</span>}
                {lugar.rodadas && <span className="rodadas-do-dia">{lugar.rodadas}</span>}
                {lugar.motivo && <span className="placa-do-lugar-detalhe">{lugar.motivo}</span>}
              </div>
            </div>
          ))}
      </CenaEmCamadas>
      {/* Só no npm run dev: a arena da Fase 1, para testar o combate (e o roteiro do navegador) */}
      {import.meta.env.DEV && (
        <Botao em={pos.arenaDeTeste} onClick={() => acoes.escolherBioma('arena')}>
          Arena de teste
        </Botao>
      )}
    </Tela>
  )
}
