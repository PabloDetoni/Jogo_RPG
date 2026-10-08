// Regras das contas (Fase 2; RF02 a RF11). Funções puras: nada aqui fala com o Supabase.
// O que conversa com o Supabase fica em src/conta/servico.js; as mensagens dizem o que aconteceu e como resolver (RNF09).

// Apelido (RF02): 3 a 16 letras (com acento), números ou _. A mesma regra está no banco (001_contas.sql).
export const regraDoApelido = /^[A-Za-z0-9_À-ÖØ-öø-ÿ]{3,16}$/
export const tamanhoMinimoDaSenha = 8

// Confere os campos do cadastro. Devolve null (tudo certo) ou { campo, mensagem } do primeiro problema.
export function validarCadastro({ email = '', senha = '', apelido = '' }) {
  if (!emailValido(email)) return { campo: 'email', mensagem: 'Escreva um e-mail válido, como nome@exemplo.com.' }
  if (senha.length < tamanhoMinimoDaSenha) {
    return { campo: 'senha', mensagem: `A senha precisa ter pelo menos ${tamanhoMinimoDaSenha} caracteres.` }
  }
  if (!regraDoApelido.test(apelido)) {
    return { campo: 'apelido', mensagem: 'O apelido precisa ter de 3 a 16 letras, números ou _ (sem espaços).' }
  }
  return null
}

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Erros do Supabase (e da internet) → { codigo, mensagem } em português, dizendo o que fazer
const mensagens = {
  credenciais: 'E-mail ou senha errados. Confira os dois e tente de novo; se esqueceu a senha, use "Esqueci minha senha".',
  naoConfirmado: 'Este e-mail ainda não foi confirmado. Abra o link que mandamos (veja também o spam) ou peça outro abaixo.',
  jaExiste: 'Já existe uma conta com este e-mail. Entre com ela ou use "Esqueci minha senha".',
  senhaFraca: `Senha fraca: use pelo menos ${tamanhoMinimoDaSenha} caracteres, misturando letras e números.`,
  limiteDeEmail: 'Muitos e-mails em pouco tempo. Espere alguns minutos e tente de novo.',
  emailInvalido: 'Esse e-mail não parece válido. Confira se está escrito certo.',
  semConexao: 'Sem conexão com o servidor. Confira a internet e tente de novo. Enquanto isso, dá para jogar como convidado.',
  linkExpirado: 'O link expirou ou já foi usado. Peça outro.',
  apelidoEmUso: 'Esse apelido já está em uso. Escolha outro.',
  mesmaSenha: 'A senha nova precisa ser diferente da antiga.',
  indisponivel: 'As contas estão indisponíveis agora. Dá para jogar como convidado.',
  semSessao: 'Sua entrada expirou. Entre de novo com e-mail e senha.',
}

export function mensagemDoErro(codigo, detalhe) {
  return mensagens[codigo] ?? `Algo deu errado${detalhe ? ` (${detalhe})` : ''}. Tente de novo em instantes.`
}

export function traduzirErro(erro) {
  if (!erro) return null
  const codigo = String(erro.code ?? '')
  const texto = String(erro.message ?? erro).toLowerCase()
  const status = erro.status
  let nosso = null
  if (erro.name === 'AuthRetryableFetchError' || status === 0 || texto.includes('failed to fetch') || texto.includes('networkerror') || texto.includes('network request failed')) {
    nosso = 'semConexao'
  } else if (codigo === 'invalid_credentials' || texto.includes('invalid login credentials')) nosso = 'credenciais'
  else if (codigo === 'email_not_confirmed' || texto.includes('email not confirmed')) nosso = 'naoConfirmado'
  else if (codigo === 'user_already_exists' || codigo === 'email_exists' || texto.includes('already registered')) nosso = 'jaExiste'
  else if (codigo === 'weak_password' || texto.includes('password should be')) nosso = 'senhaFraca'
  else if (codigo === 'over_email_send_rate_limit' || codigo === 'over_request_rate_limit' || texto.includes('rate limit')) nosso = 'limiteDeEmail'
  else if (codigo === 'otp_expired' || texto.includes('expired')) nosso = 'linkExpirado'
  else if (codigo === 'email_address_invalid' || (texto.includes('email address') && texto.includes('invalid'))) nosso = 'emailInvalido'
  else if (codigo === 'same_password' || texto.includes('different from the old')) nosso = 'mesmaSenha'
  // O banco recusou criar o perfil: o apelido acabou de ser usado por outra pessoa (o jogo confere antes)
  else if (codigo === 'unexpected_failure' || texto.includes('database error saving new user')) nosso = 'apelidoEmUso'
  else if (codigo === 'session_not_found' || codigo === 'refresh_token_not_found' || texto.includes('jwt expired')) nosso = 'semSessao'
  // O banco ainda não tem as tabelas ou funções do jogo (o SQL não foi rodado): para o jogador, contas indisponíveis
  else if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(codigo)) nosso = 'indisponivel'
  const final = nosso ?? 'desconhecido'
  return { codigo: final, mensagem: mensagemDoErro(final, codigo || erro.message) }
}

// Qual progresso vale ao entrar na conta (RF03, RF11; diagrama de Acesso):
// - local: a cópia da conta neste navegador, como lerArquivoDeSave devolve, mais versaoNoBanco (a versão do banco de
//   onde ela partiu); null se não há;
// - banco: { versao, progresso } guardado no Supabase; null se a conta ainda não tem save;
// - convidado: o progresso do convidado deste navegador, só quando a conta foi criada a partir dele; senão null.
// Devolve { de, progresso, versao, versaoNoBanco, partidaDescartada, enviar }:
// de: 'local' | 'banco' | 'convidado' | 'novo' (primeiro acesso: narrativa e escolha da classe);
// enviar: o banco precisa receber este progresso agora (ele é mais novo que o do banco, ou o banco não tem nada).
export function escolherProgressoNoLogin({ local = null, banco = null, convidado = null }) {
  const partidaDescartada = Boolean(local?.partidaEmAndamento)
  if (banco) {
    // O navegador partiu da mesma versão do banco: o que foi feito aqui depois do último envio vale (RF11)
    if (local && local.versaoNoBanco === banco.versao && local.versao >= banco.versao) {
      return { de: 'local', progresso: local.progresso, versao: local.versao, versaoNoBanco: banco.versao, partidaDescartada, enviar: local.versao > banco.versao }
    }
    return { de: 'banco', progresso: banco.progresso, versao: banco.versao, versaoNoBanco: banco.versao, partidaDescartada: false, enviar: false }
  }
  if (local) {
    return { de: 'local', progresso: local.progresso, versao: Math.max(1, local.versao), versaoNoBanco: 0, partidaDescartada, enviar: true }
  }
  if (convidado) {
    return { de: 'convidado', progresso: convidado.progresso, versao: 1, versaoNoBanco: 0, partidaDescartada: Boolean(convidado.partidaEmAndamento), enviar: true }
  }
  return { de: 'novo', progresso: null, versao: 0, versaoNoBanco: 0, partidaDescartada: false, enviar: false }
}

// Histórico (RF16): quantas páginas, com "porPagina" partidas cada
export function totalDePaginas(total, porPagina) {
  return Math.max(1, Math.ceil(Math.max(0, total) / porPagina))
}
