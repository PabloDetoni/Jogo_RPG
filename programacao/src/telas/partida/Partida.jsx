import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Tela from '../../componentes/Tela.jsx'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import ArenaDaPartida from '../../jogo/ArenaDaPartida.jsx'
import { criarPonte } from '../../jogo/ponte.js'
import { prepararSonsDaPartida, tocarMusica } from '../../audio/gerenciador.js'
import { carregamentoDaPartida, gradeComMao } from '../../dados/interface.js'
import { carregamentoInicial, demorouDemais, progressoDoCarregamento } from '../../regras/carregamento.js'
import CarregandoAPartida from './CarregandoAPartida.jsx'
import { musicaDaTela } from '../../regras/som.js'
import { montarGrupoDaPartida } from '../../regras/grupoDaPartida.js'
import BarraDeTeste from './BarraDeTeste.jsx'
import HudDaPartida, { AvisosDaPartida } from './HudDaPartida.jsx'
import MochilaNaPartida from './MochilaNaPartida.jsx'
import { itensDaJanela } from '../../regras/itensNaPartida.js'
import { useGradeComMao } from '../../componentes/ui/useGradeComMao.js'
import { itemDoCatalogo, usavelNaPartida } from '../../dados/itens.js'

const pos = posicoes.partida
const { msDaMensagem, mensagensNoMaximo, msParaJuntar } = combateDeTeste.hud

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

  // Tela de carregamento (ajustes de 14/10): o motor (o Phaser), a arte, os sons e o mapa, com o progresso de verdade.
  // O mapa fica pronto quando chega a primeira situação. Demorou demais ou falhou: "Tentar de novo" monta o jogo outra vez.
  const [tentativa, setTentativa] = useState(0)
  const [andamento, setAndamento] = useState(carregamentoInicial)
  const [problema, setProblema] = useState(null)
  const [carregado, setCarregado] = useState(false)
  const inicioDoCarregamento = useRef(null)
  const andar = useCallback((etapa, fracao) => setAndamento((atual) => (atual[etapa] >= fracao ? atual : { ...atual, [etapa]: fracao })), [])
  useEffect(() => ponte.ouvir('carregamento', ({ etapa, fracao }) => andar(etapa, fracao)), [ponte, andar])
  useEffect(() => {
    inicioDoCarregamento.current = performance.now()
    prepararSonsDaPartida((fracao) => andar('som', fracao))
  }, [andar, tentativa])
  const mundoPronto = Boolean(situacao)
  useEffect(() => {
    if (!mundoPronto) return undefined
    const relogio = setTimeout(() => setCarregado(true), carregamentoDaPartida.msDoSumico)
    return () => clearTimeout(relogio)
  }, [mundoPronto])
  useEffect(() => {
    if (mundoPronto || problema) return undefined
    const relogio = setInterval(() => {
      if (inicioDoCarregamento.current !== null && demorouDemais(inicioDoCarregamento.current, performance.now(), andamento, carregamentoDaPartida.msLimite)) {
        setProblema({ titulo: 'A partida está demorando para carregar', texto: 'Pode ser a internet lenta. Tente de novo; se não der, volte ao Reino (nada do seu progresso se perde).' })
      }
    }, 1000)
    return () => clearInterval(relogio)
  }, [mundoPronto, problema, andamento])
  // O motor que não chegou fica marcado pelo navegador como falha: tentar de novo pede recarregar a página (nada do
  // progresso se perde: a partida ainda não começou de verdade, e o jogo volta pela Tela inicial)
  const falhou = useCallback(
    () =>
      setProblema({
        titulo: 'Não deu para carregar a partida',
        texto: 'Uma parte do jogo não chegou (a internet caiu ou o site acabou de ser atualizado). "Tentar de novo" recarrega a página; o seu progresso continua salvo.',
        recarregar: true,
      }),
    [],
  )
  function tentarDeNovo() {
    if (problema?.recarregar) {
      window.location.reload()
      return
    }
    setProblema(null)
    setAndamento(carregamentoInicial())
    setTentativa((atual) => atual + 1)
  }
  // A música do Boss quando a barra dele aparece (Fase 4, TASK-105)
  const bossPorPerto = Boolean(situacao?.boss)
  useEffect(() => tocarMusica(musicaDaTela('partida', { bossPorPerto })), [bossPorPerto])
  // Fim da partida (retorno, fuga, desmaio ou botão de teste): as contas e o save ficam com o estado do jogo
  useEffect(() => ponte.ouvir('fimDaPartida', acoes.encerrarPartida), [ponte, acoes])
  // "Em combate", "retornando" e "fugindo", na hora em que mudam (o Esc e a pausa dependem disso)
  useEffect(() => ponte.ouvir('andamento', acoes.atualizarAndamento), [ponte, acoes])
  // A pausa congela o jogo; as Configurações e o aviso da fuga não pausam (Conceito §11.8)
  useEffect(() => ponte.definirPausa(pausado), [ponte, pausado])

  // Mensagens curtas do HUD: cada uma some sozinha; aparecem no máximo algumas juntas. As do mesmo tipo que chegam no
  // mesmo instante viram uma linha só (ajustes de 14/10: vários subindo de nível de uma vez não empurram as outras)
  const relogios = useRef(new Set())
  const proximaMensagem = useRef(1)
  const mostrar = useCallback((mensagem) => {
    const id = proximaMensagem.current++
    const agora = performance.now()
    setMensagens((atuais) => {
      const ultima = atuais.at(-1)
      if (ultima && ultima.tipo === mensagem.tipo && agora - ultima.chegou < msParaJuntar && !ultima.texto.includes(mensagem.texto)) {
        return [...atuais.slice(0, -1), { ...ultima, texto: `${ultima.texto} · ${mensagem.texto}`, chegou: agora }]
      }
      return [...atuais, { ...mensagem, id, chegou: agora }].slice(-mensagensNoMaximo)
    })
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

  // Mochila da partida (Fase 4, TASK-047; ajustes da partida, 14/10): Tab abre e fecha a janela no meio da tela (sem
  // pausar; o Líder fica parado). A arrumação da grade (o item na mão) fica aqui enquanto durar a partida; fechar com
  // item na mão devolve. Com o mouse em cima de um consumível (ou com ele na mão), E usa no Líder e R no aliado que mais
  // precisa. A partida fica sabendo se ela está aberta (o Líder para).
  const mochilaAberta = janelas.at(-1) === 'mochilaDaPartida'
  const itensDaMochila = itensDaJanela(situacao?.mochila?.itens).map(({ id, quantidade }) => ({ id, quantidade }))
  const gradeDaMochila = useGradeComMao(itensDaMochila, { ...gradeComMao.partida, aberta: mochilaAberta })
  useEffect(() => ponte.avisar('comando', { tipo: 'mochilaAberta', aberta: mochilaAberta }), [ponte, mochilaAberta])

  // O que as teclas precisam saber agora (as janelas abertas, a situação, a fuga e o item em foco na mochila)
  const itemEmFoco = gradeDaMochila.itemEmFoco?.id ?? null
  const atual = useRef({ janelas, situacao, fugindo: false, itemEmFoco: null })
  useEffect(() => {
    atual.current = { janelas, situacao, fugindo: controle.andamento.fugindo, itemEmFoco }
  }, [janelas, situacao, controle.andamento.fugindo, itemEmFoco])

  const usarItem = useCallback(
    (em) => {
      const { situacao: agora, itemEmFoco: id } = atual.current
      const naMochila = (agora?.mochila?.itens ?? []).some((item) => item.id === id)
      if (id && naMochila && usavelNaPartida(itemDoCatalogo(id))) ponte.avisar('comando', { tipo: 'usarItem', id, em })
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
        else if (abertas.length === 0) acoes.abrirJanela('mochilaDaPartida')
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
    <Tela className="tela-partida" semTitulo configuracoesEm={pos.configuracoes} dicaEm={pos.dica}>
      <ArenaDaPartida key={tentativa} ponte={ponte} grupo={grupo} partida={partida} aoFalhar={falhou} />
      <HudDaPartida situacao={situacao} mudo={estado.preferencias.mudo} bioma={bioma} />
      <AvisosDaPartida situacao={situacao} mensagens={mensagens} />
      <BarraDeTeste ponte={ponte} situacao={situacao} />
      {mochilaAberta && (
        <MochilaNaPartida
          mochila={situacao?.mochila}
          grade={gradeDaMochila}
          aoSoltarNoChao={({ id, quantidade }) => ponte.avisar('comando', { tipo: 'descartarItem', id, quantidade })}
        />
      )}
      {!carregado && (
        <CarregandoAPartida
          progresso={progressoDoCarregamento(mundoPronto ? { ...andamento, mundo: 1 } : andamento)}
          problema={problema}
          saindo={mundoPronto}
          aoTentarDeNovo={tentarDeNovo}
          aoVoltar={() => acoes.irPara('reino')}
        />
      )}
    </Tela>
  )
}
