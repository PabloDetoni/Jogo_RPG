import { urlDaArte } from '../../arte/indice.js'

// Um símbolo num quadradinho colorido (ação, tipo de missão, lugar do Reino). Com a arte (o nome em "arte", por exemplo
// acao-comprar.png), a imagem; sem ela, o símbolo na cor dada. O símbolo vem do CSS (data-simbolo): o texto do botão
// continua só o verbo.
export default function Simbolo({ simbolo, cor, arte, grande = false }) {
  const url = urlDaArte(arte)
  const classes = `simbolo${grande ? ' simbolo-grande' : ''}`
  if (url) return <img className={`${classes} simbolo-com-arte`} src={url} alt="" draggable={false} />
  return <span className={classes} data-simbolo={simbolo} style={{ '--cor-do-simbolo': cor }} aria-hidden="true" />
}
