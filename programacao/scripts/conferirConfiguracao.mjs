// Confere a configuração do Supabase e da Vercel (Fase 2). Uso: npm run conferir:configuracao
// Só lê: não envia e-mail, não cria conta e não muda nada no banco nem na Vercel. Pode rodar quantas vezes quiser.
// Para cada coisa que faltar, diz o que fazer (os passo a passo estão em documentacao/Supabase_passo_a_passo.md e
// documentacao/Vercel_passo_a_passo.md).
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from 'vite'

const env = loadEnv('development', process.cwd(), '')
const URL_DO_SUPABASE = (env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const CHAVE = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
// O endereço principal do jogo na Vercel (pode trocar no .env.local com ENDERECO_DA_VERCEL)
const VERCEL = (env.ENDERECO_DA_VERCEL || 'https://jogo-rpg-six.vercel.app').replace(/\/$/, '')
const PREVIA = (env.ENDERECO_DA_PREVIA || '').replace(/\/$/, '')

let faltas = 0
let avisos = 0
const ok = (texto) => console.log(`  ok    ${texto}`)
const falta = (texto, oQueFazer) => {
  faltas++
  console.log(`  FALTA ${texto}\n        → ${oQueFazer}`)
}
const aviso = (texto, detalhe) => {
  avisos++
  console.log(`  aviso ${texto}${detalhe ? `\n        → ${detalhe}` : ''}`)
}

// ---------- 1. .env.local ----------
console.log('1. Arquivo programacao/.env.local')
if (/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(URL_DO_SUPABASE)) ok(`VITE_SUPABASE_URL = ${URL_DO_SUPABASE}`)
else falta('VITE_SUPABASE_URL vazio ou estranho', 'cole o Project URL do Supabase (Project Settings → API), como https://abcd.supabase.co')
if (CHAVE.startsWith('sb_publishable_')) ok('VITE_SUPABASE_PUBLISHABLE_KEY é a chave publicável')
else if (CHAVE.startsWith('sb_secret_') || CHAVE.includes('service_role')) {
  falta('a chave no .env.local é a SECRETA', 'troque já pela publicável (sb_publishable_...) e, no Supabase, gere uma chave secreta nova (API Keys)')
} else falta('VITE_SUPABASE_PUBLISHABLE_KEY vazia ou estranha', 'cole a chave publicável (começa com sb_publishable_)')

const contas = ['A', 'B'].map((nome) => ({ nome, email: env[`TESTE_CONTA_${nome}_EMAIL`], senha: env[`TESTE_CONTA_${nome}_SENHA`] }))
const contasPreenchidas = contas.filter((conta) => conta.email && conta.senha)
if (contasPreenchidas.length === 2) ok('as duas contas de teste estão preenchidas')
else {
  falta(
    `contas de teste no .env.local: ${contasPreenchidas.length} de 2`,
    'crie as contas A e B no Supabase (Authentication → Users → Add user → Create new user, com Auto Confirm User) e acrescente TESTE_CONTA_A_EMAIL, TESTE_CONTA_A_SENHA, TESTE_CONTA_B_EMAIL e TESTE_CONTA_B_SENHA (Supabase_passo_a_passo.md, passo D)',
  )
}
if (!URL_DO_SUPABASE || !CHAVE) {
  console.log(`\n${faltas} coisa(s) para arrumar antes de continuar.`)
  process.exit(1)
}

const novoCliente = () => createClient(URL_DO_SUPABASE, CHAVE, { auth: { persistSession: false, autoRefreshToken: false } })
const anonimo = novoCliente()

// ---------- 2. SQL ----------
console.log('2. Banco (o SQL do programacao/supabase/001_contas.sql)')
const ranking = await anonimo.rpc('ranking', { p_aba: 'ouro' })
if (ranking.error?.code === 'PGRST202') falta('a função ranking não existe', 'rode o 001_contas.sql no SQL Editor (Supabase_passo_a_passo.md, passo A)')
else if (ranking.error) falta(`o ranking deu erro: ${ranking.error.message}`, 'me mande essa mensagem')
else ok(`o ranking abre sem login (${ranking.data.length} jogador(es) nele agora)`)
const apelido = await anonimo.rpc('apelido_disponivel', { p_apelido: 'NinguemUsaEste123' })
if (apelido.error) falta(`apelido_disponivel deu erro: ${apelido.error.message}`, 'rode o 001_contas.sql de novo')
else ok('a conferência de apelido funciona')
for (const tabela of ['perfis', 'sessoes', 'saves', 'partidas']) {
  const lido = await anonimo.from(tabela).select('*').limit(1)
  if (lido.error?.code === 'PGRST205' || lido.error?.code === '42P01') falta(`a tabela ${tabela} não existe`, 'rode o 001_contas.sql no SQL Editor')
  else if (lido.error) falta(`a tabela ${tabela} deu erro: ${lido.error.message}`, 'me mande essa mensagem')
  else if (lido.data.length > 0) falta(`sem login dá para ler a tabela ${tabela}`, 'a regra de segurança (RLS) não está valendo: rode o 001_contas.sql de novo e me avise')
  else ok(`tabela ${tabela} existe e ninguém sem login lê nada dela`)
}
const salvarSemLogin = await anonimo.rpc('salvar_progresso', { p_sessao: '00000000-0000-4000-8000-000000000000', p_versao: 1, p_formato: 1, p_progresso: {} })
if (salvarSemLogin.error) ok('sem login, ninguém salva progresso')
else falta('sem login deu para chamar o salvar_progresso', 'me avise: a permissão da função está aberta demais')

// ---------- 3. Login por e-mail ----------
console.log('3. Login por e-mail (Authentication)')
const configuracao = await (await fetch(`${URL_DO_SUPABASE}/auth/v1/settings`, { headers: { apikey: CHAVE } })).json()
if (configuracao.external?.email) ok('o login por e-mail está ligado')
else falta('o login por e-mail está desligado', 'Authentication → Sign In / Providers → Email: ligue')
if (configuracao.mailer_autoconfirm === false) ok('a confirmação de e-mail é obrigatória (RF02)')
else falta('a confirmação de e-mail está desligada', 'Authentication → Sign In / Providers → Email: ligue "Confirm email"')
if (configuracao.disable_signup === false) ok('o cadastro de contas novas está aberto')
else falta('o cadastro de contas novas está fechado', 'Authentication → Sign In / Providers: ligue "Allow new users to sign up"')
aviso('a senha mínima (8) não dá para conferir daqui sem mexer numa conta', 'confira no painel: Authentication → Sign In / Providers → Email → Minimum password length = 8')

// ---------- 4. Para onde os links de e-mail voltam ----------
// Um link de confirmação falso: o Supabase responde "link expirado" e manda de volta para o endereço pedido, se ele
// estiver na lista de Redirect URLs, ou para o Site URL, se não estiver. Nenhum e-mail é enviado.
console.log('4. Para onde os links de e-mail voltam (Authentication → URL Configuration)')
async function voltaPara(destino) {
  const resposta = await fetch(`${URL_DO_SUPABASE}/auth/v1/verify?type=signup&token=link-falso-de-conferencia&redirect_to=${encodeURIComponent(destino)}`, {
    headers: { apikey: CHAVE },
    redirect: 'manual',
  })
  return (resposta.headers.get('location') ?? '').split('#')[0]
}
const siteUrl = (await voltaPara('https://endereco-que-nao-esta-na-lista.invalid/')).replace(/\/$/, '')
if (siteUrl === VERCEL) ok(`Site URL = ${siteUrl}`)
else aviso(`Site URL = ${siteUrl || '(nenhum)'}`, `o esperado depois da Vercel é ${VERCEL} (URL Configuration → Site URL)`)
const conferirEndereco = async (destino, nome, padrao) => {
  const volta = await voltaPara(destino)
  if (volta === destino) ok(`${nome} está na lista (${padrao})`)
  else falta(`${nome} NÃO está na lista: o link do e-mail iria para ${volta || 'lugar nenhum'}`, `URL Configuration → Redirect URLs → Add URL: ${padrao} → Save URLs`)
}
await conferirEndereco('http://localhost:5173/conferencia', 'o jogo no seu computador (npm run dev)', 'http://localhost:5173/**')
await conferirEndereco(`${VERCEL}/conferencia`, 'o endereço principal da Vercel', `${VERCEL}/**`)
await conferirEndereco('https://jogo-rpg-git-fase-2-conferencia.vercel.app/conferencia', 'a prévia da Vercel (ramo de teste)', 'https://jogo-rpg-*.vercel.app/**')

// ---------- 5. Contas de teste e segurança entre contas ----------
console.log('5. Contas de teste')
const entradas = []
for (const conta of contasPreenchidas) {
  const cliente = novoCliente()
  const { data, error } = await cliente.auth.signInWithPassword({ email: conta.email, password: conta.senha })
  if (error) {
    const oQueFazer =
      error.code === 'email_not_confirmed'
        ? 'a conta não foi confirmada: em Authentication → Users, apague e crie de novo com "Auto Confirm User" marcado'
        : 'confira o e-mail e a senha no .env.local e se a conta existe em Authentication → Users'
    falta(`a conta ${conta.nome} não entra (${error.message})`, oQueFazer)
    continue
  }
  ok(`a conta ${conta.nome} entra`)
  entradas.push({ ...conta, cliente, id: data.user.id })
}
if (entradas.length === 2) {
  const [a, b] = entradas
  const savesQueAVe = (await a.cliente.from('saves').select('conta')).data ?? []
  const saveDaBVistoPorA = (await a.cliente.from('saves').select('conta').eq('conta', b.id)).data ?? []
  const perfisQueAVe = (await a.cliente.from('perfis').select('id')).data ?? []
  if (savesQueAVe.every((linha) => linha.conta === a.id) && saveDaBVistoPorA.length === 0 && perfisQueAVe.every((linha) => linha.id === a.id)) {
    ok('a conta A só enxerga o que é dela (RLS)')
  } else falta('a conta A enxerga dados da B', 'me avise: a regra de segurança não está valendo')
  for (const conta of entradas) {
    const perfil = (await conta.cliente.from('perfis').select('apelido').maybeSingle()).data
    const save = (await conta.cliente.from('saves').select('versao').maybeSingle()).data
    console.log(`        conta ${conta.nome}: apelido ${perfil?.apelido ?? '(ainda não escolhido: o jogo pede no primeiro login)'}; save ${save ? `versão ${save.versao}` : '(ainda não tem)'}`)
  }
}

// ---------- 6. Vercel ----------
console.log('6. Vercel')
// Uma chave secreta de verdade no código: "sb_secret_" seguido da chave (a biblioteca do Supabase só tem o começo,
// "sb_secret_", para conferir o tipo de chave) ou uma chave antiga (JWT) com o papel service_role
function temChaveSecreta(codigo) {
  if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(codigo)) return true
  for (const [jwt] of codigo.matchAll(/eyJ[\w-]+\.([\w-]+)\.[\w-]+/g)) {
    try {
      const conteudo = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'))
      if (conteudo.role === 'service_role') return true
    } catch {
      // não era uma chave
    }
  }
  return false
}

async function conferirSite(endereco, nome) {
  let pagina
  try {
    const resposta = await fetch(`${endereco}/`)
    if (resposta.status === 401 || resposta.status === 403) {
      falta(`${nome} pede login da Vercel (${resposta.status})`, 'Vercel → projeto → Settings → Deployment Protection → Vercel Authentication: Disabled')
      return
    }
    if (!resposta.ok) {
      falta(`${nome} respondeu ${resposta.status}`, 'abra o projeto na Vercel e veja se o último deployment deu certo')
      return
    }
    pagina = await resposta.text()
  } catch (erro) {
    falta(`${nome} não abre (${erro.message})`, 'confira o endereço')
    return
  }
  ok(`${nome} abre (${endereco})`)
  const arquivos = [...pagina.matchAll(/assets\/[^"]+\.js/g)].map((achado) => achado[0])
  let codigo = ''
  for (const arquivo of arquivos) codigo += await (await fetch(`${endereco}/${arquivo}`)).text()
  if (temChaveSecreta(codigo)) falta(`${nome} tem uma chave SECRETA no código`, 'troque a variável na Vercel pela publicável e gere uma chave secreta nova no Supabase')
  const temContas = codigo.includes('Minhas partidas')
  if (!temContas) {
    aviso(`${nome} ainda está com o código da Fase 1 (sem as contas)`, 'normal até a Fase 2 ir para o GitHub; aí a Vercel monta de novo sozinha')
    return
  }
  if (codigo.includes(URL_DO_SUPABASE) && codigo.includes(CHAVE)) ok(`${nome}: as variáveis do Supabase estão certas (as mesmas do .env.local)`)
  else if (codigo.includes('.supabase.co')) falta(`${nome}: as variáveis do Supabase são diferentes das do .env.local`, 'Vercel → Settings → Environment Variables: confira os dois valores e faça Redeploy')
  else falta(`${nome}: faltam as variáveis do Supabase`, 'Vercel → Settings → Environment Variables: VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (marcadas para Production e Preview), depois Redeploy')
  if (codigo.includes('Invencível vale só')) falta(`${nome} mostra a barra de teste`, 'me avise: no jogo publicado ela não deveria existir')
  else ok(`${nome} não tem a barra de teste nem o painel DEV`)
}
await conferirSite(VERCEL, 'o endereço principal')
if (PREVIA) await conferirSite(PREVIA, 'a prévia')

console.log(`\n${faltas === 0 ? 'Tudo certo' : `${faltas} coisa(s) para arrumar`}${avisos ? ` · ${avisos} aviso(s)` : ''}.`)
process.exit(faltas === 0 ? 0 : 1)
