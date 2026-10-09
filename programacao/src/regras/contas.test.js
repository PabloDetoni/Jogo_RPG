import { describe, expect, it } from 'vitest'
import { escolherProgressoNoLogin, regraDoApelido, totalDePaginas, traduzirErro, validarCadastro } from './contas.js'

describe('cadastro (RF02)', () => {
  const certo = { email: 'nome@exemplo.com', senha: 'senha1234', apelido: 'Pablo_10' }

  it('dados certos: nenhum problema', () => {
    expect(validarCadastro(certo)).toBeNull()
  })

  it('cada campo errado diz o que fazer', () => {
    expect(validarCadastro({ ...certo, email: 'sem-arroba' }).campo).toBe('email')
    expect(validarCadastro({ ...certo, senha: '1234567' })).toMatchObject({ campo: 'senha', mensagem: expect.stringContaining('8') })
    expect(validarCadastro({ ...certo, apelido: 'ab' }).campo).toBe('apelido')
    expect(validarCadastro({ ...certo, apelido: 'com espaço' }).campo).toBe('apelido')
  })

  it('apelido: 3 a 16 letras (com acento), números ou _ (a mesma regra do banco)', () => {
    for (const bom of ['João', 'abc', 'Lucas_2026', 'Ünér']) expect(regraDoApelido.test(bom)).toBe(true)
    for (const ruim of ['ab', 'a'.repeat(17), 'tem espaço', 'ponto.final', 'hífen-não', '']) expect(regraDoApelido.test(ruim)).toBe(false)
  })
})

describe('erros do Supabase em português (RNF09)', () => {
  it('credenciais, não confirmado, limite de e-mail e link expirado', () => {
    expect(traduzirErro({ code: 'invalid_credentials', message: 'Invalid login credentials' }).codigo).toBe('credenciais')
    expect(traduzirErro({ code: 'email_not_confirmed' }).mensagem).toContain('peça outro')
    expect(traduzirErro({ code: 'over_email_send_rate_limit' }).codigo).toBe('limiteDeEmail')
    expect(traduzirErro({ message: 'Email link is invalid or has expired' }).codigo).toBe('linkExpirado')
  })

  it('sem internet: diz que dá para jogar como convidado', () => {
    const semRede = traduzirErro({ name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' })
    expect(semRede).toMatchObject({ codigo: 'semConexao', mensagem: expect.stringContaining('convidado') })
    expect(traduzirErro(new TypeError('Failed to fetch')).codigo).toBe('semConexao')
  })

  it('sem ninguém logado ("Auth session missing!") ou token vencido: "entre de novo"', () => {
    expect(traduzirErro({ name: 'AuthSessionMissingError', message: 'Auth session missing!' }).codigo).toBe('semSessao')
    expect(traduzirErro({ message: 'JWT expired' }).codigo).toBe('semSessao')
  })

  it('banco sem as tabelas do jogo (SQL não rodado): "contas indisponíveis", com o convidado', () => {
    const semSql = traduzirErro({ code: 'PGRST202', message: 'Could not find the function public.ranking(p_aba) in the schema cache' })
    expect(semSql).toMatchObject({ codigo: 'indisponivel', mensagem: expect.stringContaining('convidado') })
    expect(traduzirErro({ code: 'PGRST205' }).codigo).toBe('indisponivel')
  })

  it('apelido pego no meio do cadastro (o banco recusa o perfil): "apelido em uso"', () => {
    expect(traduzirErro({ code: 'unexpected_failure', message: 'Database error saving new user' }).codigo).toBe('apelidoEmUso')
  })

  it('erro desconhecido: mensagem genérica com o código, para dar para pesquisar', () => {
    expect(traduzirErro({ code: 'coisa_nova', message: 'x' })).toEqual({ codigo: 'desconhecido', mensagem: expect.stringContaining('coisa_nova') })
    expect(traduzirErro(null)).toBeNull()
  })
})

describe('qual progresso vale no login (RF03, RF11)', () => {
  const doBanco = { versao: 7, progresso: { ouro: 100 } }
  const local = (versao, versaoNoBanco, extra = {}) => ({ versao, versaoNoBanco, progresso: { ouro: 150 }, partidaEmAndamento: null, ...extra })

  it('o navegador partiu da mesma versão do banco: vale a cópia do navegador, e ela sobe para o banco', () => {
    expect(escolherProgressoNoLogin({ local: local(9, 7), banco: doBanco })).toEqual({
      de: 'local', progresso: { ouro: 150 }, versao: 9, versaoNoBanco: 7, partidaDescartada: false, enviar: true,
    })
  })

  it('cópia igual ao banco: vale a do navegador, sem precisar enviar', () => {
    expect(escolherProgressoNoLogin({ local: local(7, 7), banco: doBanco })).toMatchObject({ de: 'local', enviar: false })
  })

  it('cópia de outra versão (o banco andou em outro computador): vale o banco', () => {
    expect(escolherProgressoNoLogin({ local: local(12, 5), banco: doBanco })).toMatchObject({ de: 'banco', progresso: { ouro: 100 }, versao: 7 })
  })

  it('partida não terminada na cópia do navegador é descartada (RF11, RF12)', () => {
    const comPartida = local(8, 7, { partidaEmAndamento: { bioma: 'floresta' } })
    expect(escolherProgressoNoLogin({ local: comPartida, banco: doBanco })).toMatchObject({ de: 'local', partidaDescartada: true })
  })

  it('banco vazio e cópia no navegador (o primeiro envio não chegou): vale a cópia e ela é enviada', () => {
    expect(escolherProgressoNoLogin({ local: local(2, 0), banco: null })).toMatchObject({ de: 'local', enviar: true, versaoNoBanco: 0 })
  })

  it('conta nova criada a partir do convidado: o progresso do convidado vai para a conta (RF03)', () => {
    const convidado = { progresso: { ouro: 300 }, partidaEmAndamento: null }
    expect(escolherProgressoNoLogin({ convidado })).toMatchObject({ de: 'convidado', progresso: { ouro: 300 }, versao: 1, enviar: true })
  })

  it('conta antiga: o convidado nunca se mistura (só entra quando o banco e a cópia estão vazios)', () => {
    const convidado = { progresso: { ouro: 300 } }
    expect(escolherProgressoNoLogin({ banco: doBanco, convidado }).de).toBe('banco')
  })

  it('sem nada: primeiro acesso (narrativa e escolha da classe)', () => {
    expect(escolherProgressoNoLogin({})).toMatchObject({ de: 'novo', progresso: null })
  })
})

describe('histórico: páginas', () => {
  it('25 partidas, 20 por página: 2 páginas; nenhuma: 1 página vazia', () => {
    expect(totalDePaginas(25, 20)).toBe(2)
    expect(totalDePaginas(20, 20)).toBe(1)
    expect(totalDePaginas(0, 20)).toBe(1)
  })
})
