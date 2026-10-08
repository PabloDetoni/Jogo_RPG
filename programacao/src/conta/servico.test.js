import { describe, expect, it, vi } from 'vitest'
import { criarServicoDeConta } from './servico.js'

// Um Supabase falso: cada chamada devolve o que o teste mandar. Assim o serviço é testado sem internet.
function clienteFalso({ rpc = {}, auth = {}, tabelas = {} } = {}) {
  const consulta = (tabela) => {
    const resposta = tabelas[tabela] ?? { data: null, error: null }
    const encadeia = {
      select: () => encadeia,
      order: () => encadeia,
      range: () => Promise.resolve(resposta),
      maybeSingle: () => Promise.resolve(resposta),
      insert: (linha) => {
        encadeia.inserido = linha
        return Promise.resolve(resposta)
      },
    }
    return encadeia
  }
  return {
    rpc: vi.fn(async (nome, argumentos) => (typeof rpc[nome] === 'function' ? rpc[nome](argumentos) : rpc[nome] ?? { data: null, error: null })),
    from: vi.fn(consulta),
    auth: {
      signUp: vi.fn(async () => auth.signUp ?? { data: { user: { id: 'u1', identities: [{}] } }, error: null }),
      signInWithPassword: vi.fn(async () => auth.signIn ?? { data: { user: { id: 'u1', email: 'a@b.com' } }, error: null }),
      resend: vi.fn(async () => ({ error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
      updateUser: vi.fn(async () => auth.updateUser ?? { error: null }),
      signOut: vi.fn(async () => ({ error: null })),
      getSession: vi.fn(async () => auth.getSession ?? { data: { session: { user: { id: 'u1', email: 'a@b.com' }, access_token: 't' } }, error: null }),
      onAuthStateChange: vi.fn((ouvir) => {
        if (auth.sessaoInicial) ouvir('INITIAL_SESSION', auth.sessaoInicial)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }),
    },
  }
}

describe('serviço de conta (Fase 2)', () => {
  it('sem o Supabase configurado: tudo responde "indisponível", sem lançar erro', async () => {
    const servico = criarServicoDeConta(null)
    expect(servico.disponivel).toBe(false)
    expect(await servico.entrar({ email: 'a@b.com', senha: 'x' })).toMatchObject({ ok: false, codigo: 'indisponivel' })
    expect(await servico.ranking('ouro')).toMatchObject({ ok: false })
  })

  it('cadastro: manda o apelido e o endereço do jogo para o link de confirmação', async () => {
    const cliente = clienteFalso()
    const servico = criarServicoDeConta(cliente, { origem: 'https://jogo.vercel.app' })
    expect(await servico.cadastrar({ email: ' a@b.com ', senha: 'senha1234', apelido: 'Pablo' })).toEqual({ ok: true, conta: { id: 'u1' } })
    expect(cliente.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'senha1234',
      options: { emailRedirectTo: 'https://jogo.vercel.app', data: { apelido: 'Pablo' } },
    })
  })

  it('cadastro com e-mail que já existe (o Supabase devolve o usuário sem identidades): "já existe"', async () => {
    const cliente = clienteFalso({ auth: { signUp: { data: { user: { id: 'u1', identities: [] } }, error: null } } })
    expect(await criarServicoDeConta(cliente).cadastrar({ email: 'a@b.com', senha: 'x', apelido: 'P' })).toMatchObject({ ok: false, codigo: 'jaExiste' })
  })

  it('login: erro do Supabase vira mensagem em português; falha de rede não lança erro', async () => {
    const naoConfirmado = clienteFalso({ auth: { signIn: { data: {}, error: { code: 'email_not_confirmed', message: 'Email not confirmed' } } } })
    expect(await criarServicoDeConta(naoConfirmado).entrar({ email: 'a@b.com', senha: 'x' })).toMatchObject({ ok: false, codigo: 'naoConfirmado' })
    const semRede = clienteFalso()
    semRede.auth.signInWithPassword = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(await criarServicoDeConta(semRede).entrar({ email: 'a@b.com', senha: 'x' })).toMatchObject({ ok: false, codigo: 'semConexao' })
  })

  it('sair do Supabase só neste navegador (não derruba a sessão de outro lugar)', async () => {
    const cliente = clienteFalso()
    await criarServicoDeConta(cliente).sairDoSupabase()
    expect(cliente.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('salvar no banco: devolve se foi aceito e por quê (versão antiga ou outra sessão)', async () => {
    const cliente = clienteFalso({ rpc: { salvar_progresso: { data: { aceito: false, versao: 7, motivo: 'versao' }, error: null } } })
    const resposta = await criarServicoDeConta(cliente).salvarSave({ sessao: 's1', versao: 6, formato: 1, progresso: {} })
    expect(resposta).toEqual({ ok: true, aceito: false, versao: 7, motivo: 'versao' })
    expect(cliente.rpc).toHaveBeenCalledWith('salvar_progresso', { p_sessao: 's1', p_versao: 6, p_formato: 1, p_progresso: {} })
  })

  it('apelido: disponível, em uso e inválido', async () => {
    const cliente = clienteFalso({ rpc: { apelido_disponivel: { data: false, error: null }, definir_meu_apelido: ({ p_apelido }) => ({ data: p_apelido === 'ab' ? 'invalido' : 'em_uso', error: null }) } })
    const servico = criarServicoDeConta(cliente)
    expect(await servico.apelidoDisponivel('Pablo')).toEqual({ ok: true, disponivel: false })
    expect(await servico.definirApelido('Pablo')).toMatchObject({ ok: false, codigo: 'apelidoEmUso' })
    expect(await servico.definirApelido('ab')).toMatchObject({ ok: false, codigo: 'apelidoInvalido' })
  })

  it('registrar partida: sempre com a conta de quem está logado', async () => {
    const cliente = clienteFalso()
    await criarServicoDeConta(cliente).registrarPartida({ bioma: 'floresta', resultado: 'vitoria' })
    const consulta = cliente.from.mock.results.at(-1).value
    expect(consulta.inserido).toEqual({ conta: 'u1', bioma: 'floresta', resultado: 'vitoria' })
  })

  it('fechar a aba: o pedido que encerra a sessão sai na hora, com o token guardado (keepalive)', () => {
    const fetchDeVerdade = globalThis.fetch
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true }))
    try {
      const cliente = clienteFalso({ auth: { sessaoInicial: { access_token: 'token-1', user: { id: 'u1' } } } })
      criarServicoDeConta(cliente, { endereco: 'https://x.supabase.co', chave: 'sb_publishable_x' }).fecharSessaoNaSaida('s1')
      expect(globalThis.fetch).toHaveBeenCalledWith('https://x.supabase.co/rest/v1/rpc/fechar_sessao', expect.objectContaining({ keepalive: true, body: JSON.stringify({ p_sessao: 's1' }) }))
      expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token-1')
      // sem ninguém logado, nada sai
      globalThis.fetch.mockClear()
      criarServicoDeConta(clienteFalso(), { endereco: 'https://x.supabase.co', chave: 'k' }).fecharSessaoNaSaida('s1')
      expect(globalThis.fetch).not.toHaveBeenCalled()
    } finally {
      globalThis.fetch = fetchDeVerdade
    }
  })

  it('histórico: devolve a página e o total', async () => {
    const cliente = clienteFalso({ tabelas: { partidas: { data: [{ pontuacao: 10 }], error: null, count: 25 } } })
    expect(await criarServicoDeConta(cliente).historico(2)).toEqual({ ok: true, partidas: [{ pontuacao: 10 }], total: 25 })
  })
})
