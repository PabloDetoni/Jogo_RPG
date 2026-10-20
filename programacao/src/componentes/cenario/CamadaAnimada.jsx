import { useEffect, useRef } from 'react'
import { animacoesDoCenario } from '../../dados/animacoesDoCenario.js'

// Carrega as imagens (nome → endereço); a que não existe vira null
function carregarImagens(enderecos) {
  return Promise.all(
    Object.entries(enderecos).map(
      ([nome, url]) =>
        new Promise((resolver) => {
          if (!url) return resolver([nome, null])
          const imagem = new Image()
          imagem.onload = () => resolver([nome, imagem])
          imagem.onerror = () => resolver([nome, null])
          imagem.src = url
        }),
    ),
  ).then(Object.fromEntries)
}

// Uma camada animada do cenário: um canvas do tamanho da imagem original (o CSS estica para a tela), desenhado no
// máximo a 30 quadros por segundo e só enquanto a aba aparece (o requestAnimationFrame para sozinho na aba escondida).
// Desligada (a opção das Configurações ou o "reduzir movimento"), desenha um quadro só, parado.
// imagens: nome → endereço (fixo, do módulo); preparar(imagens) → o que o desenho precisa; desenhar(contexto, segundos,
// recursos, ligada).
export default function CamadaAnimada({ imagem, imagens, preparar, desenhar, ligada, className = '' }) {
  const tela = useRef(null)
  useEffect(() => {
    let parado = false
    let pedido = 0
    const contexto = tela.current.getContext('2d')
    carregarImagens(imagens).then((carregadas) => {
      if (parado) return
      const recursos = preparar(carregadas)
      if (!ligada) {
        desenhar(contexto, 0, recursos, false)
        return
      }
      const inicio = performance.now()
      const intervalo = 1000 / animacoesDoCenario.quadrosPorSegundo
      let ultimo = -Infinity
      // Só no npm run dev: quanto custa cada quadro (o roteiro do navegador confere que o cenário não pesa)
      const medida = import.meta.env.DEV ? (window.__cenario ??= { quadros: 0, ms: 0 }) : null
      const passo = (agora) => {
        if (parado) return
        pedido = requestAnimationFrame(passo)
        if (agora - ultimo < intervalo - 2) return
        ultimo = agora
        const antes = performance.now()
        desenhar(contexto, (agora - inicio) / 1000, recursos, true)
        if (medida) {
          medida.quadros += 1
          medida.ms += performance.now() - antes
        }
      }
      pedido = requestAnimationFrame(passo)
    })
    return () => {
      parado = true
      cancelAnimationFrame(pedido)
    }
  }, [imagens, preparar, desenhar, ligada])

  return <canvas ref={tela} width={imagem.largura} height={imagem.altura} className={`camada-animada ${className}`} data-ligada={ligada ? 'sim' : 'nao'} aria-hidden="true" />
}
