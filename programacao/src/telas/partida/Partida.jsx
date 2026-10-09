import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Tela from '../../componentes/Tela.jsx'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import ArenaDaPartida from '../../jogo/ArenaDaPartida.jsx'
import { criarPonte } from '../../jogo/ponte.js'
import { montarGrupoDaPartida } from '../../regras/grupoDaPartida.js'
import BarraDeTeste from './BarraDeTeste.jsx'
import HudDaPartida, { AvisosDaPartida } from './HudDaPartida.jsx'

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
  const partida = useMemo(() => ({ bioma, pontoPartida, descobertas }), [bioma, pontoPartida, descobertas])

  useEffect(() => ponte.ouvir('situacao', setSituacao), [ponte])
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

  // Teclas Q (retorno) e F (fuga). Q só sem janela aberta; F abre o aviso da fuga e, com ele aberto, confirma.
  const atual = useRef({ janelas, situacao, fugindo: false })
  useEffect(() => {
    atual.current = { janelas, situacao, fugindo: controle.andamento.fugindo }
  }, [janelas, situacao, controle.andamento.fugindo])
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.repeat || evento.ctrlKey || evento.altKey || evento.metaKey) return
      const tecla = evento.key.toLowerCase()
      const { janelas: abertas, situacao: agora, fugindo } = atual.current
      if (tecla === 'q' && abertas.length === 0) ponte.avisar('comando', { tipo: 'alternarRetorno' })
      if (tecla === 'f') {
        if (abertas.at(-1) === 'confirmarFuga') acoes.confirmarFuga()
        else if (abertas.length === 0 && !fugindo && agora) acoes.pedirFuga(agora.custoDaFuga)
      }
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [ponte, acoes])

  return (
    <Tela className="tela-partida" semTitulo configuracoesEm={pos.configuracoes}>
      <ArenaDaPartida ponte={ponte} grupo={grupo} partida={partida} />
      <HudDaPartida situacao={situacao} mudo={estado.preferencias.mudo} bioma={bioma} />
      <AvisosDaPartida situacao={situacao} mensagens={mensagens} />
      <BarraDeTeste ponte={ponte} situacao={situacao} />
    </Tela>
  )
}
