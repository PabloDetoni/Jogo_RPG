import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { useAgora } from '../../componentes/useAgora.js'
import { biomas } from '../../dados/biomas.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { podeJogarRodada, textoDasRodadas } from '../../regras/rodadasDoDia.js'

const pos = posicoes.mapa

// Mapa em ovo (RF30). Os minijogos do Planalto só abrem por aqui (RF54); embaixo de cada um, as rodadas de hoje e
// quando renovam (ajustes de 14/10). Sem rodadas, o botão apaga e diz o motivo.
export default function Mapa() {
  const { estado, acoes } = useJogo()
  const agora = useAgora()
  const minijogo = (id, nome) => {
    const pode = podeJogarRodada(estado.progresso.minijogosDoDia, id, agora)
    return (
      <Area em={pos[id]} className="minijogo-no-mapa">
        <Botao onClick={() => acoes.irPara(id)} desativado={!pode.ok}>
          {nome}
        </Botao>
        <span className="rodadas-do-dia" title={pode.ok ? undefined : pode.motivo}>
          {textoDasRodadas(estado.progresso.minijogosDoDia, id, agora)}
        </span>
      </Area>
    )
  }

  return (
    <Tela>
      <Area em={pos.planalto}>Planalto</Area>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
      {minijogo('fazenda', 'Fazenda')}
      {minijogo('lago', 'Lago')}
      {minijogo('mina', 'Mina')}
      {/* Só no npm run dev: a arena da Fase 1, para testar o combate (e o roteiro do navegador) */}
      {import.meta.env.DEV && (
        <Botao em={pos.arenaDeTeste} onClick={() => acoes.escolherBioma('arena')}>
          Arena de teste
        </Botao>
      )}
      {biomas.map((bioma) => (
        <Botao
          key={bioma.id}
          em={pos[bioma.id]}
          desativado={!bioma.noBeta}
          onClick={() => acoes.escolherBioma(bioma.id)}
        >
          {bioma.noBeta ? bioma.nome : `${bioma.nome} (fora do beta)`}
        </Botao>
      ))}
    </Tela>
  )
}
