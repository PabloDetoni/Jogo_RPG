// Os arquivos de som que existem em src/assets/audio/ (o Vite encontra na hora de montar o jogo): nome sem a extensão →
// endereço do arquivo. Para um som novo, basta salvar o arquivo lá com o nome de dados/sons.js.
const achados = import.meta.glob('../assets/audio/*.{ogg,mp3,wav}', { eager: true, query: '?url', import: 'default' })

export const arquivosDeSom = Object.fromEntries(
  Object.entries(achados).map(([caminho, url]) => [caminho.split('/').at(-1).replace(/\.(ogg|mp3|wav)$/, ''), url]),
)
