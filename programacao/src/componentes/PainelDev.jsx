import { useRef, useState } from 'react'
import { telas } from '../dados/telas.js'
import { useInfoDoSalvamento, useJogo } from '../estado/contexto.js'
import { proximoTipoJogador } from '../estado/estadoDoJogo.js'

const grupos = [...new Set(Object.values(telas).map((tela) => tela.grupo))]

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(valor, maximo))
}

// Minimizado ou aberto: lembrado só neste navegador (conveniência de quem programa, fora do save)
const chaveMinimizado = 'jogo-rpg:painelDevMinimizado'

function lerMinimizado() {
  try {
    return window.localStorage.getItem(chaveMinimizado) === 'sim'
  } catch {
    return false
  }
}

function guardarMinimizado(minimizado) {
  try {
    window.localStorage.setItem(chaveMinimizado, minimizado ? 'sim' : 'nao')
  } catch {
    // sem localStorage o painel só não lembra da escolha
  }
}

// Painel de desenvolvimento: só aparece em "npm run dev" (ver App.jsx).
// Arraste pela faixa do título para tirar o painel da frente dos botões, ou minimize no "–":
// ele vira um botãozinho "</> DEV" no canto, que abre o painel de novo.
export default function PainelDev() {
  const { estado, acoes } = useJogo()
  const info = useInfoDoSalvamento()
  const painel = useRef(null)
  const arraste = useRef(null) // distância entre o ponteiro e o canto do painel enquanto arrasta
  const [posicao, setPosicao] = useState(null) // em pixels; null = canto inferior esquerdo
  const [minimizado, setMinimizado] = useState(lerMinimizado)

  function alternarMinimizado(valor) {
    setMinimizado(valor)
    guardarMinimizado(valor)
  }

  function aoPegar(evento) {
    const caixa = painel.current.getBoundingClientRect()
    arraste.current = {
      dx: evento.clientX - caixa.left,
      dy: evento.clientY - caixa.top,
      largura: caixa.width,
      altura: caixa.height,
    }
    evento.currentTarget.setPointerCapture(evento.pointerId)
  }

  function aoArrastar(evento) {
    if (!arraste.current) return
    const { dx, dy, largura, altura } = arraste.current
    // Não deixa o painel sair da janela
    setPosicao({
      x: limitar(evento.clientX - dx, 0, window.innerWidth - largura),
      y: limitar(evento.clientY - dy, 0, window.innerHeight - altura),
    })
  }

  function aoSoltar() {
    arraste.current = null
  }

  const estilo = posicao && { left: posicao.x, top: posicao.y, bottom: 'auto' }

  // Para testar o primeiro acesso de novo: apaga o save do convidado e recarrega
  function apagarProgresso() {
    if (window.confirm('Apagar o progresso do convidado salvo neste navegador?')) acoes.apagarProgressoDoConvidado()
  }

  if (minimizado) {
    return (
      <button type="button" className="painel-dev-mini" title="Abrir o painel de desenvolvimento" onClick={() => alternarMinimizado(false)}>
        {'</>'} DEV
      </button>
    )
  }

  return (
    <aside className="painel-dev" ref={painel} style={estilo}>
      <strong
        className="painel-dev-alca"
        title="Arraste para mudar o painel de lugar"
        onPointerDown={aoPegar}
        onPointerMove={aoArrastar}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
      >
        {'</>'} Painel de desenvolvimento (arraste aqui)
        <button
          type="button"
          className="painel-dev-minimizar"
          title="Minimizar o painel"
          aria-label="Minimizar o painel"
          onPointerDown={(evento) => evento.stopPropagation()}
          onClick={() => alternarMinimizado(true)}
        >
          –
        </button>
      </strong>
      <span>Tela: {telas[estado.tela].nome}</span>
      <label>
        Pular para{' '}
        <select value={estado.tela} onChange={(evento) => acoes.irPara(evento.target.value)}>
          {grupos.map((grupo) => (
            <optgroup key={grupo} label={grupo}>
              {Object.entries(telas)
                .filter(([, tela]) => tela.grupo === grupo)
                .map(([id, tela]) => (
                  <option key={id} value={id}>
                    {tela.nome}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <span>Jogador: {estado.tipoJogador}</span>
      <button type="button" onClick={acoes.trocarTipoJogador}>
        Trocar para {proximoTipoJogador[estado.tipoJogador]}
      </button>
      <span>Salvamento: {descreverSalvamento(estado.perfilLocal, info)}</span>
      <span>Partidas jogadas: {estado.progresso.estatisticas.partidasJogadas}</span>
      <button type="button" onClick={acoes.salvarAgora} disabled={estado.perfilLocal !== 'convidado'}>
        Salvar agora
      </button>
      <button type="button" onClick={apagarProgresso}>
        Apagar progresso do convidado
      </button>
    </aside>
  )
}

function descreverSalvamento(perfilLocal, info) {
  if (perfilLocal !== 'convidado') return 'nada é salvo (sem convidado)'
  const quando = info.salvoEm ? `salvo às ${new Date(info.salvoEm).toLocaleTimeString('pt-BR')}` : 'ainda não salvo'
  const problema = info.problema ? ` · problema: ${info.problema}` : ''
  return `versão ${info.versao ?? 0}, ${quando}${problema}`
}
