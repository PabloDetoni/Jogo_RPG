import { useEffect, useMemo, useRef } from 'react'
import { mundo } from '../../dados/balanceamento.js'
import { coresDaDificuldade, coresDoMinimapa } from '../../dados/mundo/minimapa.js'
import { mapaDoBioma } from '../../regras/mapaDaPartida.js'
import { decodificarNevoa, regiaoEm } from '../../regras/mundo.js'

// Minimapa da partida (Fase 3, RF40), no quadro do HUD. Começa escuro e revela por onde o grupo passa; cada parte
// descoberta aparece na cor da dificuldade da região (a mata fechada, em verde-escuro). Mostra o Líder, os aliados e o
// pedaço que está na tela. A cena manda a névoa e as posições 8 vezes por segundo (minimapa = situacao.minimapa).
export default function Minimapa({ bioma, minimapa }) {
  const tela = useRef(null)
  const mapa = useMemo(() => mapaDoBioma(bioma), [bioma])
  const { celula } = mundo.minimapa
  const colunas = Math.ceil(mapa.tamanho.largura / celula)
  const linhas = Math.ceil(mapa.tamanho.altura / celula)

  // A cor de cada célula, calculada uma vez por mapa: a da dificuldade da região, ou a da mata
  const cores = useMemo(() => {
    const lista = []
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const regiao = regiaoEm(mapa.regioes, { x: (c + 0.5) * celula, y: (l + 0.5) * celula })
        lista.push(regiao ? coresDaDificuldade[regiao.dificuldade] : coresDoMinimapa.mata)
      }
    }
    return lista
  }, [mapa, colunas, linhas, celula])

  useEffect(() => {
    const desenho = tela.current?.getContext?.('2d')
    if (!desenho || !minimapa) return
    const { width: largura, height: altura } = tela.current
    const ex = largura / mapa.tamanho.largura
    const ey = altura / mapa.tamanho.altura
    desenho.fillStyle = coresDoMinimapa.escuro
    desenho.fillRect(0, 0, largura, altura)
    const reveladas = decodificarNevoa(minimapa.nevoa, colunas * linhas)
    for (let i = 0; i < reveladas.length; i++) {
      if (!reveladas[i]) continue
      const c = i % colunas
      const l = Math.floor(i / colunas)
      desenho.fillStyle = cores[i]
      desenho.fillRect(Math.floor(c * celula * ex), Math.floor(l * celula * ey), Math.ceil(celula * ex), Math.ceil(celula * ey))
    }
    const { vista } = minimapa
    desenho.strokeStyle = coresDoMinimapa.vista
    desenho.lineWidth = 1
    desenho.strokeRect(vista.x * ex + 0.5, vista.y * ey + 0.5, vista.largura * ex, vista.altura * ey)
    desenho.fillStyle = coresDoMinimapa.aliado
    for (const aliado of minimapa.aliados) desenho.fillRect(aliado.x * ex - 1.5, aliado.y * ey - 1.5, 3, 3)
    desenho.fillStyle = coresDoMinimapa.lider
    desenho.fillRect(minimapa.lider.x * ex - 2.5, minimapa.lider.y * ey - 2.5, 5, 5)
  }, [minimapa, mapa, cores, colunas, linhas, celula])

  return <canvas ref={tela} className="minimapa" width={180} height={90} aria-label="Minimapa da partida" />
}
