import { useCallback, useEffect, useRef, useState } from 'react'
import { urlDaArte } from '../../arte/indice.js'
import Icone from '../../componentes/Icone.jsx'
import { iconeDaHabilidade, iconeDoItem } from '../../dados/arte.js'
import { controlesDeToque } from '../../dados/interface.js'
import { anguloDoArraste, pontaDoJoystick, vetorDoJoystick } from '../../regras/toque.js'

const { joystick, arrasteMinimo, arco } = controlesDeToque
const noArco = (graus) => ({ '--dx': `${Math.cos((graus * Math.PI) / 180) * arco.raio}px`, '--dy': `${-Math.sin((graus * Math.PI) / 180) * arco.raio}px` })

// Controles de toque da partida (Parte 14, 28/11/2026): só aparecem com o dedo como jeito de apontar (celular, tablet).
// - Joystick à esquerda: aparece onde o polegar encosta e anda para onde ele vai.
// - Ataque à direita: tocar ataca o inimigo mais perto dentro do alcance (mira automática); arrastar a partir do botão
//   mira na direção do arraste; segurar repete o golpe. O Arqueiro: segurar puxa o arco, soltar atira.
// - As 3 habilidades em arco em volta do ataque (com a recarga desenhada) e a esquiva. Arrastar a partir de uma habilidade
//   mira; tocar usa a mira automática.
// - No alto: mochila (Tab), mapa, pausa (Esc) e "Mais" (voltar ao Reino com Q, fugir com F e o mudo com M).
// - Pegar (E): só aparece com um item perto.
// Tudo vai para a partida pela ponte ({ tipo: 'toque', acao, ... }); a cena mistura com o teclado (CenaArena.receberToque).
// comandos: { mochila, mapa, pausar, retorno, fugir, mudo } (os mesmos das teclas, em Partida.jsx)
export default function ControlesDeToque({ ponte, situacao, mudo, comandos, ativo }) {
  const enviar = useCallback((acao, dados = {}) => ponte.avisar('comando', { tipo: 'toque', acao, ...dados }), [ponte])
  const [mais, setMais] = useState(false)

  // Uma janela abriu (mochila, pausa) ou os controles saíram: o Líder para e larga o ataque
  useEffect(() => {
    if (!ativo) enviar('soltarTudo')
  }, [ativo, enviar])
  useEffect(() => () => enviar('soltarTudo'), [enviar])

  if (!situacao) return null
  const arqueiro = situacao.classe === 'arqueiro'

  return (
    <div className={`controles-de-toque${ativo ? '' : ' controles-de-toque-parados'}`}>
      <Joystick aoMover={(x, y) => enviar('mover', { x, y })} />

      <div className="toque-topo" role="toolbar" aria-label="Menu da partida">
        <BotaoDoTopo rotulo="Mochila" simbolo="▤" aoTocar={comandos.mochila} />
        <BotaoDoTopo rotulo="Mapa" simbolo="◈" aoTocar={comandos.mapa} />
        <BotaoDoTopo rotulo="Pausa" simbolo="❚❚" aoTocar={comandos.pausar} />
        <BotaoDoTopo rotulo="Mais" simbolo="⋯" aoTocar={() => setMais((aberto) => !aberto)} ativo={mais} />
        {mais && (
          <div className="toque-mais" role="menu" aria-label="Mais ações">
            <button type="button" role="menuitem" className="toque-mais-item" onClick={() => (setMais(false), comandos.retorno())}>
              {situacao.retorno ? 'Cancelar a volta (Q)' : 'Voltar ao Reino (Q)'}
            </button>
            <button type="button" role="menuitem" className="toque-mais-item toque-mais-fugir" onClick={() => (setMais(false), comandos.fugir())} disabled={Boolean(situacao.fuga)}>
              {situacao.fuga ? 'Fugindo...' : `Fugir (F) · ${situacao.custoDaFuga.taxa}%`}
            </button>
            <button type="button" role="menuitem" className="toque-mais-item" onClick={() => comandos.mudo()}>
              {mudo ? 'Ligar o som (M)' : 'Mudo (M)'}
            </button>
          </div>
        )}
      </div>

      {situacao.itemPerto && (
        <button
          type="button"
          className={`toque-interagir${situacao.itemPerto.cabe ? '' : ' toque-interagir-cheia'}`}
          onPointerDown={(evento) => {
            evento.preventDefault()
            enviar('interagir')
          }}
          disabled={!situacao.itemPerto.cabe}
        >
          <Icone nome={iconeDoItem(situacao.itemPerto.id)} />
          {situacao.itemPerto.cabe
            ? `Pegar ${situacao.itemPerto.nome}${situacao.itemPerto.quantidade > 1 ? ` ×${situacao.itemPerto.quantidade}` : ''}`
            : `Mochila cheia: não cabe ${situacao.itemPerto.nome}`}
        </button>
      )}

      <div className="toque-acoes" aria-label="Ações">
        <BotaoQueMira
          classe="toque-ataque"
          rotulo={arqueiro ? 'Arco (segure e solte)' : 'Ataque'}
          recarga={situacao.recargaDoAtaque}
          carga={situacao.cargaDoArco ?? null}
          aoApertar={() => enviar('apertarAtaque')}
          aoMirar={(angulo) => enviar('mirarAtaque', { angulo })}
          aoSoltar={(angulo) => enviar('soltarAtaque', { angulo })}
        >
          <span className="toque-ataque-simbolo" aria-hidden="true">
            {arqueiro ? '➶' : '⚔'}
          </span>
        </BotaoQueMira>
        {situacao.habilidades.map((habilidade, indice) => (
          <BotaoQueMira
            key={indice}
            classe={`toque-habilidade${habilidade ? '' : ' toque-vazio'}${habilidade?.semMana ? ' toque-sem-mana' : ''}`}
            estilo={noArco(arco.habilidades[indice])}
            rotulo={habilidade ? `${habilidade.nome} (${indice + 1})` : `Habilidade ${indice + 1}: vazia`}
            recarga={habilidade ? habilidade.recarga : null}
            desativado={!habilidade}
            aoSoltar={(angulo) => enviar('habilidade', { indice, angulo })}
          >
            {habilidade && urlDaArte(iconeDaHabilidade(habilidade.id)) ? (
              <Icone nome={iconeDaHabilidade(habilidade.id)} tamanho="26px" />
            ) : (
              <span className="toque-inicial">{habilidade ? habilidade.nome.charAt(0) : indice + 1}</span>
            )}
            {habilidade?.custo !== undefined && <span className="toque-custo">{habilidade.custo}</span>}
          </BotaoQueMira>
        ))}
        <button
          type="button"
          className={`toque-botao toque-esquiva${situacao.recargaDaEsquiva >= 1 ? ' toque-pronto' : ''}`}
          style={{ ...noArco(arco.esquiva), '--recarga': Math.max(0, Math.min(1, situacao.recargaDaEsquiva ?? 1)) }}
          aria-label="Esquiva"
          onPointerDown={(evento) => {
            evento.preventDefault()
            enviar('esquiva')
          }}
        >
          <span aria-hidden="true">»</span>
          <span className="toque-nome">Esquiva</span>
        </button>
      </div>
    </div>
  )
}

// A metade esquerda da tela: o joystick aparece onde o polegar encosta (parado, um círculo apagado mostra o lugar)
function Joystick({ aoMover }) {
  const [dedo, setDedo] = useState(null) // { id, x, y, dx, dy } em px da zona
  const ultimo = useRef('0,0')
  const mandar = (x, y) => {
    const chave = `${x.toFixed(2)},${y.toFixed(2)}`
    if (chave === ultimo.current) return
    ultimo.current = chave
    aoMover(x, y)
  }
  function pontoNaZona(evento) {
    const caixa = evento.currentTarget.getBoundingClientRect()
    return { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top }
  }
  function soltar(evento) {
    if (!dedo || evento.pointerId !== dedo.id) return
    setDedo(null)
    mandar(0, 0)
  }
  return (
    <div
      className="toque-joystick-zona"
      aria-label="Joystick: encoste o polegar e arraste para andar"
      onPointerDown={(evento) => {
        if (dedo) return
        evento.preventDefault()
        evento.currentTarget.setPointerCapture?.(evento.pointerId)
        const ponto = pontoNaZona(evento)
        setDedo({ id: evento.pointerId, ...ponto, dx: 0, dy: 0 })
      }}
      onPointerMove={(evento) => {
        if (!dedo || evento.pointerId !== dedo.id) return
        const ponto = pontoNaZona(evento)
        const dx = ponto.x - dedo.x
        const dy = ponto.y - dedo.y
        setDedo({ ...dedo, dx, dy })
        const vetor = vetorDoJoystick({ dx, dy, raio: joystick.raio, zonaMorta: joystick.zonaMorta })
        mandar(vetor.x, vetor.y)
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onLostPointerCapture={soltar}
    >
      {dedo ? (
        <div className="toque-joystick" style={{ left: dedo.x, top: dedo.y, '--raio': `${joystick.raio}px` }} aria-hidden="true">
          <span className="toque-joystick-botao" style={{ transform: `translate(${pontaDoJoystick({ dx: dedo.dx, dy: dedo.dy, raio: joystick.raio }).x}px, ${pontaDoJoystick({ dx: dedo.dx, dy: dedo.dy, raio: joystick.raio }).y}px)` }} />
        </div>
      ) : (
        <div className="toque-joystick toque-joystick-parado" style={{ '--raio': `${joystick.raio}px` }} aria-hidden="true">
          <span className="toque-joystick-botao" />
        </div>
      )}
    </div>
  )
}

// Um botão redondo que mira: apertar (aoApertar), arrastar a partir dele (aoMirar com o ângulo, ou null de volta ao toque)
// e soltar (aoSoltar com o ângulo do arraste, ou null: a mira automática). A recarga é o anel em volta (cheio = pronto).
function BotaoQueMira({ classe, estilo, rotulo, recarga, carga = null, desativado = false, aoApertar, aoMirar, aoSoltar, children }) {
  const dedo = useRef(null)
  const [mirando, setMirando] = useState(null)
  const vazio = recarga === null || recarga === undefined
  const fracao = vazio ? 0 : Math.max(0, Math.min(1, recarga))
  function fim(evento) {
    if (!dedo.current || evento.pointerId !== dedo.current.id) return
    const angulo = dedo.current.angulo
    dedo.current = null
    setMirando(null)
    aoSoltar?.(angulo)
  }
  return (
    <button
      type="button"
      className={`toque-botao ${classe}${!vazio && fracao >= 1 ? ' toque-pronto' : ''}${carga !== null ? ' toque-carregando' : ''}`}
      style={{ ...estilo, '--recarga': fracao, '--carga': carga ?? 0 }}
      aria-label={rotulo}
      disabled={desativado}
      onPointerDown={(evento) => {
        if (dedo.current) return
        evento.preventDefault()
        evento.currentTarget.setPointerCapture?.(evento.pointerId)
        dedo.current = { id: evento.pointerId, x: evento.clientX, y: evento.clientY, angulo: null }
        aoApertar?.()
      }}
      onPointerMove={(evento) => {
        if (!dedo.current || evento.pointerId !== dedo.current.id) return
        const angulo = anguloDoArraste({ dx: evento.clientX - dedo.current.x, dy: evento.clientY - dedo.current.y, minimo: arrasteMinimo })
        if (angulo === dedo.current.angulo) return
        dedo.current.angulo = angulo
        setMirando(angulo)
        aoMirar?.(angulo)
      }}
      onPointerUp={fim}
      onPointerCancel={fim}
      onLostPointerCapture={fim}
      onContextMenu={(evento) => evento.preventDefault()}
    >
      {children}
      {mirando !== null && <span className="toque-seta-da-mira" style={{ transform: `rotate(${mirando}rad)` }} aria-hidden="true" />}
    </button>
  )
}

function BotaoDoTopo({ rotulo, simbolo, aoTocar, ativo = false }) {
  return (
    <button type="button" className={`toque-botao-do-topo${ativo ? ' toque-botao-do-topo-ativo' : ''}`} onClick={aoTocar} aria-label={rotulo}>
      <span aria-hidden="true">{simbolo}</span>
      <span className="toque-botao-do-topo-nome">{rotulo}</span>
    </button>
  )
}
