import { chaveDaArte, indiceDaArte } from '../regras/arte.js'

// As imagens que existem em src/assets/arte/ (o Vite encontra na hora de montar o jogo; subpastas valem). Para uma
// imagem nova, basta salvar o arquivo lá com o nome de dados/arte.js: não precisa mexer em código.
// A pasta arte-de-teste só existe enquanto roda o npm run testar:arte (fora do git); a arte de verdade vem antes dela.
const daArte = import.meta.glob('../assets/arte/**/*.{png,webp,jpg,jpeg,PNG,WEBP,JPG,JPEG}', { eager: true, query: '?url', import: 'default' })
const deTeste = import.meta.glob('../assets/arte-de-teste/**/*.{png,webp,jpg,jpeg,PNG,WEBP,JPG,JPEG}', { eager: true, query: '?url', import: 'default' })

const { arquivos, repetidos } = indiceDaArte([...Object.entries(daArte), ...Object.entries(deTeste)])

// chave do nome (regras/arte.js, chaveDaArte) → endereço da imagem
export const arquivosDeArte = arquivos
export const chavesDaArte = new Set(Object.keys(arquivos))
export const nomesRepetidos = repetidos

// O endereço da imagem de um nome da lista ("item-pocaoDeVida", "fundo-reino"...), ou null se ela ainda não existe
export function urlDaArte(nome) {
  return nome ? (arquivos[chaveDaArte(nome)] ?? null) : null
}
