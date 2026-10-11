// Selo (Fase 4.5): uma etiqueta curta com a cor de destaque ("para sempre", "3 partidas", "só Arqueiro"...).
// forte: cheio da cor (para o que mais importa); sem ele, só a borda.
export default function Selo({ cor, children, forte = false }) {
  return (
    <span className={`selo${forte ? ' selo-forte' : ''}`} style={{ '--cor-do-selo': cor }}>
      {children}
    </span>
  )
}
