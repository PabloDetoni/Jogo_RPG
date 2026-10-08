import { estiloPosicao } from './posicao.js'

// Campo de texto posicionado. O valor fica na tela que usa o campo (useState).
// aoConfirmar: Enter dentro do campo (entrar, criar a conta...). erro: destaca o campo que tem problema.
export default function Campo({ em, rotulo, tipo = 'text', valor, aoMudar, aoConfirmar, autoComplete, erro = false }) {
  return (
    <label className={`campo posicionado${erro ? ' campo-com-erro' : ''}`} style={estiloPosicao(em)}>
      <span>{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' && aoConfirmar) aoConfirmar()
        }}
        autoComplete={autoComplete}
        aria-invalid={erro || undefined}
      />
    </label>
  )
}
