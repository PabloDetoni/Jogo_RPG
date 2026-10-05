// Caixa que abre por cima da tela (Configurações, Pausa, Como jogar). Esc fecha.
export default function Janela({ titulo, children }) {
  return (
    <div className="janela-fundo">
      <div className="janela" role="dialog" aria-modal="true" aria-label={titulo}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
