// Caixa que abre por cima da tela (Configurações, Pausa, Como jogar, aviso da fuga). Esc fecha.
// leve: sem escurecer a tela e sem bloquear o clique em volta (o aviso da fuga, com o jogo rodando embaixo).
// aoLado: leve e encostada no lado direito, embaixo do HUD (a mochila da partida: o Líder fica no meio da tela).
export default function Janela({ titulo, leve = false, aoLado = false, children }) {
  const classes = ['janela-fundo']
  if (leve || aoLado) classes.push('janela-fundo-leve')
  if (aoLado) classes.push('janela-fundo-ao-lado')
  return (
    <div className={classes.join(' ')}>
      <div className="janela" role="dialog" aria-modal={!leve} aria-label={titulo}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
