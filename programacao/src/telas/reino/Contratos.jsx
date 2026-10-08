import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import { contratos } from '../../dados/balanceamento.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { useJogo } from '../../estado/contexto.js'
import { classesParaContratar, contratarPermanente, contratarTemporario } from '../../regras/guilda.js'

// Abas de contrato da Guilda (TASK-079; RF29, RF52, UC25). As regras ficam em regras/guilda.js:
// só aparecem as classes que o jogador não tem como permanente; o temporário dura algumas partidas, tem nível
// fixo, não ganha XP e não pode ser Líder; o permanente começa no nível 1 e encerra o temporário da mesma classe.
// A mensagem embaixo diz o que aconteceu (ou por que não deu, como falta de ouro).

function useContratar(tipo) {
  const { estado, acoes } = useJogo()
  const [mensagem, setMensagem] = useState(null)
  const regra = tipo === 'temporario' ? contratarTemporario : contratarPermanente
  function contratar(classe) {
    const resultado = regra(estado.progresso, classe)
    if (!resultado.ok) {
      setMensagem({ texto: resultado.motivo, erro: true })
      return
    }
    acoes.contratar(tipo, classe)
    setMensagem({ texto: `${nomeDaClasse(classe)} contratado${tipo === 'temporario' ? ' (temporário)' : ''}.`, erro: false })
  }
  return { estado, mensagem, contratar }
}

function Mensagem({ mensagem }) {
  if (!mensagem) return null
  return (
    <p className={mensagem.erro ? 'mensagem-da-guilda mensagem-da-guilda-erro' : 'mensagem-da-guilda'} role="status">
      {mensagem.texto}
    </p>
  )
}

export function ContratosTemporarios() {
  const { estado, mensagem, contratar } = useContratar('temporario')
  const { progresso } = estado
  const opcoes = classesParaContratar(progresso).filter((opcao) => opcao.temporario)

  return (
    <div className="contratos">
      <p className="nota">
        Dura {contratos.partidasDoTemporario} partidas, no nível {contratos.nivelDoTemporario}. Não ganha XP e não pode ser
        Líder. Ouro: <strong>{progresso.ouro}</strong>
      </p>
      <ul className="lista-de-contratos">
        {opcoes.map(({ classe }) => (
          <li key={classe}>
            <span>{nomeDaClasse(classe)}</span>
            <Botao onClick={() => contratar(classe)}>Contratar ({contratos.precoDoTemporario} de ouro)</Botao>
          </li>
        ))}
        {opcoes.length === 0 && <li>Nenhuma classe para contratar como temporário agora.</li>}
      </ul>
      <Mensagem mensagem={mensagem} />
      <h3>Contratos ativos</h3>
      <ul className="lista-de-contratos">
        {progresso.contratosTemporarios.map((contrato) => (
          <li key={contrato.classe}>
            <span>
              {nomeDaClasse(contrato.classe)} (nível {contrato.nivel})
            </span>
            <span>
              {contrato.partidasRestantes} {contrato.partidasRestantes === 1 ? 'partida restante' : 'partidas restantes'}
            </span>
          </li>
        ))}
        {progresso.contratosTemporarios.length === 0 && <li>Nenhum contrato temporário.</li>}
      </ul>
    </div>
  )
}

export function ContratosPermanentes() {
  const { estado, mensagem, contratar } = useContratar('permanente')
  const { progresso } = estado
  const opcoes = classesParaContratar(progresso)
  const temTemporario = (classe) => progresso.contratosTemporarios.some((contrato) => contrato.classe === classe)

  return (
    <div className="contratos">
      <p className="nota">
        Começa no nível 1, ganha XP, pode ser Líder e fica para sempre. Ouro: <strong>{progresso.ouro}</strong>
      </p>
      <ul className="lista-de-contratos">
        {opcoes.map(({ classe }) => (
          <li key={classe}>
            <span>
              {nomeDaClasse(classe)}
              {temTemporario(classe) && <span className="nota"> (encerra o contrato temporário)</span>}
            </span>
            <Botao onClick={() => contratar(classe)}>Contratar ({contratos.precoDoPermanente} de ouro)</Botao>
          </li>
        ))}
        {opcoes.length === 0 && <li>Você já tem todas as classes.</li>}
      </ul>
      <Mensagem mensagem={mensagem} />
    </div>
  )
}
