import { describe, expect, it } from 'vitest'
import { atualizarEstado, criarEstadoInicial, dadosParaSalvar } from '../estado/estadoDoJogo.js'
import { storageFalso } from '../testes/ajudantes.js'
import { criarArmazenamento } from './armazenamento.js'
import { chaves } from './chaves.js'
import { carregarPreferencias, salvarPreferencias } from './preferenciasLocais.js'
import { criarSalvadorDoConvidado } from './salvadorDoConvidado.js'

// Estado + salvamento juntos, com a página "recarregando" entre as visitas.
// abrirPagina faz o papel do ProvedorDoJogo: grava quando pedidosDeSalvamento muda.
function criarNavegador() {
  const storage = storageFalso()
  const armazenamento = criarArmazenamento(storage)

  function abrirPagina() {
    const salvador = criarSalvadorDoConvidado(armazenamento)
    let estado = criarEstadoInicial(carregarPreferencias(armazenamento))
    const pagina = {
      get estado() {
        return estado
      },
      fazer(...acoes) {
        for (const acao of acoes) {
          const pedidos = estado.pedidosDeSalvamento
          estado = atualizarEstado(estado, acao)
          if (estado.pedidosDeSalvamento !== pedidos) salvador.salvar(dadosParaSalvar(estado))
          salvarPreferencias(armazenamento, estado.preferencias)
        }
        return pagina
      },
      entrarComoConvidado() {
        salvador.salvar(dadosParaSalvar(estado))
        return pagina.fazer({ tipo: 'entrarComoConvidado', carregamento: salvador.carregar() })
      },
      fecharAba() {
        salvador.salvar(dadosParaSalvar(estado)) // pagehide
      },
    }
    return pagina
  }

  return { abrirPagina, save: () => JSON.parse(storage.dados.get(chaves.convidado)) }
}

const comecarPartida = [
  { tipo: 'irPara', destino: 'mapa' },
  { tipo: 'escolherBioma', bioma: 'floresta' },
  { tipo: 'escolherPontoPartida', pontoPartida: 'inicio' },
  { tipo: 'comecarPartida', agora: '2026-10-05T12:00:00.000Z' },
]

describe('o convidado ao longo de várias visitas', () => {
  it('continua de onde parou, descarta a partida interrompida e guarda a que terminou', () => {
    const navegador = criarNavegador()

    // 1ª visita: tema escuro, classe Arqueiro; fecha sem pagehide (a escolha da classe já salvou)
    let pagina = navegador.abrirPagina()
    pagina.fazer({ tipo: 'alternarPreferencia', chave: 'tema' }).entrarComoConvidado()
    expect(pagina.estado.tela).toBe('narrativaInicial')
    pagina.fazer({ tipo: 'escolherClasseInicial', classe: 'arqueiro' })

    // 2ª visita: tema já escuro antes de entrar; vai direto ao Reino (HU01, RF18)
    pagina = navegador.abrirPagina()
    expect(pagina.estado.preferencias.tema).toBe('escuro')
    pagina.entrarComoConvidado()
    expect(pagina.estado.tela).toBe('reino')
    expect(pagina.estado.progresso.lider).toBe('arqueiro')
    expect(pagina.estado.progresso.personagens[0].atributos.agilidade).toBeGreaterThan(0)

    // fecha no meio da partida
    pagina.fazer(...comecarPartida)
    const versaoNoComeco = navegador.save().versao
    pagina.fecharAba()

    // 3ª visita: partida descartada, nada contado, save limpo
    pagina = navegador.abrirPagina().entrarComoConvidado()
    expect(pagina.estado.tela).toBe('reino')
    expect(pagina.estado.avisos.some((aviso) => aviso.texto.includes('descartada'))).toBe(true)
    expect(pagina.estado.progresso.estatisticas.partidasJogadas).toBe(0)
    expect(navegador.save()).toMatchObject({ partidaEmAndamento: null, versao: versaoNoComeco + 1 })
    pagina.fecharAba()

    // 4ª visita: o aviso não se repete; uma partida até o fim
    pagina = navegador.abrirPagina().entrarComoConvidado()
    expect(pagina.estado.avisos).toHaveLength(0)
    pagina.fazer(...comecarPartida, { tipo: 'encerrarPartida', resultado: 'retornoForcado' })

    // 5ª visita, sem pagehide: a partida terminada ficou salva
    pagina = navegador.abrirPagina().entrarComoConvidado()
    expect(pagina.estado.progresso.estatisticas.partidasJogadas).toBe(1)
  })

  it('partida interrompida não muda o ouro nem gasta partida de contrato (TASK-023, RF12)', () => {
    const navegador = criarNavegador()
    let pagina = navegador.abrirPagina()
    pagina.entrarComoConvidado()
    pagina.fazer({ tipo: 'escolherClasseInicial', classe: 'tanque' })
    // Dá ouro e um contrato temporário pelo próprio estado, como a Guilda fará na etapa 7
    const comContrato = {
      ...pagina.estado.progresso,
      ouro: 300,
      contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }],
    }
    pagina = navegador.abrirPagina()
    pagina.entrarComoConvidado()
    pagina.fazer({ tipo: 'entrarComoConvidado', carregamento: { situacao: 'carregado', progresso: comContrato, partidaDescartada: false } })
    pagina.fazer(...comecarPartida) // salva com a partida em andamento
    pagina.fecharAba() // fecha no meio

    pagina = navegador.abrirPagina().entrarComoConvidado()
    expect(pagina.estado.progresso.ouro).toBe(300)
    expect(pagina.estado.progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }])

    // Uma partida até o fim gasta uma partida do contrato
    pagina.fazer(...comecarPartida, { tipo: 'encerrarPartida', resultado: 'vitoria' })
    pagina = navegador.abrirPagina().entrarComoConvidado()
    expect(pagina.estado.progresso.contratosTemporarios).toEqual([{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }])
  })
})
