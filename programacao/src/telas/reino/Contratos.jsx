import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import CorDaClasse from '../../componentes/CorDaClasse.jsx'
import Pentagono from '../../componentes/Pentagono.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Mudanca from '../../componentes/ui/Mudanca.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Selo from '../../componentes/ui/Selo.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { contratos } from '../../dados/balanceamento.js'
import { classes, corDaClasseCss, nomeDaClasse } from '../../dados/classes.js'
import { equipamentoDosTemporarios } from '../../dados/forja.js'
import { useJogo } from '../../estado/contexto.js'
import { classesParaContratar, contratarPermanente, contratarTemporario } from '../../regras/guilda.js'
import { MensagemDoReino } from './MensagemDoReino.jsx'

// Abas de contrato da Guilda (TASK-079; RF29, RF52, UC25; Fase 4.5). As regras ficam em regras/guilda.js: só aparecem as
// classes que o jogador não tem como permanente; o temporário dura algumas partidas, tem nível fixo, não ganha XP e não
// pode ser Líder; o permanente começa no nível 1 e encerra o temporário da mesma classe.
// Cada classe é uma carta (retrato, papel, pentágono pequeno e preço) com o selo do tipo de contrato, bem diferentes entre
// temporário e permanente. Contratar abre o contrato para "assinar", com o ouro antes e depois.

const tipos = {
  temporario: {
    nome: 'Contrato temporário',
    cor: '#1098ad',
    selo: `${contratos.partidasDoTemporario} partidas · nível ${contratos.nivelDoTemporario} · não ganha XP`,
    preco: contratos.precoDoTemporario,
    regra: contratarTemporario,
    explicacao: `Vai junto por ${contratos.partidasDoTemporario} partidas, no nível ${contratos.nivelDoTemporario}, com equipamento fixo. Não ganha XP e não pode ser Líder.`,
  },
  permanente: {
    nome: 'Contrato permanente',
    cor: '#a61e4d',
    selo: 'para sempre · começa no nível 1',
    preco: contratos.precoDoPermanente,
    regra: contratarPermanente,
    explicacao: 'Fica para sempre: começa no nível 1, ganha XP, pode ser Líder e usa a Forja e as Árvores.',
  },
}

// O maior atributo inicial entre as classes, para os pentágonos das cartas se compararem
const escala = Math.ceil(Math.max(...classes.flatMap((classe) => Object.values(classe.atributosIniciais))) / 5) * 5

function useContratar(tipo) {
  const { estado, acoes } = useJogo()
  const [mensagem, setMensagem] = useState(null)
  const [assinando, setAssinando] = useState(null) // a classe do contrato aberto para assinar
  const { regra } = tipos[tipo]
  function assinar(classe) {
    const resultado = regra(estado.progresso, classe)
    setAssinando(null)
    if (!resultado.ok) {
      setMensagem({ texto: resultado.motivo, erro: true })
      return
    }
    acoes.contratar(tipo, classe)
    setMensagem({ texto: `Contrato assinado: ${nomeDaClasse(classe)}${tipo === 'temporario' ? ' (temporário)' : ''} entrou no grupo.`, erro: false })
  }
  return { progresso: estado.progresso, mensagem, setMensagem, assinando, setAssinando, assinar, previa: (classe) => regra(estado.progresso, classe) }
}

// O equipamento fixo que o temporário leva, em quadradinhos
function EquipamentoDoTemporario({ classe }) {
  const ids = Object.values(equipamentoDosTemporarios[classe] ?? {})
  if (ids.length === 0) return null
  return (
    <div className="carta-equipamento">
      <span className="nota">Vai com:</span>
      {ids.map((id) => (
        <Slot key={id} id={id} tamanho="pequeno" />
      ))}
    </div>
  )
}

function Carta({ classe, tipo, aviso, previa, aoContratar }) {
  const dados = classes.find((uma) => uma.id === classe)
  const { cor, selo, preco } = tipos[tipo]
  const pode = previa(classe)
  return (
    <article className={`carta-de-contrato carta-${tipo}`} aria-label={`${dados.nome}: ${tipos[tipo].nome}`} style={{ '--cor-do-contrato': cor }}>
      <div className="carta-cabeca">
        <CorDaClasse classe={classe} className="retrato-da-carta" />
        <div>
          <h4>{dados.nome}</h4>
          <span className="nota">{dados.papel}</span>
        </div>
      </div>
      <Pentagono valores={dados.atributosIniciais} maximo={escala} cor={corDaClasseCss(classe)} compacto />
      <Selo cor={cor} forte>
        {selo}
      </Selo>
      {tipo === 'temporario' && <EquipamentoDoTemporario classe={classe} />}
      {aviso && <Selo cor="var(--ruim)">{aviso}</Selo>}
      <span className="carta-preco">{preco} de ouro</span>
      <BotaoDeAcao acao="contratar" desativado={!pode.ok} motivo={pode.motivo} onClick={aoContratar}>
        Contratar
      </BotaoDeAcao>
    </article>
  )
}

// O contrato aberto para assinar: o que é, o preço e o ouro antes e depois
function Assinatura({ classe, tipo, ouro, aoAssinar, aoCancelar }) {
  const { nome, cor, selo, preco, explicacao } = tipos[tipo]
  return (
    <Painel titulo={`${nome}: ${nomeDaClasse(classe)}`} className="contrato-para-assinar">
      <div className="contrato-para-assinar-corpo" style={{ '--cor-do-contrato': cor }}>
        <CorDaClasse classe={classe} className="retrato-da-carta" />
        <div className="contrato-para-assinar-texto">
          <Selo cor={cor} forte>
            {selo}
          </Selo>
          <p>{explicacao}</p>
          <p>
            Preço: <strong>{preco} de ouro</strong> · <Mudanca nome="Seu ouro:" antes={ouro} depois={ouro - preco} />
          </p>
        </div>
      </div>
      <div className="botoes-em-linha">
        <BotaoDeAcao acao="contratar" onClick={aoAssinar}>
          Assinar o contrato
        </BotaoDeAcao>
        <Botao onClick={aoCancelar}>Cancelar</Botao>
      </div>
    </Painel>
  )
}

export function ContratosTemporarios() {
  const { progresso, mensagem, setMensagem, assinando, setAssinando, assinar, previa } = useContratar('temporario')
  const opcoes = classesParaContratar(progresso).filter((opcao) => opcao.temporario)

  return (
    <div className="balcao-com-mensagem contratos-novos">
      <p className="nota">{tipos.temporario.explicacao}</p>
      {assinando ? (
        <Assinatura classe={assinando} tipo="temporario" ouro={progresso.ouro} aoAssinar={() => assinar(assinando)} aoCancelar={() => setAssinando(null)} />
      ) : (
        <div className="cartas">
          {opcoes.map(({ classe }) => (
            <Carta
              key={classe}
              classe={classe}
              tipo="temporario"
              previa={previa}
              aoContratar={() => {
                setAssinando(classe)
                setMensagem(null)
              }}
            />
          ))}
          {opcoes.length === 0 && <p className="vazio">Nenhuma classe para contratar como temporário agora: você já tem todas, ou o contrato delas ainda está valendo.</p>}
        </div>
      )}
      <MensagemDoReino mensagem={mensagem} />
      <div className="contratos-ativos">
        <strong>Contratos ativos:</strong>
        {progresso.contratosTemporarios.length === 0 ? (
          <span className="nota">nenhum agora.</span>
        ) : (
          <>
            {progresso.contratosTemporarios.map((contrato) => (
              <span key={contrato.classe} className="contrato-ativo">
                <CorDaClasse classe={contrato.classe} />
                <strong>{nomeDaClasse(contrato.classe)}</strong> nível {contrato.nivel}
                <Selo cor={tipos.temporario.cor} forte>
                  {contrato.partidasRestantes} {contrato.partidasRestantes === 1 ? 'partida restante' : 'partidas restantes'}
                </Selo>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export function ContratosPermanentes() {
  const { progresso, mensagem, setMensagem, assinando, setAssinando, assinar, previa } = useContratar('permanente')
  const opcoes = classesParaContratar(progresso)
  const temTemporario = (classe) => progresso.contratosTemporarios.some((contrato) => contrato.classe === classe)

  return (
    <div className="balcao-com-mensagem contratos-novos">
      <p className="nota">{tipos.permanente.explicacao}</p>
      {assinando ? (
        <Assinatura classe={assinando} tipo="permanente" ouro={progresso.ouro} aoAssinar={() => assinar(assinando)} aoCancelar={() => setAssinando(null)} />
      ) : (
        <div className="cartas">
          {opcoes.map(({ classe }) => (
            <Carta
              key={classe}
              classe={classe}
              tipo="permanente"
              previa={previa}
              aviso={temTemporario(classe) ? 'encerra o contrato temporário' : null}
              aoContratar={() => {
                setAssinando(classe)
                setMensagem(null)
              }}
            />
          ))}
          {opcoes.length === 0 && <p className="vazio">Você já tem todas as classes como personagens permanentes.</p>}
        </div>
      )}
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}
