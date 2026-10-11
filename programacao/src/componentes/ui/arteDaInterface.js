import { urlDaArte } from '../../arte/indice.js'
import { arteDaInterface } from '../../dados/interface.js'

// A arte da interface (Fase 4.5) entra por variáveis de CSS na caixa do jogo: para cada imagem que existe
// (moldura-painel.png, botao.png, slot.png...), a classe "com-arte-<nome>" e as variáveis "--arte-<nome>" (a imagem) e
// "--fatia-<nome>" (a borda que não estica). O CSS troca a forma simples pela imagem; sem a imagem, nada muda.
export function arteDaInterfaceNaRaiz() {
  const classes = []
  const estilo = {}
  for (const { nome, fatia } of Object.values(arteDaInterface)) {
    const url = urlDaArte(nome)
    if (!url) continue
    classes.push(`com-arte-${nome}`)
    estilo[`--arte-${nome}`] = `url("${url}")`
    if (fatia) estilo[`--fatia-${nome}`] = fatia
  }
  return { classes: classes.join(' '), estilo }
}
