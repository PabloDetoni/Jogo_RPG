import { retratoDaClasse } from '../dados/arte.js'
import { corDaClasseCss } from '../dados/classes.js'
import { urlDaArte } from '../arte/indice.js'

// O quadradinho da cor da classe (HUD, listas) ou, quando a arte chegar, o retrato dela (retrato-<classe>.png)
export default function CorDaClasse({ classe, className = 'hud-cor' }) {
  const retrato = urlDaArte(retratoDaClasse(classe))
  if (retrato) return <img className={`${className} com-retrato`} src={retrato} alt="" draggable={false} />
  return <span className={className} style={{ background: corDaClasseCss(classe) }} />
}
