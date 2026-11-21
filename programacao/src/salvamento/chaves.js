// Nomes usados no armazenamento do navegador (localStorage).
// Mudar um nome faz o jogo "esquecer" o que estava salvo com o nome antigo.
const prefixo = 'jogo-rpg'

export const chaves = {
  convidado: `${prefixo}:convidado`,
  convidadoCorrompido: `${prefixo}:convidado:corrompido`,
  preferencias: `${prefixo}:preferencias`,
  // Fase 2: cópia local do save de cada conta (RF09, RF11) e a marca de "conta criada a partir do convidado" (RF03)
  conta: (id) => `${prefixo}:conta:${id}`,
  contaCorrompida: (id) => `${prefixo}:conta:${id}:corrompido`,
  // as partidas da conta terminadas sem internet, esperando ir para o histórico e o ranking (Parte 0b, 21/11)
  partidasDaConta: (id) => `${prefixo}:conta:${id}:partidas`,
  transferirConvidado: `${prefixo}:transferir-convidado`,
  // sessionStorage (só desta aba, sobrevive a recarregar): o código da sessão única desta aba (RF05)
  sessaoDaAba: `${prefixo}:sessao-da-aba`,
  // sessionStorage: uma mensagem para mostrar depois de recarregar a página (conta aberta em outro lugar, saiu sem rede)
  mensagemAoAbrir: `${prefixo}:mensagem-ao-abrir`,
}
