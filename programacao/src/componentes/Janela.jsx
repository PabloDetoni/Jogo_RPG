// Caixa que abre por cima da tela (Configurações, Pausa, Como jogar, aviso da fuga). Esc fecha.
// leve: sem escurecer a tela e sem bloquear o clique em volta (o aviso da fuga, com o jogo rodando embaixo).
export default function Janela({ titulo, leve = false, children }) {
  return (
    <div className={leve ? 'janela-fundo janela-fundo-leve' : 'janela-fundo'}>
      <div className="janela" role="dialog" aria-modal={!leve} aria-label={titulo}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
