// Nomes usados no armazenamento do navegador (localStorage).
// Mudar um nome faz o jogo "esquecer" o que estava salvo com o nome antigo.
const prefixo = 'jogo-rpg'

export const chaves = {
  convidado: `${prefixo}:convidado`,
  convidadoCorrompido: `${prefixo}:convidado:corrompido`,
  preferencias: `${prefixo}:preferencias`,
}
