import { createClient } from '@supabase/supabase-js'

// O ÚNICO lugar que cria o cliente do Supabase (TASK-091). A URL e a chave PUBLICÁVEL vêm do .env.local (fora do
// GitHub) ou das variáveis de ambiente da Vercel. A chave secreta nunca entra no jogo: a segurança vem das políticas
// RLS e das funções do banco (programacao/supabase/001_contas.sql).
// Sem as variáveis (por exemplo, um clone novo sem .env.local), as contas ficam indisponíveis e o convidado joga normal.

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Link de e-mail com que a página abriu (confirmação do cadastro ou senha nova). O cliente lê o link sozinho e o apaga
// da barra de endereço, então o tipo é guardado aqui antes: 'signup', 'recovery', 'erro' ou null.
function lerLinkDeEntrada() {
  if (typeof window === 'undefined') return { tipo: null, mensagem: null }
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const busca = new URLSearchParams(window.location.search)
  const erro = hash.get('error_description') ?? busca.get('error_description')
  if (erro) return { tipo: 'erro', mensagem: erro, codigo: hash.get('error_code') ?? busca.get('error_code') }
  return { tipo: hash.get('type') ?? busca.get('type'), mensagem: null }
}

export const linkDeEntrada = lerLinkDeEntrada()

export const supabase =
  url && chave
    ? createClient(url, chave, {
        auth: {
          // implícito: o link de confirmação funciona em qualquer navegador (até no celular), não só no que pediu
          flowType: 'implicit',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export const contasDisponiveis = Boolean(supabase)

// Só no npm run dev: o roteiro de testes das contas (npm run testar:contas) usa o cliente pelo console para conferir
// que uma conta não lê nem altera o que é de outra (TEST-007). No jogo publicado ele não fica exposto.
if (import.meta.env.DEV && supabase && typeof window !== 'undefined') window.__supabase = supabase

// Endereço e chave para o fecha-sessão da saída da página (fetch com keepalive, que o cliente não faz)
export const enderecoDoSupabase = url ?? null
export const chavePublicavel = chave ?? null
