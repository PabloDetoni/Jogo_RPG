// Painel com moldura (Fase 4.5): com a arte (moldura-painel.png), a moldura de pixel art; sem ela, a borda simples.
export default function Painel({ titulo, className = '', children, rotulo }) {
  return (
    <section className={`painel ${className}`} aria-label={rotulo ?? titulo}>
      {titulo && <h3 className="painel-titulo">{titulo}</h3>}
      {children}
    </section>
  )
}
