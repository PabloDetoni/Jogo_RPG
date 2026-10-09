import { describe, expect, it, vi } from 'vitest'
import { atualizarEstado, criarEstadoInicial } from '../estado/estadoDoJogo.js'
import { preferenciasPadrao } from '../estado/preferencias.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { criarArmazenamento } from '../salvamento/armazenamento.js'
import { chaves } from '../salvamento/chaves.js'
import { criarSalvadorDaConta } from '../salvamento/salvadorDoConvidado.js'
import { storageFalso } from '../testes/ajudantes.js'
import { criarFluxoDaConta } from './fluxo.js'

const usuario = { id: 'u1', email: 'a@b.com' }
const progressoDoBanco = { ...progressoInicial(), personagens: [novoPersonagem('tanque')], lider: 'tanque', ouro: 300 }

// Um "navegador" de teste: o fluxo com um serviço falso, o estado do jogo de verdade e um localStorage falso
function montar({ servico: mudancas = {}, trava = 'ok', convidado = null } = {}) {
  const servico = {
    disponivel: true,
    entrar: vi.fn(async () => ({ ok: true, usuario })),
    usuarioAtual: vi.fn(async () => ({ ok: true, usuario })),
    abrirSessao: vi.fn(async () => ({ ok: true, situacao: 'ok' })),
    sinalDaSessao: vi.fn(async () => ({ ok: true, situacao: 'ok' })),
    fecharSessao: vi.fn(async () => ({ ok: true })),
    fecharSessaoNaSaida: vi.fn(),
    sairDoSupabase: vi.fn(async () => ({ ok: true })),
    carregarPerfil: vi.fn(async () => ({ ok: true, apelido: 'Pablo' })),
    definirApelido: vi.fn(async () => ({ ok: true })),
    carregarSave: vi.fn(async () => ({ ok: true, save: null })),
    salvarSave: vi.fn(async ({ versao }) => ({ ok: true, aceito: true, versao, motivo: null })),
    registrarPartida: vi.fn(async () => ({ ok: true })),
    apelidoDisponivel: vi.fn(async () => ({ ok: true, disponivel: true })),
    cadastrar: vi.fn(async () => ({ ok: true, conta: { id: 'novo' } })),
    ...mudancas,
  }
  const storage = storageFalso()
  const armazenamento = criarArmazenamento(storage)
  let estado = criarEstadoInicial(preferenciasPadrao)
  const soltar = vi.fn()
  const recarregar = vi.fn()
  const apagarConvidado = vi.fn()
  const despachar = (acao) => {
    estado = atualizarEstado(estado, acao)
  }
  const fluxo = criarFluxoDaConta({
    servico,
    armazenamento,
    criarSalvadorDaConta,
    lerConvidado: () => convidado,
    apagarConvidado,
    pegarTrava: async () => ({ situacao: trava, soltar }),
    sessaoDaAba: () => 'sessao-1',
    despachar,
    recarregar,
  })
  // Como o ProvedorDoJogo faz num momento de salvamento: grava a cópia local e depois envia
  const salvarAgora = async () => {
    fluxo.salvador.salvar({ perfil: estado.perfilLocal, progresso: estado.progresso, partidaEmAndamento: null })
    return fluxo.enviarAoBanco()
  }
  return { fluxo, servico, storage, armazenamento, despachar, estado: () => estado, soltar, recarregar, apagarConvidado, salvarAgora }
}

describe('entrar na conta (RF04, RF05, RF11)', () => {
  it('conta com save no banco: entra no Reino com o progresso do banco, sem reenviar', async () => {
    const t = montar({ servico: { carregarSave: vi.fn(async () => ({ ok: true, save: { versao: 7, progresso: progressoDoBanco } })) } })
    expect(await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })).toEqual({ ok: true })
    expect(t.estado()).toMatchObject({ tela: 'reino', tipoJogador: 'conta', perfilLocal: 'conta', conta: { id: 'u1', apelido: 'Pablo' } })
    expect(t.estado().progresso.ouro).toBe(300)
    expect(t.servico.abrirSessao).toHaveBeenCalledWith('sessao-1')
    expect(t.servico.salvarSave).not.toHaveBeenCalled()
  })

  it('conta em uso em outro lugar: aviso "conta em uso", sai do Supabase só aqui e solta a trava da aba', async () => {
    const t = montar({ servico: { abrirSessao: vi.fn(async () => ({ ok: true, situacao: 'em_uso' })) } })
    const resposta = await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    expect(resposta).toMatchObject({ ok: false, codigo: 'emUso', mensagem: expect.stringContaining('Conta em uso') })
    expect(t.servico.sairDoSupabase).toHaveBeenCalled()
    expect(t.soltar).toHaveBeenCalled()
    expect(t.estado().tipoJogador).toBe('nenhum')
  })

  it('outra aba deste navegador já está com uma conta: não entra e não mexe na sessão', async () => {
    const t = montar({ trava: 'ocupada' })
    expect(await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })).toMatchObject({ ok: false, codigo: 'abaOcupada' })
    expect(t.servico.abrirSessao).not.toHaveBeenCalled()
  })

  it('senha errada: a mensagem do serviço volta para a tela, e nada mais acontece', async () => {
    const t = montar({ servico: { entrar: vi.fn(async () => ({ ok: false, codigo: 'credenciais', mensagem: 'E-mail ou senha errados.' })) } })
    expect(await t.fluxo.entrar({ email: 'a@b.com', senha: 'errada123' })).toMatchObject({ ok: false, codigo: 'credenciais' })
    expect(t.servico.abrirSessao).not.toHaveBeenCalled()
  })

  it('conta sem apelido (criada fora do jogo): pede o apelido antes de entrar', async () => {
    const t = montar({ servico: { carregarPerfil: vi.fn(async () => ({ ok: true, apelido: null })) } })
    expect(await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })).toEqual({ ok: true, precisaApelido: true })
    expect(t.estado().tipoJogador).toBe('nenhum')
    expect(await t.fluxo.escolherApelido('Lucas')).toEqual({ ok: true })
    expect(t.estado()).toMatchObject({ tipoJogador: 'conta', conta: { apelido: 'Lucas' }, tela: 'narrativaInicial' })
  })

  it('o navegador tem uma cópia mais nova que partiu da versão do banco: vale a cópia, e ela sobe (RF11)', async () => {
    const t = montar({ servico: { carregarSave: vi.fn(async () => ({ ok: true, save: { versao: 7, progresso: progressoDoBanco } })) } })
    const salvador = criarSalvadorDaConta(t.armazenamento, 'u1')
    salvador.comecarCom({ progresso: { ...progressoDoBanco, ouro: 999 }, versao: 7, versaoNoBanco: 7 })
    salvador.salvar({ perfil: 'conta', progresso: { ...progressoDoBanco, ouro: 1000 }, partidaEmAndamento: null }) // versão 8
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    expect(t.estado().progresso.ouro).toBe(1000)
    expect(t.servico.salvarSave).toHaveBeenCalledWith(expect.objectContaining({ versao: 8, sessao: 'sessao-1' }))
  })
})

describe('conta criada a partir do convidado (RF03)', () => {
  const doConvidado = { progresso: { ...progressoInicial(), personagens: [{ ...novoPersonagem('guerreiro'), nivel: 5 }], lider: 'guerreiro', ouro: 300 }, partidaEmAndamento: null }

  it('cadastro pelas Configurações do convidado marca o navegador; no primeiro login, a conta recebe o progresso', async () => {
    const t = montar({ convidado: doConvidado, servico: { cadastrar: vi.fn(async () => ({ ok: true, conta: { id: 'u1' } })) } })
    await t.fluxo.cadastrar({ email: 'a@b.com', senha: 'senha1234', apelido: 'Pablo', deConvidado: true })
    expect(JSON.parse(t.storage.dados.get(chaves.transferirConvidado))).toEqual({ conta: 'u1' })
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    expect(t.estado().progresso.ouro).toBe(300)
    expect(t.estado().progresso.personagens[0]).toMatchObject({ classe: 'guerreiro', nivel: 5 })
    expect(t.servico.salvarSave).toHaveBeenCalledWith(expect.objectContaining({ versao: 1 }))
    // depois de a nuvem receber, o convidado deixa de existir e a marca some
    expect(t.apagarConvidado).toHaveBeenCalled()
    expect(t.storage.dados.has(chaves.transferirConvidado)).toBe(false)
  })

  it('sem internet na hora de passar: o convidado NÃO é apagado (tenta de novo no próximo login)', async () => {
    const t = montar({ convidado: doConvidado, servico: { salvarSave: vi.fn(async () => ({ ok: false, codigo: 'semConexao', mensagem: 'x' })) } })
    t.storage.dados.set(chaves.transferirConvidado, JSON.stringify({ conta: 'u1' }))
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    expect(t.apagarConvidado).not.toHaveBeenCalled()
    expect(t.estado().nuvem.situacao).toBe('pendente')
  })

  it('entrar numa conta antiga não mistura o convidado', async () => {
    const t = montar({ convidado: doConvidado, servico: { carregarSave: vi.fn(async () => ({ ok: true, save: { versao: 3, progresso: progressoDoBanco } })) } })
    t.storage.dados.set(chaves.transferirConvidado, JSON.stringify({ conta: 'outra-conta' }))
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    expect(t.estado().progresso.ouro).toBe(300) // o do banco
    expect(t.estado().progresso.lider).toBe('tanque')
    expect(t.apagarConvidado).not.toHaveBeenCalled()
  })

  it('cadastro com apelido em uso: avisa sem chamar o cadastro', async () => {
    const t = montar({ servico: { apelidoDisponivel: vi.fn(async () => ({ ok: true, disponivel: false })) } })
    expect(await t.fluxo.cadastrar({ email: 'a@b.com', senha: 'senha1234', apelido: 'Pablo' })).toMatchObject({ ok: false, codigo: 'apelidoEmUso', campo: 'apelido' })
    expect(t.servico.cadastrar).not.toHaveBeenCalled()
  })
})

describe('save no banco durante o jogo (RF10, RNF06)', () => {
  async function entrouComBanco(mudancas = {}) {
    const t = montar({ servico: { carregarSave: vi.fn(async () => ({ ok: true, save: { versao: 7, progresso: progressoDoBanco } })), ...mudancas } })
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    return t
  }

  it('cada momento de salvamento envia a versão nova; aceito, a cópia local marca de onde partiu', async () => {
    const t = await entrouComBanco()
    t.despachar({ tipo: 'escolherLider', classe: 'tanque' })
    t.despachar({ tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' }) // muda o ouro
    expect(await t.salvarAgora()).toEqual({ aceito: true })
    expect(t.servico.salvarSave).toHaveBeenLastCalledWith(expect.objectContaining({ versao: 8 }))
    expect(JSON.parse(t.storage.dados.get(chaves.conta('u1')))).toMatchObject({ versao: 8, versaoNoBanco: 8 })
  })

  it('save antigo recusado (o banco tem uma versão mais nova): o do banco passa a valer, com aviso', async () => {
    const maisNovo = { ...progressoDoBanco, ouro: 5000 }
    const t = await entrouComBanco()
    t.servico.salvarSave = vi.fn(async () => ({ ok: true, aceito: false, versao: 9, motivo: 'versao' }))
    t.servico.carregarSave = vi.fn(async () => ({ ok: true, save: { versao: 9, progresso: maisNovo } }))
    t.despachar({ tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    expect(await t.salvarAgora()).toEqual({ aceito: false })
    expect(t.estado().progresso.ouro).toBe(5000)
    expect(t.estado().avisos.at(-1).texto).toContain('mais novo')
  })

  it('outra sessão entrou na conta: esta aba sai da conta e volta à Tela inicial com o aviso', async () => {
    const t = await entrouComBanco()
    t.servico.salvarSave = vi.fn(async () => ({ ok: true, aceito: false, versao: 7, motivo: 'sessao' }))
    t.despachar({ tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    await t.salvarAgora()
    expect(t.recarregar).toHaveBeenCalledWith(expect.stringContaining('aberta em outro lugar'))
  })

  it('sem internet no envio: o progresso continua na cópia local, a nuvem fica "pendente" e o próximo envio leva tudo', async () => {
    const t = await entrouComBanco({ salvarSave: vi.fn(async () => ({ ok: false, codigo: 'semConexao', mensagem: 'x' })) })
    t.despachar({ tipo: 'contratar', contrato: 'temporario', classe: 'arqueiro' })
    expect(await t.salvarAgora()).toBeNull()
    expect(t.estado().nuvem.situacao).toBe('pendente')
    expect(JSON.parse(t.storage.dados.get(chaves.conta('u1')))).toMatchObject({ versao: 8, versaoNoBanco: 7 })
    t.servico.salvarSave = vi.fn(async ({ versao }) => ({ ok: true, aceito: true, versao }))
    expect(await t.fluxo.enviarAoBanco()).toEqual({ aceito: true })
    expect(t.estado().nuvem.situacao).toBe('ok')
  })

  it('partidas: as gravadas saem da fila; a que falhou fica para depois', async () => {
    const t = await entrouComBanco()
    const partida = { bioma: 'floresta', resultado: 'vitoria', pontuacao: 1, ouro: 1, monstros: 1, tempo_ativo: 1, tempo_total: 1 }
    t.despachar({ tipo: 'irPara', destino: 'partida' })
    t.despachar({ tipo: 'escolherBioma', bioma: 'floresta' })
    // duas partidas na fila: a primeira vai, a segunda falha
    let chamadas = 0
    t.servico.registrarPartida = vi.fn(async () => (++chamadas === 1 ? { ok: true } : { ok: false, codigo: 'semConexao' }))
    const estado = t.estado()
    estado.partidasParaRegistrar.push(partida, partida)
    await t.fluxo.registrarPartidas(t.estado().partidasParaRegistrar)
    expect(t.estado().partidasParaRegistrar).toHaveLength(1)
  })
})

describe('senha nova (RF06)', () => {
  it('sem o link do e-mail (ninguém logado): explica onde pedir outro link', async () => {
    const t = montar({ servico: { trocarSenha: vi.fn(async () => ({ ok: false, codigo: 'semSessao', mensagem: 'x' })) } })
    expect(await t.fluxo.trocarSenha('senhanova123')).toMatchObject({ ok: false, mensagem: expect.stringContaining('Esqueci minha senha') })
  })

  it('com o link: troca, sai e volta ao Login com "Senha trocada!"', async () => {
    const t = montar({ servico: { trocarSenha: vi.fn(async () => ({ ok: true })) } })
    expect(await t.fluxo.trocarSenha('senhanova123')).toEqual({ ok: true })
    expect(t.servico.sairDoSupabase).toHaveBeenCalled()
    expect(t.estado()).toMatchObject({ tela: 'login', mensagemDoAcesso: { tipo: 'bom' } })
  })
})

describe('sessão e saída (RF05, RF08)', () => {
  it('o sinal da sessão perdida (outra sessão entrou depois que esta expirou): sai e avisa', async () => {
    const t = montar()
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    t.servico.sinalDaSessao = vi.fn(async () => ({ ok: true, situacao: 'perdida' }))
    await t.fluxo.sinal()
    expect(t.recarregar).toHaveBeenCalled()
  })

  it('sem internet, o sinal falha em silêncio (a sessão só expira no banco depois de 3 minutos)', async () => {
    const t = montar()
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    t.servico.sinalDaSessao = vi.fn(async () => ({ ok: false, codigo: 'semConexao' }))
    await t.fluxo.sinal()
    expect(t.recarregar).not.toHaveBeenCalled()
  })

  it('Sair da conta: envia o save, fecha a sessão na hora e sai do Supabase neste navegador', async () => {
    const t = montar()
    await t.fluxo.entrar({ email: 'a@b.com', senha: 'senha1234' })
    t.despachar({ tipo: 'escolherClasseInicial', classe: 'mago' })
    t.fluxo.salvador.salvar({ perfil: 'conta', progresso: t.estado().progresso, partidaEmAndamento: null })
    expect(await t.fluxo.sair()).toEqual({ nuvemOk: true })
    expect(t.servico.fecharSessao).toHaveBeenCalledWith('sessao-1')
    expect(t.servico.sairDoSupabase).toHaveBeenCalled()
    expect(t.soltar).toHaveBeenCalled()
  })
})
