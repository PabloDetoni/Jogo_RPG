import { partidasPorPaginaNoHistorico } from '../dados/regras.js'
import { mensagemDoErro, traduzirErro } from '../regras/contas.js'

// Tudo o que o jogo pede ao Supabase (Fase 2), num lugar só. Recebe o cliente (src/conta/cliente.js) — nos testes, um
// cliente falso. Toda função devolve { ok: true, ... } ou { ok: false, codigo, mensagem }: nunca lança erro, para
// nenhuma falha de rede travar o jogo. As mensagens vêm de regras/contas.js.
// "origem": o endereço do jogo (localhost ou Vercel), para onde os links de e-mail voltam.
export function criarServicoDeConta(cliente, { origem = '', endereco = null, chave = null } = {}) {
  const indisponivel = { ok: false, codigo: 'indisponivel', mensagem: mensagemDoErro('indisponivel') }

  async function tentar(fazer) {
    if (!cliente) return indisponivel
    try {
      return await fazer()
    } catch (erro) {
      return { ok: false, ...traduzirErro(erro) }
    }
  }
  const falhou = (erro) => ({ ok: false, ...traduzirErro(erro) })

  // O token de quem está logado, guardado a cada mudança: ao fechar a aba não dá tempo de pedir ao Supabase
  let tokenAtual = null
  cliente?.auth.onAuthStateChange((_evento, sessao) => {
    tokenAtual = sessao?.access_token ?? null
  })

  return {
    disponivel: Boolean(cliente),

    // ---------- Cadastro, confirmação e login (RF02, RF04, RF06) ----------

    apelidoDisponivel: (apelido) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('apelido_disponivel', { p_apelido: apelido })
        return error ? falhou(error) : { ok: true, disponivel: data === true }
      }),

    // O e-mail de confirmação volta para o jogo (origem). O apelido vai junto e o banco cria o perfil.
    cadastrar: ({ email, senha, apelido }) =>
      tentar(async () => {
        const { data, error } = await cliente.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { emailRedirectTo: origem || undefined, data: { apelido } },
        })
        if (error) return falhou(error)
        // E-mail já cadastrado: por segurança o Supabase não diz com erro, mas devolve o usuário sem identidades
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return { ok: false, codigo: 'jaExiste', mensagem: mensagemDoErro('jaExiste') }
        }
        return { ok: true, conta: data.user ? { id: data.user.id } : null }
      }),

    reenviarConfirmacao: (email) =>
      tentar(async () => {
        const { error } = await cliente.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: origem || undefined } })
        return error ? falhou(error) : { ok: true }
      }),

    entrar: ({ email, senha }) =>
      tentar(async () => {
        const { data, error } = await cliente.auth.signInWithPassword({ email: email.trim(), password: senha })
        if (error) return falhou(error)
        return { ok: true, usuario: { id: data.user.id, email: data.user.email } }
      }),

    // Sessão do Supabase guardada neste navegador (depois de recarregar a página ou do link de confirmação)
    usuarioAtual: () =>
      tentar(async () => {
        const { data, error } = await cliente.auth.getSession()
        if (error) return falhou(error)
        const usuario = data.session?.user
        return { ok: true, usuario: usuario ? { id: usuario.id, email: usuario.email } : null }
      }),

    // Só neste navegador (scope local): não derruba a sessão de outro lugar
    sairDoSupabase: () =>
      tentar(async () => {
        const { error } = await cliente.auth.signOut({ scope: 'local' })
        return error ? falhou(error) : { ok: true }
      }),

    pedirNovaSenha: (email) =>
      tentar(async () => {
        const { error } = await cliente.auth.resetPasswordForEmail(email.trim(), { redirectTo: origem || undefined })
        return error ? falhou(error) : { ok: true }
      }),

    trocarSenha: (senha) =>
      tentar(async () => {
        const { error } = await cliente.auth.updateUser({ password: senha })
        return error ? falhou(error) : { ok: true }
      }),

    // O Supabase avisa quando a página abriu pelo link de senha nova ('PASSWORD_RECOVERY') e quando a entrada muda
    // ('SIGNED_IN', 'SIGNED_OUT'...). ouvir(evento, usuario): não chamar o Supabase de dentro (ele espera o ouvinte).
    aoMudarAEntrada: (ouvir) => {
      if (!cliente) return () => {}
      const { data } = cliente.auth.onAuthStateChange((evento, sessao) =>
        ouvir(evento, sessao?.user ? { id: sessao.user.id, email: sessao.user.email } : null),
      )
      return () => data.subscription.unsubscribe()
    },

    // ---------- Perfil (apelido) ----------

    carregarPerfil: () =>
      tentar(async () => {
        const { data, error } = await cliente.from('perfis').select('apelido').maybeSingle()
        return error ? falhou(error) : { ok: true, apelido: data?.apelido ?? null }
      }),

    definirApelido: (apelido) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('definir_meu_apelido', { p_apelido: apelido })
        if (error) return falhou(error)
        if (data === 'ok' || data === 'ja_tem') return { ok: true }
        const codigo = data === 'em_uso' ? 'apelidoEmUso' : 'apelidoInvalido'
        return { ok: false, codigo, mensagem: codigo === 'apelidoEmUso' ? mensagemDoErro('apelidoEmUso') : 'O apelido precisa ter de 3 a 16 letras, números ou _ (sem espaços).' }
      }),

    // ---------- Sessão única (RF05) ----------

    abrirSessao: (sessao) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('abrir_sessao', { p_sessao: sessao })
        return error ? falhou(error) : { ok: true, situacao: data } // 'ok' ou 'em_uso'
      }),

    sinalDaSessao: (sessao) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('sinal_da_sessao', { p_sessao: sessao })
        return error ? falhou(error) : { ok: true, situacao: data } // 'ok' ou 'perdida'
      }),

    fecharSessao: (sessao) =>
      tentar(async () => {
        const { error } = await cliente.rpc('fechar_sessao', { p_sessao: sessao })
        return error ? falhou(error) : { ok: true }
      }),

    // Fechando a aba: um pedido que o navegador termina mesmo depois de a página sair (fetch com keepalive).
    // Sai na hora, sem esperar nada (a página está acabando); se não sair, a sessão expira sozinha em 3 minutos.
    fecharSessaoNaSaida: (sessao) => {
      if (!cliente || !endereco || !chave || !tokenAtual) return
      try {
        fetch(`${endereco}/rest/v1/rpc/fechar_sessao`, {
          method: 'POST',
          keepalive: true,
          headers: { apikey: chave, Authorization: `Bearer ${tokenAtual}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_sessao: sessao }),
        }).catch(() => {})
      } catch {
        // fechando a página: não há o que fazer
      }
    },

    // ---------- Save no banco (RF10, RNF06) ----------

    carregarSave: () =>
      tentar(async () => {
        const { data, error } = await cliente.from('saves').select('versao, formato, progresso, salvo_em').maybeSingle()
        if (error) return falhou(error)
        return { ok: true, save: data ? { versao: data.versao, formato: data.formato, progresso: data.progresso, salvoEm: data.salvo_em } : null }
      }),

    // { ok, aceito, versao (a guardada no banco), motivo: null | 'versao' | 'sessao' }
    salvarSave: ({ sessao, versao, formato, progresso }) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('salvar_progresso', {
          p_sessao: sessao,
          p_versao: versao,
          p_formato: formato,
          p_progresso: progresso,
        })
        if (error) return falhou(error)
        return { ok: true, aceito: data?.aceito === true, versao: data?.versao ?? null, motivo: data?.motivo ?? null }
      }),

    // ---------- Partidas, ranking e histórico (RF15, RF16) ----------

    registrarPartida: (partida) =>
      tentar(async () => {
        const { data: sessao } = await cliente.auth.getSession()
        const conta = sessao.session?.user?.id
        if (!conta) return { ok: false, codigo: 'semSessao', mensagem: mensagemDoErro('semSessao') }
        const { error } = await cliente.from('partidas').insert({ conta, ...partida })
        return error ? falhou(error) : { ok: true }
      }),

    // Abas: melhoresPontuacoes, nivelTotal, porClasse (com a classe), ouro, monstros, maiorDuracao
    ranking: (aba, classe = null) =>
      tentar(async () => {
        const { data, error } = await cliente.rpc('ranking', { p_aba: aba, p_classe: classe, p_limite: 50 })
        return error ? falhou(error) : { ok: true, linhas: data ?? [] }
      }),

    // Página 1, 2, 3... (20 por página), as mais novas primeiro, com o total para a paginação
    historico: (pagina = 1) =>
      tentar(async () => {
        const inicio = (Math.max(1, pagina) - 1) * partidasPorPaginaNoHistorico
        const { data, error, count } = await cliente
          .from('partidas')
          .select('jogada_em, bioma, resultado, tempo_ativo, pontuacao, ouro', { count: 'exact' })
          .order('jogada_em', { ascending: false })
          .range(inicio, inicio + partidasPorPaginaNoHistorico - 1)
        return error ? falhou(error) : { ok: true, partidas: data ?? [], total: count ?? 0 }
      }),
  }
}
