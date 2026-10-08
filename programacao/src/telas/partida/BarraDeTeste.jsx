import { emCqw, faixas } from '../../dados/arenaDeTeste.js'
import { classes } from '../../dados/classes.js'
import { nomeDoNivelDaIA } from '../../regras/nivelDaIA.js'

// Barra de TESTE da arena (Fase 1). Some quando a partida de verdade estiver pronta.
// Fica numa faixa embaixo, fora da área jogável (ninguém anda embaixo dela).
// Os botões não pegam o foco do teclado: assim o Espaço continua sendo a esquiva, e não um clique.
export default function BarraDeTeste({ ponte, situacao, encerrarPartida }) {
  const mandar = (comando) => ponte.avisar('comando', comando)

  return (
    <div className="barra-de-teste" role="toolbar" aria-label="Barra de teste" style={{ height: emCqw(faixas.barraDeTeste) }}>
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
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => mandar({ tipo: 'derrubarAliado' })}>Derrubar aliado</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'derrubarLider' })}>Derrubar Líder</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'alternarAjuda' })} selecionado={situacao ? !situacao.aliadosAjudam : false}>
          Aliados ajudam: {situacao?.aliadosAjudam === false ? 'não' : 'sim'}
        </BotaoDeTeste>
        {/* Só para testar: no jogo, a IA de cada aliado vem do nível dele e o jogador não escolhe */}
        <BotaoDeTeste onClick={() => mandar({ tipo: 'trocarIA' })} selecionado={Boolean(situacao?.iaForcada)}>
          IA: {situacao?.iaForcada ? nomeDoNivelDaIA(situacao.iaForcada) : 'pelo nível'}
        </BotaoDeTeste>
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
        <BotaoDeTeste onClick={() => mandar({ tipo: 'juntarTodos' })}>Juntar todos</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'criarInimigo', inimigo: 'mobVermelho' })}>Criar mob vermelho</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'criarInimigo', inimigo: 'atirador' })}>Criar atirador</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'recarregarHabilidades' })}>Recarregar habilidades</BotaoDeTeste>
      </div>
      <div className="quebra-de-linha" />
      <p className="dica-de-teclas">
        WASD anda · mouse mira · clique ataca · 1 2 3 habilidades · Espaço esquiva · Esc pausa · Invencível vale só para o Líder
      </p>
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
