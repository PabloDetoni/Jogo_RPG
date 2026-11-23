import { useEffect, useMemo, useRef } from 'react'
import { mundo } from '../../dados/balanceamento.js'
import { coresDaDificuldade, coresDoMinimapa } from '../../dados/mundo/minimapa.js'
import { mapaDoBioma } from '../../regras/mapaDaPartida.js'
import { decodificarNevoa, janelaDoMinimapa, regiaoEm } from '../../regras/mundo.js'
import { pontoDoMinimapa } from '../../regras/opcoesDeDev.js'

// Minimapa da partida (Fase 3, RF40; Floresta grande na Parte 5). Começa escuro e revela por onde o grupo passa; cada
// parte descoberta aparece na cor da dificuldade da região (a mata fechada, em verde-escuro). Mostra o Líder, os
// aliados e o pedaço que está na tela. No HUD, uma JANELA do mapa que acompanha o Líder (o mapa grande inteiro ficaria
// pequeno demais); na pausa, o MAPA INTEIRO (MapaInteiro). A cena manda a névoa e as posições 8 vezes por segundo.

// As cores de cada célula, calculadas uma vez por mapa: a da dificuldade da região, ou a da mata
function useCelulas(bioma) {
  const mapa = useMemo(() => mapaDoBioma(bioma), [bioma])
  const { celula } = mundo.minimapa
  const colunas = Math.ceil(mapa.tamanho.largura / celula)
  const linhas = Math.ceil(mapa.tamanho.altura / celula)
  const cores = useMemo(() => {
    const lista = []
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const regiao = regiaoEm(mapa.regioes, { x: (c + 0.5) * celula, y: (l + 0.5) * celula })
        lista.push(regiao ? (coresDaDificuldade[regiao.dificuldade] ?? coresDaDificuldade.segura) : coresDoMinimapa.mata)
      }
    }
    return lista
  }, [mapa, colunas, linhas, celula])
  return { mapa, celula, colunas, linhas, cores }
}

// Desenha a janela { x, y, largura, altura } do mapa (em px do mundo) no canvas inteiro
function desenhar(tela, { celula, colunas, linhas, cores }, minimapa, janela) {
  const desenho = tela?.getContext?.('2d')
  if (!desenho || !minimapa) return
  const { width: largura, height: altura } = tela
  const ex = largura / janela.largura
  const ey = altura / janela.altura
  const px = (x) => (x - janela.x) * ex
  const py = (y) => (y - janela.y) * ey
  desenho.fillStyle = coresDoMinimapa.escuro
  desenho.fillRect(0, 0, largura, altura)
  const reveladas = decodificarNevoa(minimapa.nevoa, colunas * linhas)
  const c0 = Math.max(0, Math.floor(janela.x / celula))
  const c1 = Math.min(colunas - 1, Math.floor((janela.x + janela.largura) / celula))
  const l0 = Math.max(0, Math.floor(janela.y / celula))
  const l1 = Math.min(linhas - 1, Math.floor((janela.y + janela.altura) / celula))
  for (let l = l0; l <= l1; l++) {
    for (let c = c0; c <= c1; c++) {
      const i = l * colunas + c
      if (!reveladas[i]) continue
      desenho.fillStyle = cores[i]
      desenho.fillRect(Math.floor(px(c * celula)), Math.floor(py(l * celula)), Math.ceil(celula * ex) + 1, Math.ceil(celula * ey) + 1)
    }
  }
  const { vista } = minimapa
  desenho.strokeStyle = coresDoMinimapa.vista
  desenho.lineWidth = 1
  desenho.strokeRect(px(vista.x) + 0.5, py(vista.y) + 0.5, vista.largura * ex, vista.altura * ey)
  desenho.fillStyle = coresDoMinimapa.aliado
  for (const aliado of minimapa.aliados) desenho.fillRect(px(aliado.x) - 1.5, py(aliado.y) - 1.5, 3, 3)
  desenho.fillStyle = coresDoMinimapa.lider
  desenho.fillRect(px(minimapa.lider.x) - 2.5, py(minimapa.lider.y) - 2.5, 5, 5)
}

// aoClicar (só no npm run dev, RF61): recebe o ponto do mapa onde o minimapa foi clicado (teletransporte)
export default function Minimapa({ bioma, minimapa, aoClicar }) {
  const tela = useRef(null)
  const celulas = useCelulas(bioma)
  const { mapa } = celulas
  // A janela que acompanha o Líder (no mapa pequeno, ela é o mapa inteiro)
  const janela = useMemo(
    () => (minimapa ? janelaDoMinimapa(minimapa.lider, mapa.tamanho, mundo.minimapa.janela) : { x: 0, y: 0, ...mapa.tamanho }),
    [minimapa, mapa],
  )

  useEffect(() => {
    desenhar(tela.current, celulas, minimapa, janela)
  }, [celulas, minimapa, janela])

  if (!import.meta.env.DEV || !aoClicar) return <canvas ref={tela} className="minimapa" width={180} height={90} aria-label="Minimapa da partida" />
  const clicar = (evento) => {
    const caixa = evento.currentTarget.getBoundingClientRect()
    const ponto = pontoDoMinimapa({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top }, { largura: caixa.width, altura: caixa.height }, janela)
    if (ponto) aoClicar(ponto)
  }
  return (
    <canvas
      ref={tela}
      className="minimapa minimapa-clicavel"
      width={180}
      height={90}
      aria-label="Minimapa da partida (teste: clique para se teletransportar)"
      title="Teste: clique para levar o grupo até aqui"
      onMouseDown={(evento) => evento.preventDefault()}
      onClick={clicar}
    />
  )
}

// O mapa inteiro, com a névoa do que não foi descoberto (na pausa: Partida.jsx)
export function MapaInteiro({ bioma, minimapa }) {
  const tela = useRef(null)
  const celulas = useCelulas(bioma)
  const { largura, altura } = celulas.mapa.tamanho
  useEffect(() => {
    desenhar(tela.current, celulas, minimapa, { x: 0, y: 0, largura, altura })
  }, [celulas, minimapa, largura, altura])
  return (
    <div className="mapa-inteiro" aria-label="Mapa inteiro">
      <span className="mapa-inteiro-titulo">Mapa · {celulas.mapa.nome}</span>
      <canvas ref={tela} width={Math.round((520 * largura) / Math.max(largura, altura))} height={Math.round((520 * altura) / Math.max(largura, altura))} />
    </div>
  )
}
