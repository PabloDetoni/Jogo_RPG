import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Tela from '../../componentes/Tela.jsx'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import ArenaDaPartida from '../../jogo/ArenaDaPartida.jsx'
import { criarPonte } from '../../jogo/ponte.js'
import { tocarMusica } from '../../audio/gerenciador.js'
import { musicaDaTela } from '../../regras/som.js'
import { montarGrupoDaPartida } from '../../regras/grupoDaPartida.js'
import BarraDeTeste from './BarraDeTeste.jsx'
import HudDaPartida, { AvisosDaPartida } from './HudDaPartida.jsx'
import MochilaNaPartida from './MochilaNaPartida.jsx'
import { itensDaJanela } from '../../regras/itensNaPartida.js'

const pos = posicoes.partida
const { msDaMensagem, mensagensNoMaximo } = combateDeTeste.hud

// Partida (etapa 5): o Phaser desenha a arena embaixo; HUD, avisos e barra de teste ficam em React, por cima.
// Os dois lados conversam só pela ponte (src/jogo/ponte.js). As contagens do Q e da fuga rodam dentro da partida,
// no relógio dela (que para na pausa); aqui só chegam as teclas e os pedidos da pausa e do aviso da fuga.
export default function Partida() {
  const { estado, acoes } = useJogo()
  const [ponte] = useState(criarPonte)
  const [situacao, setSituacao] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const { janelas, controleDaPartida: controle } = estado
  const pausado = janelas.includes('pausa')

  // O progresso não muda durante a partida (RF12), então o grupo é montado uma vez só
  const lider = estado.partidaAtual?.lider ?? null
  const grupo = useMemo(() => montarGrupoDaPartida(estado.progresso, lider), [estado.progresso, lider])
  // O mapa (bioma) e onde o grupo nasce (ponto de partida), escolhidos antes de começar
  const bioma = estado.partidaAtual?.bioma ?? 'floresta'
  const pontoPartida = estado.partidaAtual?.pontoPartida ?? 'inicio'
  // O mapa já descoberto deste bioma (minimapa e XP das áreas): o progresso não muda durante a partida (RF12)
  const descobertas = estado.progresso.mapasDescobertos?.[bioma] ?? null
  // O que foi levado da Mochila do Reino para a mochila da partida (Fase 4, TASK-073)
  const levar = estado.partidaAtual?.levar ?? null
  // A missão ativa do começo da partida: a partida avisa no HUD quando algo conta para ela (Fase 4, TASK-078)
  const missao = estado.progresso.missaoAtiva
  const partida = useMemo(() => ({ bioma, pontoPartida, descobertas, levar, missao }), [bioma, pontoPartida, descobertas, levar, missao])

  useEffect(() => ponte.ouvir('situacao', setSituacao), [ponte])
  // A música do Boss quando a barra dele aparece (Fase 4, TASK-105)
  const bossPorPerto = Boolean(situacao?.boss)
  useEffect(() => tocarMusica(musicaDaTela('partida', { bossPorPerto })), [bossPorPerto])
  // Fim da partida (retorno, fuga, desmaio ou botão de teste): as contas e o save ficam com o estado do jogo
  useEffect(() => ponte.ouvir('fimDaPartida', acoes.encerrarPartida), [ponte, acoes])
  // "Em combate", "retornando" e "fugindo", na hora em que mudam (o Esc e a pausa dependem disso)
  useEffect(() => ponte.ouvir('andamento', acoes.atualizarAndamento), [ponte, acoes])
  // A pausa congela o jogo; as Configurações e o aviso da fuga não pausam (Conceito §11.8)
  useEffect(() => ponte.definirPausa(pausado), [ponte, pausado])

  // Mensagens curtas do HUD: cada uma some sozinha; aparecem no máximo algumas juntas
  const relogios = useRef(new Set())
  const proximaMensagem = useRef(1)
  const mostrar = useCallback((mensagem) => {
    const id = proximaMensagem.current++
    setMensagens((atuais) => [...atuais, { ...mensagem, id }].slice(-mensagensNoMaximo))
    const relogio = setTimeout(() => {
      relogios.current.delete(relogio)
      setMensagens((atuais) => atuais.filter((outra) => outra.id !== id))
    }, msDaMensagem)
    relogios.current.add(relogio)
  }, [])
  useEffect(() => {
    const ativos = relogios.current
    return () => ativos.forEach(clearTimeout)
  }, [])
  useEffect(() => ponte.ouvir('mensagem', mostrar), [ponte, mostrar])

  // Esc em combate não pausa (RF44): o estado conta a recusa e aqui aparece o aviso
  const { recusasDePausa, pedido } = controle
  useEffect(() => {
    if (recusasDePausa > 0) mostrar({ texto: 'Você não pode pausar agora', tipo: 'alerta' })
  }, [recusasDePausa, mostrar])

  // Pedidos da pausa ("Voltar ao Reino") e do aviso da fuga (confirmar) vão para a partida
  useEffect(() => {
    if (pedido) ponte.avisar('comando', { tipo: pedido.tipo })
  }, [ponte, pedido])

  // Mochila da partida (Fase 4, TASK-047): Tab abre e fecha (sem pausar); com ela aberta, ↑ ↓ escolhem o item, E usa no
  // Líder e R no aliado de pé mais perto da mira. A partida fica sabendo se ela está aberta (o E não pega do chão).
  const mochilaAberta = janelas.at(-1) === 'mochilaDaPartida'
  const [escolhidoNaMochila, setEscolhidoNaMochila] = useState(null) // o id do item escolhido
  useEffect(() => ponte.avisar('comando', { tipo: 'mochilaAberta', aberta: mochilaAberta }), [ponte, mochilaAberta])

  // O que as teclas precisam saber agora (as janelas abertas, a situação, a fuga e o item escolhido na mochila)
  const atual = useRef({ janelas, situacao, fugindo: false, escolhidoNaMochila: null })
  useEffect(() => {
    atual.current = { janelas, situacao, fugindo: controle.andamento.fugindo, escolhidoNaMochila }
  }, [janelas, situacao, controle.andamento.fugindo, escolhidoNaMochila])

  const usarItem = useCallback(
    (em) => {
      const { situacao: agora, escolhidoNaMochila: id } = atual.current
      if (id && (agora?.mochila?.itens ?? []).some((item) => item.id === id)) ponte.avisar('comando', { tipo: 'usarItem', id, em })
    },
    [ponte],
  )

  // Teclas Q (retorno) e F (fuga). Q só sem janela aberta (a mochila não conta); F abre o aviso da fuga e, com ele
  // aberto, confirma.
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.ctrlKey || evento.altKey || evento.metaKey) return
      const tecla = evento.key.toLowerCase()
      const { janelas: abertas, situacao: agora, fugindo } = atual.current
      const mochila = abertas.at(-1) === 'mochilaDaPartida'
      // Tab nunca troca o foco da página na partida: abre ou fecha a mochila (com outra janela por cima, nada)
      if (tecla === 'tab') {
        evento.preventDefault()
        if (evento.repeat) return
        if (mochila) acoes.fecharJanela()
        else if (abertas.length === 0) {
          // Ao abrir, se o escolhido não está mais na mochila, escolhe o primeiro item (os usáveis vêm antes)
          const itens = itensDaJanela(agora?.mochila?.itens)
          if (!itens.some((item) => item.id === atual.current.escolhidoNaMochila)) setEscolhidoNaMochila(itens[0]?.id ?? null)
          acoes.abrirJanela('mochilaDaPartida')
        }
        return
      }
      if (mochila && (tecla === 'arrowup' || tecla === 'arrowdown')) {
        evento.preventDefault()
        const itens = itensDaJanela(agora?.mochila?.itens)
        if (itens.length === 0) return
        const onde = itens.findIndex((item) => item.id === atual.current.escolhidoNaMochila)
        const proximo = onde < 0 ? (tecla === 'arrowup' ? itens.length - 1 : 0) : (onde + (tecla === 'arrowup' ? itens.length - 1 : 1)) % itens.length
        setEscolhidoNaMochila(itens[proximo].id)
        return
      }
      if (evento.repeat) return
      if (mochila && (tecla === 'e' || tecla === 'r')) {
        usarItem(tecla === 'e' ? 'lider' : 'aliado')
        return
      }
      const bloqueiam = abertas.filter((janela) => janela !== 'mochilaDaPartida')
      if (tecla === 'q' && bloqueiam.length === 0) ponte.avisar('comando', { tipo: 'alternarRetorno' })
      if (tecla === 'f') {
        if (abertas.at(-1) === 'confirmarFuga') acoes.confirmarFuga()
        else if (bloqueiam.length === 0 && !fugindo && agora) acoes.pedirFuga(agora.custoDaFuga)
      }
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [ponte, acoes, usarItem])

  return (
    <Tela className="tela-partida" semTitulo configuracoesEm={pos.configuracoes}>
      <ArenaDaPartida ponte={ponte} grupo={grupo} partida={partida} />
      <HudDaPartida situacao={situacao} mudo={estado.preferencias.mudo} bioma={bioma} />
      <AvisosDaPartida situacao={situacao} mensagens={mensagens} />
      <BarraDeTeste ponte={ponte} situacao={situacao} />
      {mochilaAberta && (
        <MochilaNaPartida
          mochila={situacao?.mochila}
          escolhido={escolhidoNaMochila}
          aoEscolher={setEscolhidoNaMochila}
          aoUsar={usarItem}
        />
      )}
    </Tela>
  )
}
