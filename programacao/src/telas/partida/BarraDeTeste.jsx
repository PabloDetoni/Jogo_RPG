import { emCqw, faixas } from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import { classes } from '../../dados/classes.js'
import { nomeDoNivelDaIA } from '../../regras/nivelDaIA.js'

const teclas = 'WASD anda · mouse mira · clique ataca · 1 2 3 habilidades · Espaço esquiva · Q volta ao Reino · F foge · M muta · Esc pausa'

// Barra de TESTE da arena (Fase 1). Fica numa faixa embaixo, fora da área jogável (ninguém anda embaixo dela).
// Os botões de teste existem só no npm run dev; no jogo publicado (npm run build, Vercel) a faixa mostra só as teclas.
// Os botões não pegam o foco do teclado: assim o Espaço continua sendo a esquiva, e não um clique.
// Os 4 resultados acabam a partida com os números reais dela. "Subir nível" e "+ouro" mexem no que a partida ganhou,
// que só entra no save no fim, pelo caminho normal.
export default function BarraDeTeste({ ponte, situacao }) {
  if (!import.meta.env.DEV) {
    return (
      <div className="barra-de-teste" aria-label="Teclas" style={{ height: emCqw(faixas.barraDeTeste) }}>
        <p className="dica-de-teclas">{teclas}</p>
      </div>
    )
  }
  return <BotoesDeTeste ponte={ponte} situacao={situacao} />
}

function BotoesDeTeste({ ponte, situacao }) {
  const mandar = (comando) => ponte.avisar('comando', comando)
  const foco = situacao?.contagemDoFoco

  return (
    <div className="barra-de-teste" role="toolbar" aria-label="Barra de teste" style={{ height: emCqw(faixas.barraDeTeste) }}>
      <span className="selo-teste">TESTE</span>
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => mandar({ tipo: 'forcarFim', resultado: 'grandeVitoria' })}>Grande Vitória</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'forcarFim', resultado: 'vitoria' })}>Vitória</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'forcarFim', resultado: 'retornoForcado' })}>Retorno forçado</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'forcarFim', resultado: 'derrota' })}>Derrota</BotaoDeTeste>
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
        <BotaoDeTeste onClick={() => mandar({ tipo: 'encherMochila' })}>Encher mochila</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'piorCenario' })}>Pior cenário (FPS)</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'alternarDropEspecial' })} selecionado={Boolean(situacao?.dropEspecialForcado)}>
          Drop especial do Boss: {situacao?.dropEspecialForcado ? '100%' : 'normal'}
        </BotaoDeTeste>
      </div>
      <div className="quebra-de-linha" />
      <div className="grupo-de-teste">
        <BotaoDeTeste onClick={() => mandar({ tipo: 'testarFoco' })}>Testar foco</BotaoDeTeste>
        {foco?.decisoes > 0 && (
          <span className="contagem-do-foco">
            Foco: {foco.erros} {foco.erros === 1 ? 'erro' : 'erros'} em {foco.decisoes} decisões
          </span>
        )}
        <BotaoDeTeste onClick={() => mandar({ tipo: 'subirNivel' })}>Subir nível</BotaoDeTeste>
        <BotaoDeTeste onClick={() => mandar({ tipo: 'ganharOuro' })}>+{combateDeTeste.testes.ouroDoBotao} de ouro</BotaoDeTeste>
      </div>
      <p className="dica-de-teclas">{teclas} · Invencível vale só para o Líder</p>
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
