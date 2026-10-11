import { useEffect, useState } from 'react'
import { urlDaArte } from '../../arte/indice.js'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { cutsceneDeDerrota } from '../../dados/arte.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.cutsceneDerrota

// Cutscene da Derrota (RF47). Com a arte (derrota-1 a derrota-3, dados/arte.js), as imagens passam em sequência e a
// última fica; sem ela, a tela cinza com a mensagem. Continuar funciona a qualquer momento.
export default function CutsceneDerrota() {
  const { acoes } = useJogo()
  const imagens = cutsceneDeDerrota.imagens.map(urlDaArte).filter(Boolean)
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    if (atual >= imagens.length - 1) return undefined
    const espera = setTimeout(() => setAtual(atual + 1), cutsceneDeDerrota.msPorImagem)
    return () => clearTimeout(espera)
  }, [atual, imagens.length])

  return (
    <Tela imagemDeFundo={imagens[atual] ?? null}>
      <Area em={pos.mensagem}>Todos os personagens desmaiaram.</Area>
      <Botao em={pos.continuar} onClick={() => acoes.irPara('resumo')}>
        Continuar
      </Botao>
    </Tela>
  )
}
