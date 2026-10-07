import { classes } from '../../dados/classes.js'

// Barra de TESTE da arena (Fase 1, parte 5a). Some quando a partida de verdade estiver pronta.
// Os botões não pegam o foco do teclado: assim o Espaço continua sendo a esquiva, e não um clique.
export default function BarraDeTeste({ ponte, situacao, encerrarPartida }) {
  const mandar = (comando) => ponte.avisar('comando', comando)

  return (
    <div className="barra-de-teste" role="toolbar" aria-label="Barra de teste">
      <span className="selo-teste">TESTE</span>
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => encerrarPartida('grandeVitoria')}>Grande Vitória</BotaoDeTeste>
        <BotaoDeTeste onClick={() => encerrarPartida('vitoria')}>Vitória</BotaoDeTeste>
        <BotaoDeTeste onClick={() => encerrarPartida('retornoForcado')}>Retorno forçado</BotaoDeTeste>
        <BotaoDeTeste onClick={() => encerrarPartida('derrota')}>Derrota</BotaoDeTeste>
      </div>
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => mandar({ tipo: 'alternarInvencivel' })} selecionado={Boolean(situacao?.invencivel)}>
          Invencível: {situacao?.invencivel ? 'sim' : 'não'}
        </BotaoDeTeste>
        <span className="fps">{situacao ? `${situacao.fps} FPS` : '— FPS'}</span>
      </div>
      <div className="quebra-de-linha" />
      <div className="grupo-de-teste">
        {classes.map((classe) => (
          <BotaoDeTeste
            key={classe.id}
            onClick={() => mandar({ tipo: 'trocarClasse', classe: classe.id })}
            selecionado={situacao?.classe === classe.id}
          >
            {classe.nome}
          </BotaoDeTeste>
        ))}
      </div>
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => mandar({ tipo: 'encherGrupo' })}>Encher grupo</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'criarInimigo', inimigo: 'mobVermelho' })}>Criar mob vermelho</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'criarInimigo', inimigo: 'atirador' })}>Criar atirador</BotaoDeTeste>
      </div>
    </div>
  )
}

function BotaoDeTeste({ onClick, selecionado, children }) {
  return (
    <button
      type="button"
      className="botao botao-teste"
      aria-pressed={selecionado}
      onMouseDown={(evento) => evento.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
