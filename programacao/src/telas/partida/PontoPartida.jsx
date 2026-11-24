import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Mudanca from '../../componentes/ui/Mudanca.jsx'
import { biomas } from '../../dados/biomas.js'
import { floresta } from '../../dados/mundo/floresta.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { paradasComPreco, podeViajar } from '../../regras/caravana.js'

const pos = posicoes.pontoPartida
const mapas = { floresta }

// A Caravana (RF56, Parte 7; substitui o Ponto de partida, RF32): começar no início do bioma (de graça) ou pagar para
// nascer numa zona neutra mais à frente. Sempre disponível: só o preço barra (o botão apagado diz quanto falta). Cada
// parada mostra o ouro antes → depois. O preço sai do ouro no fim da partida; se ela cair, nada é cobrado (RF12).
export default function PontoPartida() {
  const { estado, acoes } = useJogo()
  const idDoBioma = estado.escolhasDaPartida.bioma
  const bioma = biomas.find((b) => b.id === idDoBioma)
  const { ouro } = estado.progresso
  const paradas = paradasComPreco(mapas[idDoBioma])

  return (
    <Tela>
      <Area em={pos.bioma}>Caravana · {bioma?.nome ?? 'nenhum bioma'}</Area>
      <Area em={pos.paradas} className="caravana">
        <p className="nota">Comece no início de graça, ou pague para a Caravana deixar o grupo numa zona neutra mais à frente. O ouro só sai no fim da partida; se a partida cair, nada é cobrado.</p>
        {paradas.length === 0 && <p>Escolha um bioma no Mapa para ver as paradas da Caravana.</p>}
        <ol className="caravana-paradas">
          {paradas.map((parada) => {
            const { ok, motivo } = podeViajar(ouro, parada.preco)
            return (
              <li key={parada.id} className="caravana-parada">
                <span className="caravana-nome">{parada.nome}</span>
                <span className="caravana-perto">{parada.perto}</span>
                {parada.preco > 0 ? <Mudanca nome="Ouro:" antes={ouro} depois={ouro - parada.preco} /> : <span className="caravana-gratis">De graça</span>}
                <BotaoDeAcao acao="viajar" desativado={!ok} motivo={motivo} onClick={() => acoes.escolherPontoPartida(parada.id)}>
                  {parada.preco > 0 ? `Viajar por ${parada.preco} de ouro` : 'Começar no início'}
                </BotaoDeAcao>
              </li>
            )
          })}
        </ol>
      </Area>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}
