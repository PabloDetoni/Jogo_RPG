import { useEffect, useRef, useState } from 'react'
import { mascaraDaTransparencia, pecaNoPonto, pontoNaImagem } from '../../regras/cenario.js'
import { estiloNaImagem } from './naImagem.js'


// A máscara de cada peça, lida da transparência da imagem dela (numa grade com a metade do tamanho)
const passoDaMascara = 2
function useMascaras(pecas) {
  const [mascaras, setMascaras] = useState({})
  const chave = pecas.map((peca) => `${peca.id}:${peca.url ?? ''}`).join('|')
  useEffect(() => {
    let vivo = true
    for (const peca of pecas) {
      if (!peca.url) continue
      const imagem = new Image()
      imagem.onload = () => {
        if (!vivo) return
        const largura = Math.max(1, Math.round(peca.largura / passoDaMascara))
        const altura = Math.max(1, Math.round(peca.altura / passoDaMascara))
        const tela = document.createElement('canvas')
        tela.width = largura
        tela.height = altura
        const contexto = tela.getContext('2d', { willReadFrequently: true })
        contexto.drawImage(imagem, 0, 0, largura, altura)
        const pixels = contexto.getImageData(0, 0, largura, altura).data
        const alfas = new Uint8Array(largura * altura)
        for (let i = 0; i < alfas.length; i++) alfas[i] = pixels[i * 4 + 3]
        const mascara = mascaraDaTransparencia(alfas, largura, altura, { folga: 1 })
        setMascaras((atuais) => ({ ...atuais, [peca.id]: mascara }))
      }
      imagem.src = peca.url
    }
    return () => {
      vivo = false
    }
    // as peças só mudam quando muda o endereço de alguma imagem (a chave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])
  return mascaras
}

// Uma cena em camadas (o Reino e o Mapa, 20/10): as peças (imagens com transparência, no lugar exato da imagem
// original) e o clique pelo desenho delas: o ponto do mouse vira pixel da imagem e a peça de cima com desenho ali ganha
// (regras/cenario.js). Entre dois objetos não abre nada. "atras" e "frente" são as camadas animadas (por baixo e por
// cima das peças); "children" fica por cima de tudo (as placas, que são botões de verdade, com data-lugar).
// pecas: da de cima para a de baixo, { id, x, y, largura, altura, url, clicavel, bloqueado, className }.
export default function CenaEmCamadas({ imagem, pecas, emFoco, aoFocar, aoAbrir, className = '', estilo = {}, atras = null, frente = null, children }) {
  const caixa = useRef(null)
  const mascaras = useMascaras(pecas)
  const [sobOMouse, setSobOMouse] = useState(null)

  const pecaDoEvento = (evento) => pecaNoPonto(pecas, pontoNaImagem(caixa.current.getBoundingClientRect(), evento.clientX, evento.clientY, imagem), mascaras)
  const lugarDoBotao = (evento) => evento.target.closest?.('[data-lugar]')?.dataset.lugar ?? null

  const aoMover = (evento) => {
    const id = lugarDoBotao(evento) ?? pecaDoEvento(evento)
    if (id !== sobOMouse) setSobOMouse(id)
    if (id !== emFoco) aoFocar(id)
  }
  const aoSair = () => {
    setSobOMouse(null)
    aoFocar(null)
  }
  const aoClicar = (evento) => {
    if (lugarDoBotao(evento)) return // a placa (o botão) cuida do próprio clique
    const id = pecaDoEvento(evento)
    const peca = pecas.find((p) => p.id === id)
    if (peca && !peca.bloqueado) aoAbrir(id)
  }
  const pecaSob = pecas.find((peca) => peca.id === sobOMouse)
  const cursor = pecaSob ? (pecaSob.bloqueado ? 'not-allowed' : 'pointer') : undefined

  return (
    <div
      ref={caixa}
      className={`cena-em-camadas ${className}`}
      style={{ ...estilo, cursor }}
      data-mascaras={Object.keys(mascaras).length}
      data-sob-o-mouse={sobOMouse ?? ''}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      onClick={aoClicar}
    >
      {atras}
      {/* as de baixo primeiro (a ordem do desenho), as de cima por último */}
      {[...pecas].reverse().map(
        (peca) =>
          peca.url && (
            <img
              key={peca.id}
              src={peca.url}
              alt=""
              draggable={false}
              className={`peca-da-cena peca-${peca.id}${emFoco === peca.id ? ' peca-acesa' : ''}${peca.bloqueado ? ' peca-bloqueada' : ''} ${peca.className ?? ''}`}
              style={estiloNaImagem(peca, imagem)}
            />
          ),
      )}
      {frente}
      {children}
    </div>
  )
}
