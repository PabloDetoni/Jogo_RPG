import { useEffect, useRef } from 'react'

// Nunca dois jogos ao mesmo tempo: no StrictMode o React monta, desmonta e monta de novo
let jogoAtivo = null

// Lugar do Phaser na tela de Partida. Cria o jogo ao montar e destrói ao desmontar.
// O Phaser é carregado só aqui (import dinâmico): o resto do site continua leve, e os testes
// das telas não tentam rodar o jogo.
export default function ArenaDaPartida({ ponte, grupo }) {
  const caixa = useRef(null)

  useEffect(() => {
    let cancelado = false
    let jogo = null
    import('./criarJogo.js')
      .then(({ criarJogo }) => {
        if (cancelado) return
        jogoAtivo?.destroy(true)
        jogo = criarJogo(caixa.current, { ponte, grupo })
        jogoAtivo = jogo
        // Só no "npm run dev": deixa o teste no navegador olhar o jogo por dentro
        if (import.meta.env.DEV) window.__jogoDaPartida = jogo
      })
      .catch((erro) => console.error('Não deu para carregar a partida:', erro))

    return () => {
      cancelado = true
      if (!jogo) return
      jogo.destroy(true)
      if (jogoAtivo === jogo) jogoAtivo = null
      if (import.meta.env.DEV && window.__jogoDaPartida === jogo) delete window.__jogoDaPartida
    }
  }, [ponte, grupo])

  return <div ref={caixa} className="arena" />
}
