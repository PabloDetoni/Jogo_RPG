import Icone from '../../componentes/Icone.jsx'
import Tela from '../../componentes/Tela.jsx'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import { estiloPosicao, estiloRetangulo } from '../../componentes/posicao.js'
import { iconeDoOuro } from '../../dados/arte.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { lugaresDoReino } from '../../dados/interface.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { missaoEmUmaLinha } from '../../regras/missoes.js'

const pos = posicoes.reino

// Um lugar desenhado na imagem do Reino (visual novo, 20/10): uma área clicável invisível em cima da placa (o botão de
// verdade, com o nome escondido para o leitor de tela e o teclado) e outra em cima do desenho dela (coroa, bigorna...).
// Passar o mouse acende a placa (brilho dourado) e mostra a legenda do lugar logo abaixo.
function LugarDesenhado({ id, nome, aoAbrir }) {
  const area = pos.lugares[id]
  const legenda = lugaresDoReino[id]?.legenda
  const embaixo = area.placa.y + area.placa.altura
  return (
    <div className={`lugar-desenhado lugar-desenhado-${id}`}>
      <button type="button" className="lugar-placa" style={estiloRetangulo(area.placa)} onClick={aoAbrir} title={legenda ? `${nome}: ${legenda}` : nome}>
        <span className="so-leitor">{nome}</span>
      </button>
      {area.desenho && <span className="lugar-desenho" style={estiloRetangulo(area.desenho)} onClick={aoAbrir} aria-hidden="true" />}
      {legenda && (
        <span className="legenda-do-lugar posicionado" style={estiloPosicao({ x: area.placa.x + area.placa.largura / 2, y: Math.min(96, embaixo + 2.4) })} aria-hidden="true">
          {legenda}
        </span>
      )}
    </div>
  )
}

// Hub do jogo (RF19). Visual novo (20/10): a imagem do Pablo é o fundo, com os botões desenhados nela; aqui ficam as áreas
// clicáveis em cima deles e a faixa com o que muda (apelido, Líder, ouro e missão).
export default function Reino() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, progresso } = estado
  // O apelido vem da conta (Fase 2); o resto vem do save (TASK-071)
  const apelido = tipoJogador === 'conta' ? (estado.conta?.apelido ?? 'Conta') : 'Convidado'
  const lider = progresso.lider ? nomeDaClasse(progresso.lider) : 'nenhum'
  const missao = missaoEmUmaLinha(progresso) ?? 'nenhuma' // na de entrega, conta o que está na Mochila agora

  return (
    <Tela className="tela-ilustrada tela-reino" semCantos tituloOculto ajudaEm={pos.ajuda}>
      {/* A faixa do Reino: apelido, Líder, ouro e missão ativa (RF19) */}
      <div className="faixa-do-reino hud-do-reino posicionado" style={estiloPosicao(pos.faixa)}>
        {apelido} · Líder: {lider} · <Icone nome={iconeDoOuro} tamanho="1.1em" />
        Ouro: {progresso.ouro} · Missão: {missao}
      </div>
      <LugarDesenhado id="salaoGloria" nome="Salão da Glória" aoAbrir={() => acoes.irPara('salaoGloria')} />
      <LugarDesenhado id="configuracoes" nome="Configurações" aoAbrir={() => acoes.abrirJanela('configuracoes')} />
      <LugarDesenhado id="guilda" nome="Guilda" aoAbrir={() => acoes.irPara('guilda')} />
      <LugarDesenhado id="mercado" nome="Mercado" aoAbrir={() => acoes.irPara('mercado')} />
      <LugarDesenhado id="forja" nome="Forja" aoAbrir={() => acoes.irPara('forja')} />
      <LugarDesenhado id="mochila" nome="Mochila" aoAbrir={() => acoes.irPara('mochila')} />
      <LugarDesenhado
        id="jogar"
        nome="Jogar"
        aoAbrir={() => {
          pedirTelaCheia(estado.preferencias.telaCheia)
          acoes.irPara('mapa')
        }}
      />
      <LugarDesenhado id="arvores" nome="Árvores de Habilidades" aoAbrir={() => acoes.irPara('arvores')} />
    </Tela>
  )
}
