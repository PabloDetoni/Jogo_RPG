import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { controlesDoJogo, regrasDoJogo } from '../dados/comoJogar.js'
import { useJogo } from '../estado/contexto.js'

// Instruções do jogo (RF13; ajustes de 14/10): os controles à esquerda e as regras à direita (dados/comoJogar.js).
// Abre na Tela inicial e na pausa. Esc fecha.
export default function ComoJogar() {
  const { acoes } = useJogo()

  return (
    <Janela titulo="Como jogar">
      <div className="como-jogar">
        <section aria-label="Controles">
          <h3>Controles</h3>
          <dl className="lista-de-controles">
            {controlesDoJogo.map((controle) => (
              <div key={controle.acao} className="controle">
                <dt>
                  {controle.teclas.map((tecla) => (
                    <kbd key={tecla}>{tecla}</kbd>
                  ))}
                </dt>
                <dd>{controle.acao}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-label="Regras">
          <h3>Regras</h3>
          {regrasDoJogo.map((regra) => (
            <div key={regra.titulo} className="regra-do-jogo">
              <h4>{regra.titulo}</h4>
              <p>{regra.texto}</p>
            </div>
          ))}
        </section>
      </div>
      <Botao onClick={acoes.fecharJanela}>Fechar</Botao>
    </Janela>
  )
}
