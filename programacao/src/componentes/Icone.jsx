import { urlDaArte } from '../arte/indice.js'

// Ícone da arte (item, atributo, habilidade, ouro, Pedra de Retorno), quando a imagem existe em src/assets/arte/.
// Sem a imagem, mostra "semArte" (por padrão, nada): a tela continua como antes da arte chegar.
export default function Icone({ nome, tamanho = '1.4em', className = '', semArte = null }) {
  const url = urlDaArte(nome)
  if (!url) return semArte
  return <img className={`icone ${className}`} src={url} alt="" draggable={false} style={{ width: tamanho, height: tamanho }} />
}
