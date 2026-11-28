// Service worker do Jogo RPG (Parte 14, 28/11/2026): escrito à mão, sem biblioteca. Guarda os arquivos do jogo no
// aparelho para o app instalado (e o site) abrir rápido. Só roda no site publicado (main.jsx registra fora do dev).
// - A página (index.html): primeiro a internet, para um site novo chegar na hora; sem internet, a cópia guardada.
// - Os arquivos de /assets/ (código, arte e som; o nome muda a cada versão): primeiro a cópia guardada.
// - O resto do próprio site (ícones, manifesto): a cópia guardada na hora e a atualização por trás.
// - Nada de fora do site (o Supabase, as fontes) passa por aqui: contas, save e ranking são sempre da internet.
const CACHE = 'jogo-rpg-v1'
const NO_MAXIMO = 900 // arquivos guardados (a arte tem centenas); passou disso, saem os mais velhos
const INICIO = ['/', '/manifest.webmanifest', '/icones/icone-192.png', '/icones/icone-512.png']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(INICIO))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((nome) => nome.startsWith('jogo-rpg-') && nome !== CACHE).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim()),
  )
})

async function guardar(pedido, resposta) {
  if (!resposta || !resposta.ok || resposta.type !== 'basic') return
  const cache = await caches.open(CACHE)
  await cache.put(pedido, resposta)
  const chaves = await cache.keys()
  for (const velha of chaves.slice(0, Math.max(0, chaves.length - NO_MAXIMO))) await cache.delete(velha)
}

async function primeiroAInternet(pedido) {
  try {
    const resposta = await fetch(pedido)
    guardar('/', resposta.clone())
    return resposta
  } catch {
    return (await caches.match('/')) ?? Response.error()
  }
}

async function primeiroOGuardado(pedido) {
  const guardado = await caches.match(pedido)
  if (guardado) return guardado
  const resposta = await fetch(pedido)
  guardar(pedido, resposta.clone())
  return resposta
}

async function guardadoEAtualiza(pedido) {
  const guardado = await caches.match(pedido)
  const daInternet = fetch(pedido)
    .then((resposta) => {
      guardar(pedido, resposta.clone())
      return resposta
    })
    .catch(() => guardado ?? Response.error())
  return guardado ?? daInternet
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET') return
  const endereco = new URL(pedido.url)
  if (endereco.origin !== self.location.origin) return
  if (pedido.mode === 'navigate') evento.respondWith(primeiroAInternet(pedido))
  else if (endereco.pathname.startsWith('/assets/')) evento.respondWith(primeiroOGuardado(pedido))
  else evento.respondWith(guardadoEAtualiza(pedido))
})
