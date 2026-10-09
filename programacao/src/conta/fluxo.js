import { normalizarProgresso } from '../estado/progresso.js'
import { emailValido, escolherProgressoNoLogin, mensagemDoErro, tamanhoMinimoDaSenha, validarCadastro } from '../regras/contas.js'
import { chaves } from '../salvamento/chaves.js'
import { formatoAtual } from '../salvamento/formato.js'

const mensagens = {
  abaOcupada: 'O jogo já está aberto com uma conta em outra aba deste navegador. Use aquela aba, ou feche-a e tente de novo.',
  emUso:
    'Conta em uso: ela está aberta em outro lugar (outro navegador ou computador). Feche lá e tente de novo; se fechou sem sair, espere cerca de 3 minutos.',
  perdida: 'Sua conta foi aberta em outro lugar, então esta aba saiu dela. Para jogar aqui, feche lá e entre de novo.',
  pendente: 'Sem conexão com a nuvem agora: seu progresso está guardado neste navegador e vai para a nuvem no próximo salvamento.',
  doBanco: 'Na nuvem havia um progresso mais novo desta conta (de outro computador ou aba). Ele foi carregado.',
  linkEnviado: 'Se existir uma conta com este e-mail, mandamos um link para criar uma senha nova. Veja também o spam.',
  senhaTrocada: 'Senha trocada! Agora entre com a senha nova.',
  confirmacaoReenviada: 'Mandamos outro e-mail de confirmação. Veja também o spam.',
  senhaSemLink: 'Para trocar a senha, abra o link que mandamos por e-mail. Se ele expirou ou já foi usado, peça outro em "Esqueci minha senha".',
}

// O caminho das contas (Fase 2), em cima do serviço (src/conta/servico.js): cadastro, entrada, sessão única, save no
// banco com versão, passagem do convidado e saída. Tudo de fora chega como parâmetro, para dar para testar sem
// navegador e sem Supabase:
// - servico: criarServicoDeConta(...)
// - armazenamento: o localStorage seguro (salvamento/armazenamento.js), ou null
// - criarSalvadorDaConta(armazenamento, id): a cópia local do save da conta (salvamento/salvadorDoConvidado.js)
// - lerConvidado(): o save do convidado deste navegador ({ progresso, partidaEmAndamento } ou null)
// - apagarConvidado(): apaga o save do convidado (depois de passar para a conta)
// - pegarTrava(): a trava de uma aba de conta por navegador ({ situacao, soltar })
// - sessaoDaAba(): o código da sessão desta aba (o mesmo depois de recarregar)
// - despachar: muda o estado do jogo
// - recarregar(mensagem): volta à Tela inicial com a página nova (a mensagem aparece depois)
export function criarFluxoDaConta({
  servico,
  armazenamento,
  criarSalvadorDaConta,
  lerConvidado,
  apagarConvidado,
  pegarTrava,
  sessaoDaAba,
  despachar,
  recarregar,
}) {
  let salvador = null // a cópia local do save da conta que entrou
  let trava = null // a trava de uma aba de conta por navegador, enquanto esta aba a segura
  let pendente = null // { usuario } esperando o apelido (conta criada sem apelido)
  let versaoAceita = 0 // a última versão que o banco aceitou
  let enviando = null // o envio em andamento (os pedidos não se atropelam)
  let enviarDeNovo = false
  let registrando = false
  let emailDoCadastro = '' // para o "Reenviar" da tela Confirme seu e-mail

  const erro = (codigo) => ({ ok: false, codigo, mensagem: mensagens[codigo] ?? mensagemDoErro(codigo) })
  const lerJson = (chave) => {
    const lido = armazenamento?.ler(chave)
    if (!lido?.ok || !lido.valor) return null
    try {
      return JSON.parse(lido.valor)
    } catch {
      return null
    }
  }

  async function largarEntrada() {
    trava?.soltar()
    trava = null
  }

  // ---------- Entrar ----------

  async function concluirEntrada(usuario) {
    if (!trava) {
      const pega = await pegarTrava()
      if (pega.situacao === 'ocupada') return erro('abaOcupada')
      trava = pega
    }

    const sessao = await servico.abrirSessao(sessaoDaAba())
    if (!sessao.ok) {
      await largarEntrada()
      return sessao
    }
    if (sessao.situacao === 'em_uso') {
      await largarEntrada()
      await servico.sairDoSupabase()
      return erro('emUso')
    }

    const perfil = await servico.carregarPerfil()
    if (!perfil.ok) {
      await sairDaSessao()
      return perfil
    }
    if (!perfil.apelido) {
      pendente = { usuario }
      return { ok: true, precisaApelido: true }
    }
    return terminarEntrada(usuario, perfil.apelido)
  }

  async function terminarEntrada(usuario, apelido) {
    const doBanco = await servico.carregarSave()
    if (!doBanco.ok) {
      await sairDaSessao()
      return doBanco
    }
    const progressoDoBanco = doBanco.save ? normalizarProgresso(doBanco.save.progresso) : null
    const banco = doBanco.save && progressoDoBanco ? { versao: doBanco.save.versao, progresso: progressoDoBanco } : null

    salvador = criarSalvadorDaConta(armazenamento, usuario.id)
    const lido = salvador.carregar()
    const local = lido.situacao === 'carregado' ? lido : null
    const marca = lerJson(chaves.transferirConvidado)
    const convidado = marca?.conta === usuario.id ? lerConvidado() : null

    const escolha = escolherProgressoNoLogin({ local, banco, convidado })
    if (escolha.de !== 'novo') salvador.comecarCom({ progresso: escolha.progresso, versao: escolha.versao, versaoNoBanco: escolha.versaoNoBanco })
    versaoAceita = escolha.versaoNoBanco
    despachar({ tipo: 'entrarNaConta', conta: { id: usuario.id, email: usuario.email, apelido }, escolha })

    if (escolha.enviar) {
      const envio = await enviarAoBanco()
      // Passagem do convidado (RF03): só depois de a nuvem receber, o save do convidado deixa de existir
      if (escolha.de === 'convidado' && envio?.aceito) {
        armazenamento?.apagar(chaves.transferirConvidado)
        apagarConvidado()
      }
    }
    return { ok: true }
  }

  // ---------- Save no banco (RF10, RNF06) ----------

  // Envia o progresso de agora (já gravado na cópia local). Devolve { aceito } ou null (nada a enviar ou sem rede).
  async function enviarAoBanco() {
    if (enviando) {
      enviarDeNovo = true
      return enviando
    }
    enviando = enviarUmaVez()
    try {
      return await enviando
    } finally {
      enviando = null
      if (enviarDeNovo) {
        enviarDeNovo = false
        enviarAoBanco()
      }
    }
  }

  // Vai a versão da cópia local com o progresso dela (os dois andam juntos). O salvador só existe com a conta.
  async function enviarUmaVez() {
    const progresso = salvador?.progresso
    if (!progresso) return null
    const versao = salvador.versao
    if (versao <= versaoAceita) return { aceito: true }
    const resposta = await servico.salvarSave({ sessao: sessaoDaAba(), versao, formato: formatoAtual, progresso })
    if (!resposta.ok) {
      despachar({ tipo: 'atualizarNuvem', nuvem: { situacao: 'pendente', mensagem: mensagens.pendente } })
      return null
    }
    if (resposta.aceito) {
      versaoAceita = versao
      salvador.marcarNoBanco(versao)
      despachar({ tipo: 'atualizarNuvem', nuvem: { situacao: 'ok', mensagem: null } })
      return { aceito: true }
    }
    if (resposta.motivo === 'sessao') {
      await perdeuASessao()
      return { aceito: false }
    }
    // O banco tinha uma versão mais nova: ela passa a valer antes de seguir (TASK-096)
    const doBanco = await servico.carregarSave()
    const maisNovo = doBanco.ok && doBanco.save ? normalizarProgresso(doBanco.save.progresso) : null
    if (maisNovo) {
      salvador.comecarCom({ progresso: maisNovo, versao: doBanco.save.versao, versaoNoBanco: doBanco.save.versao })
      versaoAceita = doBanco.save.versao
      despachar({ tipo: 'usarProgressoDoBanco', progresso: maisNovo, aviso: mensagens.doBanco })
    }
    return { aceito: false }
  }

  // Partidas de conta terminadas (a fila do estado, partidasParaRegistrar) vão para o histórico e o ranking; as que
  // falharem tentam de novo depois
  async function registrarPartidas(fila) {
    if (registrando || !fila?.length) return
    registrando = true
    try {
      let quantas = 0
      for (const partida of fila) {
        const resposta = await servico.registrarPartida(partida)
        if (!resposta.ok) break
        quantas++
      }
      if (quantas > 0) despachar({ tipo: 'partidasRegistradas', quantas })
    } finally {
      registrando = false
    }
  }

  // ---------- Sessão única (RF05) ----------

  async function sinal() {
    const resposta = await servico.sinalDaSessao(sessaoDaAba())
    if (resposta.ok && resposta.situacao === 'perdida') await perdeuASessao()
    return resposta
  }

  async function perdeuASessao() {
    await servico.sairDoSupabase()
    await largarEntrada()
    recarregar(mensagens.perdida)
  }

  async function sairDaSessao() {
    await servico.fecharSessao(sessaoDaAba())
    await largarEntrada()
  }

  return {
    get salvador() {
      return salvador
    },
    get emailDoCadastro() {
      return emailDoCadastro
    },

    async cadastrar({ email, senha, apelido, deConvidado }) {
      const problema = validarCadastro({ email, senha, apelido })
      if (problema) return { ok: false, codigo: 'campo', campo: problema.campo, mensagem: problema.mensagem }
      const livre = await servico.apelidoDisponivel(apelido)
      if (!livre.ok) return livre
      if (!livre.disponivel) return { ...erro('apelidoEmUso'), campo: 'apelido' }
      const criado = await servico.cadastrar({ email, senha, apelido })
      if (criado.ok) emailDoCadastro = email.trim()
      // Criada pelas Configurações do convidado: o progresso dele vai para a conta no primeiro login (RF03)
      if (criado.ok && deConvidado && criado.conta) {
        armazenamento?.gravar(chaves.transferirConvidado, JSON.stringify({ conta: criado.conta.id }))
      }
      return criado
    },

    async reenviarConfirmacao(email = emailDoCadastro) {
      if (!emailValido(email)) return { ok: false, codigo: 'campo', mensagem: 'Escreva o e-mail da conta.' }
      const resposta = await servico.reenviarConfirmacao(email)
      return resposta.ok ? { ok: true, mensagem: mensagens.confirmacaoReenviada } : resposta
    },

    async entrar({ email, senha }) {
      if (!emailValido(email) || !senha) return { ok: false, codigo: 'campo', mensagem: 'Escreva o e-mail e a senha da conta.' }
      const resposta = await servico.entrar({ email, senha })
      if (!resposta.ok) return resposta
      return concluirEntrada(resposta.usuario)
    },

    // A sessão do Supabase já está neste navegador (página recarregada, ou o link de confirmação)
    async continuar() {
      const resposta = await servico.usuarioAtual()
      if (!resposta.ok) return resposta
      if (!resposta.usuario) return erro('semSessao')
      return concluirEntrada(resposta.usuario)
    },

    async escolherApelido(apelido) {
      if (!pendente) return erro('semSessao')
      const resposta = await servico.definirApelido(apelido)
      if (!resposta.ok) return resposta
      const { usuario } = pendente
      pendente = null
      return terminarEntrada(usuario, apelido)
    },

    async pedirNovaSenha(email) {
      if (!emailValido(email)) return { ok: false, codigo: 'campo', mensagem: 'Escreva o e-mail da conta.' }
      const resposta = await servico.pedirNovaSenha(email)
      return resposta.ok ? { ok: true, mensagem: mensagens.linkEnviado } : resposta
    },

    async trocarSenha(senha) {
      if (senha.length < tamanhoMinimoDaSenha) {
        return { ok: false, codigo: 'campo', mensagem: `A senha precisa ter pelo menos ${tamanhoMinimoDaSenha} caracteres.` }
      }
      const resposta = await servico.trocarSenha(senha)
      if (!resposta.ok) return resposta.codigo === 'semSessao' ? erro('senhaSemLink') : resposta
      await servico.sairDoSupabase()
      despachar({ tipo: 'mostrarNoLogin', mensagem: { texto: mensagens.senhaTrocada, tipo: 'bom' } })
      return { ok: true }
    },

    enviarAoBanco,
    registrarPartidas,
    sinal,

    // Sair da conta (RF08): envia o save e as partidas da fila, fecha a sessão na hora e sai do Supabase neste
    // navegador. Devolve { nuvemOk }: sem internet, o progresso fica na cópia deste navegador e sobe no próximo login aqui.
    async sair(partidas = []) {
      const envio = await enviarAoBanco()
      await registrarPartidas(partidas)
      await servico.fecharSessao(sessaoDaAba())
      await servico.sairDoSupabase()
      await largarEntrada()
      salvador = null
      return { nuvemOk: Boolean(envio?.aceito) }
    },

    // A página está fechando: a sessão acaba na hora (sem esperar os 3 minutos)
    fecharNaSaida() {
      if (salvador) servico.fecharSessaoNaSaida(sessaoDaAba())
    },
  }
}
