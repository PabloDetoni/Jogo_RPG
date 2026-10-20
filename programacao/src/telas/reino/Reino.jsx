import { useState } from 'react'
import { urlDaArte } from '../../arte/indice.js'
import Icone from '../../componentes/Icone.jsx'
import Tela from '../../componentes/Tela.jsx'
import CamadaAnimada from '../../componentes/cenario/CamadaAnimada.jsx'
import { useReduzirMovimento } from '../../componentes/cenario/useReduzirMovimento.js'
import CenaEmCamadas from '../../componentes/cenario/CenaEmCamadas.jsx'
import { estiloNaImagem, pontoEmPorcentagem } from '../../componentes/cenario/naImagem.js'
import SimboloDaPlaca from '../../componentes/cenario/SimboloDaPlaca.jsx'
import { desenharReinoAtras, desenharReinoFrente, imagensDoReino, prepararReino } from '../../componentes/cenario/desenhoDoReino.js'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import { estiloPosicao } from '../../componentes/posicao.js'
import { animacoesDoCenario } from '../../dados/animacoesDoCenario.js'
import { camadasDoReino, iconeDoOuro } from '../../dados/arte.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { lugaresDoReino } from '../../dados/interface.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { animacoesLigadas } from '../../regras/cenario.js'
import { missaoEmUmaLinha } from '../../regras/missoes.js'

const pos = posicoes.reino
const nomes = {
  salaoGloria: 'Salão da Glória',
  configuracoes: 'Configurações',
  guilda: 'Guilda',
  mercado: 'Mercado',
  forja: 'Forja',
  mochila: 'Mochila',
  jogar: 'Jogar',
  arvores: 'Árvores de Habilidades',
}
const fundoLimpo = urlDaArte(camadasDoReino.fundo)
// Sem o fundo limpo, as peças não aparecem (a imagem inteira já tem os objetos); a área de clique vira o retângulo
const pecas = Object.entries(pos.pecas).map(([id, r]) => ({ id, ...r, url: fundoLimpo ? urlDaArte(camadasDoReino.peca(id)) : null, clicavel: id !== 'castelo' }))
// O tamanho da letra da placa acompanha a altura dela (em % da largura da tela, cqw)
const letraDaPlaca = (placa) => `${((placa.altura * (placa.linhas === 2 ? 0.3 : 0.42)) / pos.imagem.largura) * 100}cqw`
// O símbolo (a plaquinha de cima) em % da placa
const dentroDaPlaca = (simbolo, placa) => ({
  left: `${((simbolo.x - placa.x) / placa.largura) * 100}%`,
  top: `${((simbolo.y - placa.y) / placa.altura) * 100}%`,
  width: `${(simbolo.largura / placa.largura) * 100}%`,
  height: `${(simbolo.altura / placa.altura) * 100}%`,
})

// A placa de um lugar (código, no estilo das da imagem: fundo escuro, borda dourada, fonte em pixel), no lugar exato
// da placa desenhada na imagem original. É o botão de verdade: teclado, leitor de tela e roteiros acham pelo nome.
// Acesa (mouse em cima da placa ou da peça, ou o foco do teclado): brilho dourado, e a legenda do lugar aparece embaixo.
function PlacaDoReino({ id, acesa, aoAbrir, aoFocar }) {
  const placa = pos.placas[id]
  const legenda = lugaresDoReino[id]?.legenda
  return (
    <div className={`lugar-desenhado lugar-desenhado-${id}${acesa ? ' lugar-aceso' : ''}`}>
      <button
        type="button"
        data-lugar={id}
        className={`lugar-placa placa-do-reino${placa.principal ? ' placa-do-reino-principal' : ''}${placa.linhas === 2 ? ' placa-de-duas-linhas' : ''}`}
        style={{ ...estiloNaImagem(placa, pos.imagem), fontSize: letraDaPlaca(placa) }}
        onClick={aoAbrir}
        onFocus={() => aoFocar(id)}
        onBlur={() => aoFocar(null)}
        title={legenda ? `${nomes[id]}: ${legenda}` : nomes[id]}
      >
        {placa.simbolo && (
          <span className={`simbolo-da-placa simbolo-da-placa-${placa.simbolo.nome}`} style={dentroDaPlaca(placa.simbolo, placa)}>
            <SimboloDaPlaca nome={placa.simbolo.nome} />
          </span>
        )}
        <span className="placa-do-reino-nome">{nomes[id]}</span>
      </button>
      {legenda && (
        <span className="legenda-do-lugar posicionado" style={estiloPosicao(pontoEmPorcentagem({ x: placa.x + placa.largura / 2, y: placa.y + placa.altura + 22 }, pos.imagem))} aria-hidden="true">
          {legenda}
        </span>
      )}
    </div>
  )
}

// Hub do jogo (RF19). Reino em camadas (20/10): o fundo limpo da imagem do Pablo, as peças (Guilda, Mercado, Forja,
// Mochila, Árvore de Habilidades e o castelo, só enfeite), as animações discretas do cenário e as placas em código.
// Clicar em qualquer parte visível de um objeto ou na placa dele abre o lugar (pelo formato da peça, não um retângulo).
export default function Reino() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, progresso } = estado
  const [emFoco, setEmFoco] = useState(null)
  const reduzirMovimento = useReduzirMovimento()
  const ligada = animacoesLigadas(estado.preferencias.animacoesDoCenario, reduzirMovimento)
  // O apelido vem da conta (Fase 2); o resto vem do save (TASK-071)
  const apelido = tipoJogador === 'conta' ? (estado.conta?.apelido ?? 'Conta') : 'Convidado'
  const lider = progresso.lider ? nomeDaClasse(progresso.lider) : 'nenhum'
  const missao = missaoEmUmaLinha(progresso) ?? 'nenhuma' // na de entrega, conta o que está na Mochila agora

  const abrir = {
    salaoGloria: () => acoes.irPara('salaoGloria'),
    configuracoes: () => acoes.abrirJanela('configuracoes'),
    guilda: () => acoes.irPara('guilda'),
    mercado: () => acoes.irPara('mercado'),
    forja: () => acoes.irPara('forja'),
    mochila: () => acoes.irPara('mochila'),
    jogar: () => {
      pedirTelaCheia(estado.preferencias.telaCheia)
      acoes.irPara('mapa')
    },
    arvores: () => acoes.irPara('arvores'),
  }

  return (
    <Tela className="tela-ilustrada tela-reino" semCantos tituloOculto ajudaEm={pontoEmPorcentagem(pos.ajuda, pos.imagem)} imagemDeFundo={fundoLimpo}>
      <CenaEmCamadas
        imagem={pos.imagem}
        pecas={pecas}
        emFoco={emFoco}
        aoFocar={setEmFoco}
        aoAbrir={(id) => abrir[id]?.()}
        className={`cena-do-reino${ligada ? ' cena-animada' : ''}`}
        estilo={{ '--periodo-do-balanco': `${animacoesDoCenario.arvoreDeHabilidades.periodo}s` }}
        atras={fundoLimpo && <CamadaAnimada imagem={pos.imagem} imagens={imagensDoReino} preparar={prepararReino} desenhar={desenharReinoAtras} ligada={ligada} className="camada-de-tras" />}
        frente={fundoLimpo && <CamadaAnimada imagem={pos.imagem} imagens={imagensDoReino} preparar={prepararReino} desenhar={desenharReinoFrente} ligada={ligada} className="camada-da-frente" />}
      >
        {Object.keys(pos.placas).map((id) => (
          <PlacaDoReino key={id} id={id} acesa={emFoco === id} aoAbrir={abrir[id]} aoFocar={setEmFoco} />
        ))}
      </CenaEmCamadas>
      {/* A faixa do Reino: apelido, Líder, ouro e missão ativa (RF19) */}
      <div className="faixa-do-reino hud-do-reino posicionado" style={estiloPosicao(pontoEmPorcentagem(pos.faixa, pos.imagem))}>
        {apelido} · Líder: {lider} · <Icone nome={iconeDoOuro} tamanho="1.1em" />
        Ouro: {progresso.ouro} · Missão: {missao}
      </div>
    </Tela>
  )
}
