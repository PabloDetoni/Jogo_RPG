import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Tela from '../../componentes/Tela.jsx'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import ArenaDaPartida from '../../jogo/ArenaDaPartida.jsx'
import { criarPonte } from '../../jogo/ponte.js'
import { prepararSonsDaPartida, tocarEfeito, tocarMusica } from '../../audio/gerenciador.js'
import { carregamentoDaPartida, gradeComMao } from '../../dados/interface.js'
import { carregamentoInicial, demorouDemais, progressoDoCarregamento } from '../../regras/carregamento.js'
import CarregandoAPartida from './CarregandoAPartida.jsx'
import { musicaDaTela } from '../../regras/som.js'
import { montarGrupoDaPartida } from '../../regras/grupoDaPartida.js'
import BarraDeTeste from './BarraDeTeste.jsx'
import HudDaPartida, { AvisosDaPartida } from './HudDaPartida.jsx'
import { MapaInteiro } from './Minimapa.jsx'
import MochilaNaPartida from './MochilaNaPartida.jsx'
import { itensDaJanela } from '../../regras/itensNaPartida.js'
import { useGradeComMao } from '../../componentes/ui/useGradeComMao.js'
import { itemDoCatalogo, usavelNaPartida } from '../../dados/itens.js'
import { useToque } from '../../componentes/useToque.js'
import { controlesDeToque } from '../../dados/interface.js'
import { deveLigarModoLeve, modoLeveAtivo } from '../../regras/toque.js'
import ControlesDeToque from './ControlesDeToque.jsx'

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

  // Toque (Parte 14): a cena lê pela ponte se o jogo está no toque (a mira automática, o joystick) e se o modo leve está
  // ligado. O modo leve "automático" liga sozinho com o FPS abaixo do limite por alguns segundos seguidos.
  const { toque } = useToque()
  useEffect(() => ponte.definirToque(toque), [ponte, toque])
  const opcaoDoModoLeve = estado.preferencias.modoLeve
  const [leveSozinho, setLeveSozinho] = useState(false)
  const leve = modoLeveAtivo({ opcao: opcaoDoModoLeve, ligouSozinho: leveSozinho })
  useEffect(() => ponte.definirModoLeve(leve), [ponte, leve])
  const amostrasDoFps = useRef([])
  // (no computador o automático nunca liga: lá o jogo fica igual ao de sempre)
  const medindo = toque && opcaoDoModoLeve === 'automatico' && !leveSozinho && Boolean(situacao)

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
  // A música do chefe quando a barra dele aparece (Fase 4, TASK-105) e a do combate em combate (Parte 13)
  const bossPorPerto = Boolean(situacao?.boss)
  const emCombate = Boolean(situacao?.emCombate)
  useEffect(() => tocarMusica(musicaDaTela('partida', { bossPorPerto, emCombate })), [bossPorPerto, emCombate])
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
  useEffect(() => {
    if (leveSozinho) mostrar({ texto: 'Modo leve ligado: o jogo estava lento (dá para mudar nas Configurações)', tipo: 'alerta' })
  }, [leveSozinho, mostrar])

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
  useEffect(() => {
    if (mochilaAberta) tocarEfeito('mochila') // o som de abrir a mochila (Parte 13)
  }, [mochilaAberta])

  // O que as teclas precisam saber agora (as janelas abertas, a situação, a fuga e o item em foco na mochila)
  const itemEmFoco = gradeDaMochila.itemEmFoco?.id ?? null
  const atual = useRef({ janelas, situacao, fugindo: false, itemEmFoco: null })
  useEffect(() => {
    atual.current = { janelas, situacao, fugindo: controle.andamento.fugindo, itemEmFoco }
  }, [janelas, situacao, controle.andamento.fugindo, itemEmFoco])

  // O FPS de cada segundo (a pausa não conta): baixo por alguns segundos seguidos, o modo leve liga sozinho
  useEffect(() => {
    if (!medindo) return undefined
    const relogio = setInterval(() => {
      const { situacao: agora, janelas: abertas } = atual.current
      if (abertas.includes('pausa') || document.hidden) return
      amostrasDoFps.current = [...amostrasDoFps.current, agora?.fps ?? 0].slice(-controlesDeToque.modoLeve.segundos)
      if (deveLigarModoLeve(amostrasDoFps.current, controlesDeToque.modoLeve)) setLeveSozinho(true)
    }, 1000)
    return () => clearInterval(relogio)
  }, [medindo])

  const usarItem = useCallback(
    (em) => {
      const { situacao: agora, itemEmFoco: id } = atual.current
      const naMochila = (agora?.mochila?.itens ?? []).some((item) => item.id === id)
      if (id && naMochila && usavelNaPartida(itemDoCatalogo(id))) ponte.avisar('comando', { tipo: 'usarItem', id, em })
    },
    [ponte],
  )

  // O mapa inteiro sem pausar (Parte 14: o botão Mapa do toque; na pausa ele aparece sempre)
  const [mapaAberto, setMapaAberto] = useState(false)

  // O que as teclas fazem, também pelos botões de toque (Parte 14): Tab abre e fecha a mochila (com outra janela por
  // cima, nada); Q só sem janela aberta (a mochila não conta); F abre o aviso da fuga e, com ele aberto, confirma.
  const comandos = useMemo(() => {
    const bloqueiam = () => atual.current.janelas.filter((janela) => janela !== 'mochilaDaPartida')
    return {
      mochila: () => {
        const abertas = atual.current.janelas
        if (abertas.at(-1) === 'mochilaDaPartida') acoes.fecharJanela()
        else if (abertas.length === 0) acoes.abrirJanela('mochilaDaPartida')
      },
      retorno: () => {
        if (bloqueiam().length === 0) ponte.avisar('comando', { tipo: 'alternarRetorno' })
      },
      fugir: () => {
        const { janelas: abertas, situacao: agora, fugindo } = atual.current
        if (abertas.at(-1) === 'confirmarFuga') acoes.confirmarFuga()
        else if (bloqueiam().length === 0 && !fugindo && agora) acoes.pedirFuga(agora.custoDaFuga)
      },
      pausar: () => acoes.esc(),
      mapa: () => setMapaAberto((aberto) => !aberto),
      mudo: () => acoes.alternarPreferencia('mudo'),
    }
  }, [ponte, acoes])

  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.ctrlKey || evento.altKey || evento.metaKey) return
      const tecla = evento.key.toLowerCase()
      const mochila = atual.current.janelas.at(-1) === 'mochilaDaPartida'
      // Tab nunca troca o foco da página na partida
      if (tecla === 'tab') {
        evento.preventDefault()
        if (!evento.repeat) comandos.mochila()
        return
      }
      if (evento.repeat) return
      if (mochila && (tecla === 'e' || tecla === 'r')) {
        usarItem(tecla === 'e' ? 'lider' : 'aliado')
        return
      }
      if (tecla === 'q') comandos.retorno()
      if (tecla === 'f') comandos.fugir()
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [comandos, usarItem])

  return (
    <Tela className="tela-partida" semTitulo configuracoesEm={pos.configuracoes} dicaEm={pos.dica}>
      <ArenaDaPartida key={tentativa} ponte={ponte} grupo={grupo} partida={partida} aoFalhar={falhou} />
      <HudDaPartida
        situacao={situacao}
        mudo={estado.preferencias.mudo}
        bioma={bioma}
        // Só no npm run dev (RF61): clicar no minimapa teletransporta o grupo
        aoTeletransportar={import.meta.env.DEV ? (ponto) => ponte.avisar('comando', { tipo: 'teletransportar', ponto }) : undefined}
      />
      <AvisosDaPartida situacao={situacao} mensagens={mensagens} />
      {/* Na pausa, o mapa inteiro com a névoa do que não foi descoberto (Parte 5); no toque, também pelo botão Mapa */}
      {pausado && situacao?.minimapa && <MapaInteiro bioma={bioma} minimapa={situacao.minimapa} />}
      {!pausado && mapaAberto && situacao?.minimapa && <MapaInteiro bioma={bioma} minimapa={situacao.minimapa} aoFechar={() => setMapaAberto(false)} />}
      <BarraDeTeste ponte={ponte} situacao={situacao} />
      {toque && (
        <ControlesDeToque ponte={ponte} situacao={situacao} mudo={estado.preferencias.mudo} comandos={comandos} ativo={janelas.length === 0 && carregado && !mapaAberto} />
      )}
      {mochilaAberta && (
        <MochilaNaPartida
          mochila={situacao?.mochila}
          grade={gradeDaMochila}
          toque={toque}
          aoUsar={usarItem}
          aoFechar={acoes.fecharJanela}
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
