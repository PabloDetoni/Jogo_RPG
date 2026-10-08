import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { chavePublicavel, enderecoDoSupabase, linkDeEntrada, supabase } from '../conta/cliente.js'
import { criarFluxoDaConta } from '../conta/fluxo.js'
import { lerMensagemAoAbrir, recarregarCom, sessaoDaAba } from '../conta/navegador.js'
import { criarServicoDeConta } from '../conta/servico.js'
import { segundosEntreSalvamentosAutomaticos, segundosEntreSinaisDaSessao } from '../dados/regras.js'
import { pegarTravaDaAba, travarAbaDoConvidado } from '../salvamento/abaUnica.js'
import { armazenamentoDoNavegador, armazenamentoNaMemoria } from '../salvamento/armazenamento.js'
import { carregarPreferencias, salvarPreferencias } from '../salvamento/preferenciasLocais.js'
import { criarSalvadorDaConta, criarSalvadorDoConvidado } from '../salvamento/salvadorDoConvidado.js'
import { ContextoJogo } from './contexto.js'
import { atualizarEstado, criarEstadoInicial, dadosParaSalvar } from './estadoDoJogo.js'

const avisoAbaOcupada =
  'O jogo já está aberto como convidado em outra aba deste navegador. Feche a outra aba e tente de novo.'
const mensagemDoLinkExpirado =
  'O link do e-mail expirou ou já foi usado. Entre com e-mail e senha; se precisar, peça outro link (Reenviar ou Esqueci minha senha).'
const mensagemSaiuSemNuvem =
  'Você saiu da conta, mas sem conexão com a nuvem: o progresso ficou guardado neste navegador e vai para a nuvem na próxima vez que você entrar nesta conta aqui.'

export default function ProvedorDoJogo({ children }) {
  const [armazenamento] = useState(armazenamentoDoNavegador)
  const [salvadorDoConvidado] = useState(() => criarSalvadorDoConvidado(armazenamento))
  // As preferências são lidas antes da primeira tela: som e tema valem antes do login (RF18)
  const [estado, despachar] = useReducer(atualizarEstado, armazenamento, (armazenamentoInicial) =>
    criarEstadoInicial(carregarPreferencias(armazenamentoInicial)),
  )

  // Último estado, para quem salva fora do React (relógio de 3 minutos, aba fechando, caminho das contas)
  const estadoAtual = useRef(estado)
  useEffect(() => {
    estadoAtual.current = estado
  }, [estado])

  // Contas (Fase 2): o serviço fala com o Supabase; o fluxo cuida da entrada, da sessão única e do save no banco
  const [servico] = useState(() =>
    criarServicoDeConta(supabase, { origem: globalThis.location?.origin ?? '', endereco: enderecoDoSupabase, chave: chavePublicavel }),
  )
  const [fluxo] = useState(() =>
    criarFluxoDaConta({
      servico,
      // Sem localStorage, a cópia local da conta vive só na memória e o save segue para o banco
      armazenamento: armazenamento ?? armazenamentoNaMemoria(),
      criarSalvadorDaConta,
      lerConvidado: () => {
        const lido = salvadorDoConvidado.carregar()
        return lido.situacao === 'carregado' ? lido : null
      },
      apagarConvidado: () => salvadorDoConvidado.apagar(),
      pegarTrava: () => pegarTravaDaAba('jogo-rpg:aba-da-conta'),
      sessaoDaAba,
      despachar,
      recarregar: (texto) => recarregarCom({ texto, tipo: 'erro', onde: 'login' }),
    }),
  )
  // A conta guardada neste navegador pelo Supabase (o Login mostra "Continuar como ...")
  const [contaGuardada, setContaGuardada] = useState(null)

  // O salvamento deste navegador: o do convidado ou a cópia local da conta
  const salvador = estado.perfilLocal === 'conta' && fluxo.salvador ? fluxo.salvador : salvadorDoConvidado

  // Ao abrir a página: mensagem deixada antes de recarregar, link de e-mail (confirmação, senha nova) e a conta guardada
  const abriu = useRef(false)
  useEffect(() => {
    if (!abriu.current) {
      abriu.current = true
      const mensagem = lerMensagemAoAbrir()
      if (mensagem?.onde === 'aviso') despachar({ tipo: 'mostrarAviso', texto: mensagem.texto })
      else if (mensagem) despachar({ tipo: 'mostrarNoLogin', mensagem: { texto: mensagem.texto, tipo: mensagem.tipo } })
      if (linkDeEntrada.tipo === 'signup') {
        despachar({ tipo: 'mostrarNoLogin', mensagem: { texto: 'E-mail confirmado! Agora é só entrar na conta.', tipo: 'bom' } })
      } else if (linkDeEntrada.tipo === 'recovery') {
        despachar({ tipo: 'irPara', destino: 'novaSenha' })
      } else if (linkDeEntrada.tipo === 'erro') {
        despachar({ tipo: 'mostrarNoLogin', mensagem: { texto: mensagemDoLinkExpirado, tipo: 'erro' } })
      }
    }
    let ativo = true
    servico.usuarioAtual().then((resposta) => {
      if (ativo && resposta.ok) setContaGuardada(resposta.usuario)
    })
    const pararDeOuvir = servico.aoMudarAEntrada((evento, usuario) => {
      if (evento === 'PASSWORD_RECOVERY') despachar({ tipo: 'irPara', destino: 'novaSenha' })
      if (evento === 'SIGNED_OUT') setContaGuardada(null)
      if (evento === 'SIGNED_IN') setContaGuardada(usuario)
    })
    return () => {
      ativo = false
      pararDeOuvir()
    }
  }, [servico])

  // Momentos de salvamento pedidos pelo estado: classe escolhida, começo e fim da partida (RF09)
  useEffect(() => {
    if (estado.pedidosDeSalvamento > 0) salvador.salvar(dadosParaSalvar(estadoAtual.current))
  }, [estado.pedidosDeSalvamento, salvador])

  // Conta: depois da cópia local, o mesmo momento vai para o banco (RF10). Declarado depois do efeito acima,
  // roda depois dele: o banco recebe a versão que acabou de ser gravada.
  useEffect(() => {
    if (estado.pedidosAoBanco > 0) fluxo.enviarAoBanco()
  }, [estado.pedidosAoBanco, fluxo])

  // Conta: partidas terminadas vão para o histórico e o ranking (TASK-100)
  const partidasNaFila = estado.partidasParaRegistrar.length
  useEffect(() => {
    if (partidasNaFila > 0) fluxo.registrarPartidas(estadoAtual.current.partidasParaRegistrar)
  }, [partidasNaFila, fluxo])

  // Enquanto há um save neste navegador (convidado ou conta): salva a cada 3 minutos (RF09) e quando a aba fecha
  // ou é escondida. A conta também fecha a sessão quando a página sai (sem esperar os 3 minutos).
  const perfilLocal = estado.perfilLocal
  useEffect(() => {
    if (!perfilLocal) return undefined
    const salvarAgora = () => salvador.salvar(dadosParaSalvar(estadoAtual.current))
    const aoSair = () => {
      salvarAgora()
      if (perfilLocal === 'conta') fluxo.fecharNaSaida()
    }
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') salvarAgora()
    }
    const relogio = setInterval(salvarAgora, segundosEntreSalvamentosAutomaticos * 1000)
    window.addEventListener('pagehide', aoSair)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => {
      clearInterval(relogio)
      window.removeEventListener('pagehide', aoSair)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [perfilLocal, salvador, fluxo])

  // Conta: sinal da sessão a cada minuto (RF05); a internet voltou, o que ficou pendente sobe
  useEffect(() => {
    if (perfilLocal !== 'conta') return undefined
    const sinal = setInterval(() => fluxo.sinal(), segundosEntreSinaisDaSessao * 1000)
    const aoVoltarAInternet = () => {
      fluxo.enviarAoBanco()
      fluxo.registrarPartidas(estadoAtual.current.partidasParaRegistrar)
    }
    window.addEventListener('online', aoVoltarAInternet)
    return () => {
      clearInterval(sinal)
      window.removeEventListener('online', aoVoltarAInternet)
    }
  }, [perfilLocal, fluxo])

  // Preferências: guardadas a cada mudança (RF18)
  useEffect(() => {
    salvarPreferencias(armazenamento, estado.preferencias)
  }, [armazenamento, estado.preferencias])

  // Esc funciona em qualquer tela. M liga e desliga o mudo a qualquer momento, até em combate (RF18),
  // menos enquanto se digita num campo de texto (o "m" de um e-mail não pode mutar o jogo).
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') despachar({ tipo: 'esc' })
      const digitando = evento.target instanceof HTMLElement && evento.target.matches('input, textarea, select, [contenteditable="true"]')
      const comAtalho = evento.ctrlKey || evento.altKey || evento.metaKey
      if (evento.key.toLowerCase() === 'm' && !digitando && !comAtalho && !evento.repeat) {
        despachar({ tipo: 'alternarPreferencia', chave: 'mudo' })
      }
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [])

  const entrando = useRef(false) // evita entrar duas vezes com um clique duplo

  const acoes = useMemo(() => {
    // Grava agora o save deste navegador (do convidado ou a cópia da conta)
    const salvadorAtivo = () => (estadoAtual.current.perfilLocal === 'conta' && fluxo.salvador ? fluxo.salvador : salvadorDoConvidado)
    const salvarAgora = () => salvadorAtivo().salvar(dadosParaSalvar(estadoAtual.current))

    // Um pedido de conta por vez (clique duplo não entra duas vezes)
    async function umDeCadaVez(fazer) {
      if (entrando.current) return { ok: false, codigo: 'ocupado', mensagem: null }
      entrando.current = true
      try {
        return await fazer()
      } finally {
        entrando.current = false
      }
    }

    return {
      irPara: (destino) => despachar({ tipo: 'irPara', destino }),
      voltar: () => despachar({ tipo: 'voltar' }),
      abrirJanela: (janela) => despachar({ tipo: 'abrirJanela', janela }),
      fecharJanela: () => despachar({ tipo: 'fecharJanela' }),
      fecharAviso: (id) => despachar({ tipo: 'fecharAviso', id }),

      // RF01: uma aba por navegador no modo convidado; o progresso vem do navegador (HU01)
      entrarComoConvidado: () =>
        umDeCadaVez(async () => {
          const trava = await travarAbaDoConvidado()
          if (trava === 'ocupada') {
            despachar({ tipo: 'mostrarAviso', texto: avisoAbaOcupada })
            return { ok: false }
          }
          salvarAgora()
          despachar({ tipo: 'entrarComoConvidado', carregamento: salvadorDoConvidado.carregar() })
          return { ok: true }
        }),

      // ---------- Contas (Fase 2). Cada uma devolve { ok, codigo, mensagem, ... } para a tela mostrar. ----------
      // Antes de entrar numa conta, o convidado desta aba grava o que tem (RF03 lê esse save)
      entrar: (dados) =>
        umDeCadaVez(async () => {
          salvarAgora()
          return fluxo.entrar(dados)
        }),
      continuarNaConta: () =>
        umDeCadaVez(async () => {
          salvarAgora()
          return fluxo.continuar()
        }),
      escolherApelido: (apelido) => umDeCadaVez(() => fluxo.escolherApelido(apelido)),
      // Cadastro pelas Configurações do convidado: o progresso dele vai para a conta no primeiro login (RF03)
      cadastrar: (dados) =>
        umDeCadaVez(async () => {
          const deConvidado = estadoAtual.current.perfilLocal === 'convidado'
          if (deConvidado) salvarAgora()
          return fluxo.cadastrar({ ...dados, deConvidado })
        }),
      reenviarConfirmacao: (email) => fluxo.reenviarConfirmacao(email),
      emailDoCadastro: () => fluxo.emailDoCadastro,
      pedirNovaSenha: (email) => fluxo.pedirNovaSenha(email),
      trocarSenha: (senha) => umDeCadaVez(() => fluxo.trocarSenha(senha)),
      ranking: (aba, classe) => servico.ranking(aba, classe),
      historico: (pagina) => servico.historico(pagina),

      // Sair (RF08): o convidado salva no navegador; a conta também envia ao banco e fecha a sessão.
      // Nos dois casos a página recarrega e volta à Tela inicial.
      sair: () =>
        umDeCadaVez(async () => {
          salvarAgora()
          if (estadoAtual.current.perfilLocal === 'conta') {
            const { nuvemOk } = await fluxo.sair(estadoAtual.current.partidasParaRegistrar)
            recarregarCom(nuvemOk ? null : { texto: mensagemSaiuSemNuvem, onde: 'aviso' })
          } else {
            window.location.reload()
          }
          return { ok: true }
        }),

      trocarTipoJogador: () => despachar({ tipo: 'trocarTipoJogador' }),
      escolherClasseInicial: (classe) => despachar({ tipo: 'escolherClasseInicial', classe }),
      escolherBioma: (bioma) => despachar({ tipo: 'escolherBioma', bioma }),
      escolherPontoPartida: (pontoPartida) => despachar({ tipo: 'escolherPontoPartida', pontoPartida }),
      escolherLider: (classe) => despachar({ tipo: 'escolherLider', classe }),
      comecarPartida: () => despachar({ tipo: 'comecarPartida', agora: new Date().toISOString() }),
      iniciarRetorno: () => despachar({ tipo: 'iniciarRetorno' }),
      atualizarAndamento: (andamento) => despachar({ tipo: 'atualizarAndamento', andamento }),
      pedirFuga: (custo) => despachar({ tipo: 'pedirFuga', custo }),
      confirmarFuga: () => despachar({ tipo: 'confirmarFuga' }),
      encerrarPartida: (fim) => despachar({ tipo: 'encerrarPartida', fim }),
      contratar: (contrato, classe) => despachar({ tipo: 'contratar', contrato, classe }),
      alternarPreferencia: (chave) => despachar({ tipo: 'alternarPreferencia', chave }),

      // Painel de desenvolvimento (só no npm run dev; mexem no save só fora da partida)
      salvarAgora,
      devContratarTodas: () => despachar({ tipo: 'devContratarTodas' }),
      devMudarNivel: (classe, quantos) => despachar({ tipo: 'devMudarNivel', classe, quantos }),
      devQuaseSubir: (classe) => despachar({ tipo: 'devQuaseSubir', classe }),
      apagarProgressoDoConvidado: () => {
        salvadorDoConvidado.apagar()
        window.location.reload()
      },
    }
  }, [salvadorDoConvidado, fluxo, servico])

  const contas = useMemo(() => ({ disponivel: servico.disponivel, guardada: contaGuardada }), [servico, contaGuardada])
  const valor = useMemo(() => ({ estado, acoes, salvador, contas }), [estado, acoes, salvador, contas])

  return <ContextoJogo value={valor}>{children}</ContextoJogo>
}
