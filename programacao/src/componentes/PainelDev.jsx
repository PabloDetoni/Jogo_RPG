import { useRef, useState } from 'react'
import { nomeDaClasse } from '../dados/classes.js'
import { telas } from '../dados/telas.js'
import { useInfoDoSalvamento, useJogo } from '../estado/contexto.js'
import { proximoTipoJogador } from '../estado/estadoDoJogo.js'
import { nivelDaIA, nomeDoNivelDaIA } from '../regras/nivelDaIA.js'
import { xpParaSubir } from '../regras/xp.js'

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
      <button type="button" onClick={acoes.salvarAgora} disabled={!estado.perfilLocal}>
        Salvar agora
      </button>
      <button type="button" onClick={apagarProgresso}>
        Apagar progresso do convidado
      </button>
      <Personagens />
    </aside>
  )
}

// Para testar a IA mudando com o nível (5c): personagens do save com nível, XP e IA, e botões que mexem no save.
// Só fora da partida: durante ela o progresso não muda (RF12); o XP ganho na partida entra no fim.
function Personagens() {
  const { estado, acoes } = useJogo()
  const { personagens } = estado.progresso
  const naPartida = Boolean(estado.partidaAtual)
  if (estado.tipoJogador === 'nenhum') return null

  return (
    <details className="painel-dev-personagens">
      <summary>Personagens do save ({personagens.length})</summary>
      {naPartida && <span>Só fora da partida (o save não muda durante ela).</span>}
      <button type="button" onClick={acoes.devContratarTodas} disabled={naPartida || personagens.length >= 5}>
        Contratar todas as classes (permanentes, de graça)
      </button>
      <button type="button" onClick={acoes.devItensDeTeste} disabled={naPartida} title="1 de cada equipamento, 3 de cada consumível, o pergaminho e 10 de cada material">
        Itens de teste na Mochila e +1000 de ouro
      </button>
      {personagens.map((personagem) => (
        <div key={personagem.classe} className="painel-dev-personagem">
          <span>
            {nomeDaClasse(personagem.classe)}: nível {personagem.nivel} (
            {Number.isFinite(xpParaSubir(personagem.nivel)) ? `${personagem.xp}/${xpParaSubir(personagem.nivel)} XP` : 'máximo'}) · IA{' '}
            {nomeDoNivelDaIA(nivelDaIA(personagem.nivel))}
          </span>
          <span>
            <button type="button" disabled={naPartida} onClick={() => acoes.devMudarNivel(personagem.classe, -1)}>
              −1
            </button>
            <button type="button" disabled={naPartida} onClick={() => acoes.devMudarNivel(personagem.classe, 1)}>
              +1
            </button>
            <button type="button" disabled={naPartida} onClick={() => acoes.devMudarNivel(personagem.classe, 10)}>
              +10
            </button>
            <button type="button" disabled={naPartida} onClick={() => acoes.devQuaseSubir(personagem.classe)} title="Fica a 1 XP do próximo nível">
              Quase subir
            </button>
          </span>
        </div>
      ))}
    </details>
  )
}

function descreverSalvamento(perfilLocal, info) {
  if (!perfilLocal) return 'nada é salvo (sem convidado nem conta)'
  const quando = info.salvoEm ? `salvo às ${new Date(info.salvoEm).toLocaleTimeString('pt-BR')}` : 'ainda não salvo'
  const problema = info.problema ? ` · problema: ${info.problema}` : ''
  const deQuem = perfilLocal === 'conta' ? 'cópia da conta, ' : ''
  return `${deQuem}versão ${info.versao ?? 0}, ${quando}${problema}`
}
