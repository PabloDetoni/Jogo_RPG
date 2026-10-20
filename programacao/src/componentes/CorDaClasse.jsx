import { iconeDaClasse, retratoDaClasse } from '../dados/arte.js'
import { corDaClasseCss } from '../dados/classes.js'
import { urlDaArte } from '../arte/indice.js'

// O quadradinho da cor da classe (HUD, listas) ou, quando a arte chegar, a imagem dela: nos lugares pequenos ("hud-cor"),
// o emblema (classe-<classe>.png) e, sem ele, o retrato; nos grandes, o retrato (retrato-<classe>.png) e, sem ele, o emblema
export default function CorDaClasse({ classe, className = 'hud-cor' }) {
  const pequeno = className === 'hud-cor'
  const ordem = pequeno ? [iconeDaClasse(classe), retratoDaClasse(classe)] : [retratoDaClasse(classe), iconeDaClasse(classe)]
  const imagem = ordem.map((nome) => urlDaArte(nome)).find(Boolean)
  if (imagem) return <img className={`${className} com-retrato`} src={imagem} alt="" draggable={false} />
  return <span className={className} style={{ background: corDaClasseCss(classe) }} />
}
