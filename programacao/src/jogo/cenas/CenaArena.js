import * as Phaser from 'phaser'
import { coresDaArena, faixas, tamanhoDaArena } from '../../dados/arenaDeTeste.js'
import { combateDeTeste, critico, mundo } from '../../dados/balanceamento.js'
import { nomeDaClasse } from '../../dados/classes.js'
import {
  segundosDaAjuda,
  segundosDaFuga,
  segundosDeCombateDepoisDoDano,
  segundosParaLevantar,
  segundosRetornoNormal,
  vidaAoSerAjudadoPercentual,
} from '../../dados/regras.js'
import { motivosDoFim } from '../../dados/resultados.js'
import {
  alternarRetorno,
  avancarFuga,
  avancarRetorno,
  comecarFuga,
  custoDaFuga,
  estaEmCombate,
  nivelComOXpDaPartida,
  segundosDaContagem,
  somarTempoAtivo,
  somarXpDoAbate,
  xpParaOProximoNivel,
} from '../../regras/andamentoDaPartida.js'
import {
  aplicarDano,
  circuloTocaRetangulo,
  fracaoDaRecarga,
  podeUsar,
  retangulosSeTocam,
  rolarCritico,
  vagaNaFormacao,
  velocidadeDoMovimento,
  vetorDeEmpurrao,
} from '../../regras/combate.js'
import { comoPeloResultado, pontuacaoBase } from '../../regras/fimDaPartida.js'
import { areaLimpa, avancarAjuda, escolherAjudantes, estaAjudando, fimPorDesmaio, segundosRestantes, vidaAoLevantar } from '../../regras/desmaio.js'
import { classesQueFaltam, membroDeTeste, trocarClasseDoLider } from '../../regras/grupoDaPartida.js'
import { avisoDoMotivo, gastarMana, podeUsarHabilidade, regenerarMana } from '../../regras/habilidades.js'
import { mapaDoBioma } from '../../regras/mapaDaPartida.js'
import { espalharMobs, fichaNaRegiao } from '../../regras/mobs.js'
import { areaEm, codificarNevoa, criarNevoa, criarSorteio, decodificarNevoa, inicioDoPontoDePartida, regiaoEm, revelarEmVolta } from '../../regras/mundo.js'
import { idsDosNiveisDaIA, nivelDaIA, nivelParaTestar } from '../../regras/nivelDaIA.js'
import {
  acompanharTravamento,
  desfazerSobreposicoes,
  escorregar,
  linhaLivre,
  manobraParaDestravar,
  pontoLivreMaisProximo,
  separacao,
  tirarDasParedes,
} from '../../regras/movimento.js'
import { criarIndice, retangulosEntre, retangulosNaCaixa, retangulosPerto } from '../../regras/vizinhanca.js'
import Aura from '../ataques/aura.js'
import BolaMagica from '../ataques/bolaMagica.js'
import Escudo from '../ataques/escudo.js'
import { golpeDeEspada } from '../ataques/espada.js'
import Flecha from '../ataques/flecha.js'
import { camadas, criarTexturas, numeroFlutuante, particulas, rastro, tremerTela } from '../efeitos.js'
import Atirador from '../entidades/Atirador.js'
import BonecoDeTreino from '../entidades/BonecoDeTreino.js'
import Inimigo from '../entidades/Inimigo.js'
import MobVermelho from '../entidades/MobVermelho.js'
import Personagem from '../entidades/Personagem.js'
import { efeitosDasHabilidades, temAlvoParaAHabilidade } from '../habilidades/index.js'
import { pensarAliados } from '../iaDosAliados.js'
import { desenharFloresta } from '../mapas.js'
import Navegador from '../navegador.js'

const { personagem, esquiva, ataques, raioDaFormacao, travamento, desmaio, testes } = combateDeTeste
const prazoParaLevantar = segundosParaLevantar * 1000
const msDaAjuda = segundosDaAjuda * 1000
const msDoRetorno = segundosRetornoNormal * 1000
const msDaFuga = segundosDaFuga * 1000
const msDeCombate = segundosDeCombateDepoisDoDano * 1000
const somar = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
const tiposDeInimigo = { mobVermelho: MobVermelho, atirador: Atirador }
// Os mobs da Floresta são o mob vermelho ou o atirador com outra ficha (balanceamento.js, mundo.mobs)
const classeDoComportamento = { corpoACorpo: MobVermelho, atirador: Atirador }
// Alcance da busca de obstáculos em volta de quem anda (px): o que passa disso não muda nada neste quadro
const alcanceDasParedes = 160

// A cena da partida (o nome "arena" ficou da Fase 1). Desenha e move a partida no mapa escolhido
// (regras/mapaDaPartida.js): a Floresta (Fase 3), com câmera seguindo o Líder, ou a arena de teste da Fase 1, que
// existe só no npm run dev.
// Recebe da tela de Partida a ponte (src/jogo/ponte.js), o grupo (regras/grupoDaPartida.js) e a partida (bioma e
// ponto de partida). Avisa pela ponte a situação (8 vezes por segundo), o andamento (em combate, retornando,
// fugindo: quando muda), as mensagens curtas do HUD e o fim da partida ("fimDaPartida", com os números do Resumo).
export default class CenaArena extends Phaser.Scene {
  constructor() {
    super('arena')
  }

  init({ ponte, grupo, partida = {} }) {
    this.ponte = ponte
    this.grupoInicial = grupo
    // descobertas: o mapa já descoberto deste bioma, do save ({ nevoa, areas }), para o minimapa e o XP das áreas
    this.partida = { bioma: partida.bioma ?? 'floresta', pontoPartida: partida.pontoPartida ?? 'inicio', descobertas: partida.descobertas ?? null }
  }

  // Relógio da partida, em ms: só anda quando a cena roda. Na pausa (e com a aba escondida) ele para, e com ele
  // os 30 s do desmaio, as recargas, a contagem do Q e da fuga e os tempos do Resumo. Todo mundo usa este, nunca
  // o relógio do Phaser (que continua correndo na pausa).
  get agora() {
    return this.relogio
  }

  create() {
    this.relogio = 0
    criarTexturas(this)
    // O mapa: a Floresta ou a arena de teste (só no npm run dev)
    this.mapa = mapaDoBioma(this.partida.bioma)
    const { area } = this.mapa
    this.area = area
    this.limites = {
      esquerda: area.x - area.largura / 2,
      direita: area.x + area.largura / 2,
      topo: area.y - area.altura / 2,
      base: area.y + area.altura / 2,
    }
    // Área sem borda (para o Líder não escorregar sozinho ao longo da borda quando o jogador anda contra ela)
    this.semBorda = { x: area.x, y: area.y, largura: 1e7, altura: 1e7 }
    // Onde o grupo nasce: no ponto de partida escolhido (RF32); na arena, no início dela
    this.inicioDoGrupo = this.mapa.comCamera ? inicioDoPontoDePartida(this.mapa.regioes, this.partida.pontoPartida) : { ...this.mapa.inicio }
    // A borda é a beira da área andável: na arena, ninguém anda embaixo do HUD nem da barra de teste; na Floresta,
    // ninguém sai do mapa (e a mata fechada em volta das regiões é parede)
    this.physics.world.setBounds(this.limites.esquerda, this.limites.topo, area.largura, area.altura)
    if (this.mapa.comCamera) desenharFloresta(this, this.mapa)
    else this.desenharChao()

    // Grupos de física: quem bate em quem
    this.obstaculos = this.physics.add.staticGroup()
    this.corposDoGrupo = this.physics.add.group({ collideWorldBounds: true })
    this.corposDosInimigos = this.physics.add.group({ collideWorldBounds: true })
    this.criarObstaculos()
    this.boneco = null
    if (this.mapa.boneco) {
      this.boneco = new BonecoDeTreino(this, this.mapa.boneco.x, this.mapa.boneco.y)
      this.obstaculos.add(this.boneco.corpo)
    }
    // O que ninguém atravessa, para quem anda achar o caminho (aliados e inimigos), e a busca rápida por perto.
    // Os tiros e a linha de tiro olham só as pedras e árvores: o boneco de treino é alvo, não parede.
    this.retangulosDosObstaculos = [...this.mapa.obstaculos, ...(this.boneco ? [this.boneco.retangulo()] : [])]
    this.indiceDasParedes = criarIndice(this.retangulosDosObstaculos)
    this.indiceDasPedras = this.boneco ? criarIndice(this.mapa.obstaculos) : this.indiceDasParedes
    this.navegador = new Navegador(area, this.retangulosDosObstaculos, this.indiceDasParedes)

    this.grupo = [] // Líder e aliados (Personagem) que estão no mapa; o Líder é this.lider
    this.inimigos = []
    this.projeteis = [] // flechas, bolas, auras, tiros e habilidades: tudo que tem atualizar() e destruir()
    this.perdidos = [] // quem a Pedra de Retorno levou: { classe, x, y } (onde caiu, para a taxa na TASK-048)
    this.houveDesmaio = false // para a Grande Vitória (RF47)
    this.terminou = false
    this.invencivel = false
    this.aliadosAjudam = true // barra de teste: desligado, os aliados não levantam ninguém
    this.iaForcada = null // barra de teste: força um nível da IA para todos os aliados (null = pelo nível de cada um)
    this.focoAte = 0 // momento de foco da IA avançada (regras/nivelDaIA.js)
    // Contagem para o roteiro de testes: tiros de cada classe e quantos acabaram numa pedra
    this.contagemDeTiros = { disparados: {}, naPedra: {} }
    // Barra de teste "Testar foco": decisões e erros dos aliados durante o foco, e até quando a vida do Líder fica presa
    this.contagemDoFoco = { decisoes: 0, erros: 0 }
    this.vidaPresaAte = 0

    // Andamento (5c): em combate, retorno com Q, fuga com F e o que a partida ganhou até agora
    this.ultimoDano = null // quando alguém do grupo causou ou recebeu dano pela última vez
    this.emCombate = false
    this.retorno = null // { msRestantes, interrompido } (regras/andamentoDaPartida.js)
    this.fuga = null // { msRestantes }
    this.msAtivos = 0 // tempo ativo: com dano nos últimos 5 s
    this.ganhos = { ouro: 0, monstros: 0, xpPorClasse: {} }
    this.niveisAvisados = {} // classe → último nível avisado no HUD ("subiu de nível")
    this.andamentoAvisado = ''
    this.anguloDaMira = 0
    this.ultimaEsquiva = null
    this.fimDaEsquiva = 0
    this.ultimoRastro = 0

    this.grupoInicial.forEach((membro, indice) => this.adicionarAoGrupo(membro, indice, this.grupoInicial.length))
    for (const inimigo of this.mapa.inimigosIniciais ?? []) this.criarInimigo(inimigo.tipo, inimigo)
    if (this.mapa.populacao) this.povoarMundo()
    this.prepararEscudos()
    this.prepararCamera()
    this.regiaoDoLider = this.regiaoEm(this.lider)
    this.prepararExploracao()

    // Todos batem em todos (Líder, aliados e inimigos): ninguém atravessa ninguém
    const podemColidir = (a, b) => this.podemColidir(a.entidade, b.entidade)
    this.physics.add.collider(this.corposDoGrupo, this.corposDoGrupo, null, podemColidir)
    this.physics.add.collider(this.corposDoGrupo, this.corposDosInimigos, null, podemColidir)
    this.physics.add.collider(this.corposDosInimigos, this.corposDosInimigos, null, podemColidir)
    // As pedras e o boneco vêm por último: se uma batida entre dois corpos empurrou alguém para dentro de
    // uma pedra, a pedra o põe para fora no mesmo quadro
    this.physics.add.collider(this.corposDoGrupo, this.obstaculos)
    this.physics.add.collider(this.corposDosInimigos, this.obstaculos)

    // Teclado (só existe enquanto a Partida está aberta) e mouse. Espaço não rola a página.
    this.teclas = this.input.keyboard.addKeys({
      cima: 'W',
      baixo: 'S',
      esquerda: 'A',
      direita: 'D',
      esquiva: 'SPACE',
      habilidade1: 'ONE',
      habilidade2: 'TWO',
      habilidade3: 'THREE',
    })
    this.input.on('pointerdown', (ponteiro) => {
      if (ponteiro.leftButtonDown() && !this.lider.caido) this.usarAtaque(this.lider, this.anguloDaMira)
    })

    const pararDeOuvir = [
      this.ponte.ouvir('comando', (comando) => this.executarComando(comando)),
      this.ponte.ouvir('pausa', (pausado) => this.definirPausa(pausado)),
    ]
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => pararDeOuvir.forEach((parar) => parar()))
    this.events.once(Phaser.Scenes.Events.DESTROY, () => pararDeOuvir.forEach((parar) => parar()))

    // O React fica sabendo da situação 8 vezes por segundo, não a cada quadro
    this.time.addEvent({ delay: 125, loop: true, callback: () => this.avisarSituacao() })
    this.avisarSituacao()
    if (this.ponte.pausado) this.time.delayedCall(0, () => this.definirPausa(true))
  }

  // ---------- Montagem da arena ----------

  // Arena de teste (só no npm run dev): o campo verde da Fase 1, entre a faixa do HUD e a da barra de teste
  desenharChao() {
    const { largura, altura } = tamanhoDaArena
    const area = this.area
    for (const mancha of this.mapa.manchas) {
      this.add.ellipse(mancha.x, mancha.y, mancha.largura, mancha.altura, coresDaArena.mancha).setDepth(camadas.manchas)
    }
    // Faixas do HUD e da barra de teste: fora da área jogável
    this.add.rectangle(largura / 2, faixas.hud / 2, largura, faixas.hud, coresDaArena.faixa).setDepth(camadas.borda)
    this.add
      .rectangle(largura / 2, altura - faixas.barraDeTeste / 2, largura, faixas.barraDeTeste, coresDaArena.faixa)
      .setDepth(camadas.borda)
    this.add
      .rectangle(area.x, area.y, area.largura - 8, area.altura - 8)
      .setStrokeStyle(8, coresDaArena.borda)
      .setDepth(camadas.borda)
  }

  // A hitbox de cada obstáculo é uma zona invisível; o desenho é separado (na arena, aqui; na Floresta, em
  // jogo/mapas.js, junto com o chão)
  criarObstaculos() {
    for (const pedra of this.mapa.obstaculos) {
      if (!this.mapa.comCamera) {
        this.add.rectangle(pedra.x + 6, pedra.y + 8, pedra.largura, pedra.altura, coresDaArena.sombra, 0.22).setDepth(camadas.sombras)
        this.add
          .rectangle(pedra.x, pedra.y, pedra.largura, pedra.altura, coresDaArena.pedra)
          .setStrokeStyle(2, coresDaArena.contorno)
          .setDepth(pedra.y)
        this.add.rectangle(pedra.x, pedra.y - pedra.altura / 2 + 7, pedra.largura - 12, 6, 0xffffff, 0.25).setDepth(pedra.y + 1)
      }
      this.obstaculos.add(this.add.zone(pedra.x, pedra.y, pedra.largura, pedra.altura))
    }
  }

  // Na Floresta, a câmera segue o Líder e para nos limites do mapa. Ela mostra o mundo só entre a faixa do HUD e a
  // de baixo: ninguém fica escondido embaixo delas. Na arena, a câmera fica parada (a arena cabe na tela).
  prepararCamera() {
    if (!this.mapa.comCamera) return
    const { largura, altura } = tamanhoDaArena
    const camera = this.cameras.main
    camera.setViewport(0, faixas.hud, largura, altura - faixas.hud - faixas.barraDeTeste)
    camera.setBounds(0, 0, this.mapa.tamanho.largura, this.mapa.tamanho.altura)
    camera.setBackgroundColor(this.mapa.cores.mata)
    camera.startFollow(this.lider.corpo, true, mundo.camera.suavidade, mundo.camera.suavidade)
    camera.centerOn(this.lider.x, this.lider.y)
  }

  // Obstáculos perto de um ponto (busca rápida: o mapa grande tem centenas)
  paredesPerto(ponto, raio = alcanceDasParedes) {
    return retangulosPerto(this.indiceDasParedes, ponto, raio)
  }

  // Obstáculos que podem cortar o caminho reto de a até b
  paredesEntre(a, b, folga = 0) {
    return retangulosEntre(this.indiceDasParedes, a, b, folga + 2)
  }

  // Pedras e árvores (sem o boneco de treino) perto de um ponto e entre dois pontos: para os tiros e a linha de tiro
  pedrasPerto(ponto, raio) {
    return retangulosPerto(this.indiceDasPedras, ponto, raio)
  }

  pedrasEntre(a, b, folga = 0) {
    return retangulosEntre(this.indiceDasPedras, a, b, folga + 2)
  }

  adicionarAoGrupo(membro, indice, total) {
    const vaga = membro.lider ? { x: 0, y: 0 } : vagaNaFormacao(indice - 1, Math.max(1, total - 1), raioDaFormacao)
    const lugar = this.lugarLivre(personagem.tamanho, { x: this.inicioDoGrupo.x + vaga.x, y: this.inicioDoGrupo.y + vaga.y })
    const novo = new Personagem(this, membro, lugar.x, lugar.y)
    this.corposDoGrupo.add(novo.corpo)
    this.grupo.push(novo)
    if (membro.lider) this.lider = novo
    return novo
  }

  // Inimigo da arena (mob vermelho ou atirador). Nasce com folga em volta: ninguém nasce encostado em ninguém.
  criarInimigo(tipo, ponto) {
    const lugar = this.lugarLivre(combateDeTeste[tipo].tamanho, ponto, null, mundo.nascimento.folga)
    return this.adicionarInimigo(new tiposDeInimigo[tipo](this, lugar.x, lugar.y))
  }

  adicionarInimigo(inimigo) {
    this.corposDosInimigos.add(inimigo.corpo)
    this.inimigos.push(inimigo)
    return inimigo
  }

  // Mob da Floresta: a ficha do tipo com a força da região (regras/mobs.js)
  criarMobDoMundo(tipo, idDaRegiao, ponto) {
    const regiao = this.mapa.regioes.find((uma) => uma.id === idDaRegiao)
    const ficha = fichaNaRegiao(mundo.mobs[tipo], mundo.forcaDaRegiao[regiao?.dificuldade] ?? 1)
    const lugar = this.lugarLivre(ficha.tamanho, ponto, null, mundo.nascimento.folga)
    const inimigo = this.adicionarInimigo(new classeDoComportamento[ficha.comportamento](this, lugar.x, lugar.y, { ...ficha, tipo }, ficha.cor))
    inimigo.tipo = tipo
    inimigo.regiao = idDaRegiao
    return inimigo
  }

  // A cada partida o bioma reinicia (RF31): os mobs nascem em lugares novos, nunca perto do início de uma região
  // (o grupo nunca nasce com mob perto, RF32)
  povoarMundo() {
    const { nascimento } = mundo
    const proibidos = this.mapa.regioes.map((regiao) => ({ ...regiao.inicio, raio: nascimento.longeDosInicios }))
    const sorteio = criarSorteio(Math.floor(Math.random() * 2 ** 31))
    const mobs = espalharMobs(this.mapa.regioes, this.mapa.populacao, { proibidos, distanciaEntreMobs: nascimento.distanciaEntreMobs, margem: nascimento.margem }, sorteio)
    for (const mob of mobs) this.criarMobDoMundo(mob.tipo, mob.regiao, mob)
  }

  // Em que região um ponto está (null na arena)
  regiaoEm(ponto) {
    return this.mapa.regioes.length ? regiaoEm(this.mapa.regioes, ponto) : null
  }

  noDominioDeBoss(ponto) {
    return Boolean(this.regiaoEm(ponto)?.dominioDeBoss)
  }

  // Todo Tanque (Líder ou aliado) tem o escudo; quem deixou de ser Tanque perde o dele
  prepararEscudos() {
    for (const membro of this.grupo) {
      if (membro.classe === 'tanque' && !membro.escudo) membro.escudo = new Escudo(this, membro)
      if (membro.classe !== 'tanque' && membro.escudo) {
        membro.escudo.destruir()
        membro.escudo = null
      }
    }
  }

  get aliados() {
    return this.grupo.filter((membro) => !membro.lider)
  }

  // Nível da IA de um aliado: o do nível dele (básica, média ou avançada), ou o forçado na barra de teste.
  // "nivel" é o nível usado na chance de erro (forçado: um nível do meio da faixa).
  perfilDaIA(aliado) {
    if (this.iaForcada) return { id: this.iaForcada, nivel: nivelParaTestar(this.iaForcada) }
    return { id: nivelDaIA(aliado.nivel), nivel: aliado.nivel }
  }

  // Quem os inimigos podem atacar: os do grupo que estão de pé
  get membrosDePe() {
    return this.grupo.filter((membro) => !membro.caido)
  }

  // Ponto livre mais próximo para um corpo deste tamanho: dentro da borda, fora das pedras e sem ninguém em cima.
  // Vale para começar a partida, Encher grupo e criar inimigos (ninguém nasce em pedra nem em cima de outro).
  // comCorpos = false: só pedras e borda (a vaga de um aliado em volta do Líder).
  lugarLivre(tamanho, ponto, ignorar = null, folga = 4, comCorpos = true) {
    const ocupados = comCorpos
      ? [...this.grupo, ...this.inimigos, this.boneco]
          .filter((entidade) => entidade && entidade !== ignorar && !entidade.morto)
          .map((entidade) => ({ x: entidade.x, y: entidade.y, raio: entidade.raio }))
      : []
    // A busca vai até 800 px do ponto: só os obstáculos até lá contam
    const regras = { area: this.area, paredes: this.paredesPerto(ponto, 900 + tamanho), ocupados, raio: tamanho / 2, folga }
    return pontoLivreMaisProximo(ponto, regras) ?? { x: ponto.x, y: ponto.y }
  }

  // ---------- A cada quadro ----------

  update(tempo, delta) {
    if (this.terminou) return
    // O relógio da partida anda o tempo do quadro (no máximo 0,1 s, para um engasgo não pular nada)
    const ms = Math.min(delta, 100)
    this.relogio += ms
    const agora = this.agora
    const segundos = Math.min(delta, 50) / 1000
    const lider = this.lider
    this.corrigirSobreposicoes(agora)

    // O mouse no mapa é recalculado a cada quadro: com a câmera andando e o mouse parado, a mira continua certa
    this.mouseNoMundo = this.pontoDoMouse()
    if (!lider.caido) {
      this.anguloDaMira = Math.atan2(this.mouseNoMundo.y - lider.y, this.mouseNoMundo.x - lider.x)
      lider.anguloDaMira = this.anguloDaMira
    }
    lider.atualizarMira(this.anguloDaMira)
    this.atualizarLider(agora)
    this.acompanharRegiao()
    this.explorar()
    pensarAliados(this, agora)
    this.trazerAliadosDeVolta(agora, ms)
    this.acordarOuDormir()
    for (const inimigo of [...this.inimigos]) if (!inimigo.dormindo) inimigo.atualizar(agora)
    this.boneco?.atualizar(agora)
    this.moverTodos(agora, segundos)

    this.projeteis = this.projeteis.filter((projetil) => {
      const continua = projetil.atualizar(agora, segundos)
      if (!continua) projetil.destruir()
      return continua
    })
    for (const membro of this.grupo) membro.escudo?.atualizar()
    this.atualizarMana(segundos)
    this.prenderVidaDoTesteDoFoco(agora)
    this.atualizarDesmaios(agora, ms)
    if (this.terminou) return
    this.atualizarAndamento(agora, ms)
    if (this.terminou) return

    for (const entidade of this.desenhaveis()) entidade.atualizarDesenho(agora, delta)
    if (this.mapa.comCamera) this.esconderForaDaTela()
  }

  // Exploração (RF40): a névoa do minimapa, as áreas já descobertas (do save) e o que esta partida descobriu.
  // Tudo isso só entra no save no fim da partida, como os outros ganhos (RF12).
  prepararExploracao() {
    this.exploracao = null
    if (!this.mapa.comCamera) return
    const { celula } = mundo.minimapa
    const total = Math.ceil(this.mapa.tamanho.largura / celula) * Math.ceil(this.mapa.tamanho.altura / celula)
    const salvas = this.partida.descobertas
    this.exploracao = {
      nevoa: criarNevoa(this.mapa.tamanho, celula, decodificarNevoa(salvas?.nevoa, total)),
      conhecidas: new Set(salvas?.areas ?? []),
      novas: [],
      xp: 0,
      regioes: new Set(),
    }
    this.explorar()
  }

  // A cada quadro: revela o minimapa em volta do Líder; a primeira vez numa área dá XP (dividido como o dos monstros,
  // RF50); a região entra na lista das descobertas (libera o Ponto de partida, RF32)
  explorar() {
    const exploracao = this.exploracao
    if (!exploracao) return
    revelarEmVolta(exploracao.nevoa, this.lider, mundo.minimapa.raioRevelado)
    const regiao = this.regiaoDoLider
    if (regiao && regiao.pontoDePartida !== 'inicio') exploracao.regioes.add(regiao.pontoDePartida)
    const area = areaEm(this.mapa.areas, this.lider)
    if (!area || exploracao.conhecidas.has(area.id)) return
    exploracao.conhecidas.add(area.id)
    exploracao.novas.push(area.id)
    const dificuldade = this.mapa.regioes.find((uma) => uma.id === area.regiao)?.dificuldade
    const xp = mundo.xpPorArea[dificuldade] ?? 0
    if (xp > 0) {
      exploracao.xp += xp
      this.dividirXp(xp)
    }
    this.mensagem(`Área descoberta: ${area.nome}${xp > 0 ? ` (+${xp} XP)` : ''}`, 'bom')
  }

  // O que vai para o minimapa do HUD (8 vezes por segundo)
  situacaoDoMinimapa() {
    if (!this.exploracao) return null
    const vista = this.cameras.main.worldView
    const ponto = (entidade) => ({ x: Math.round(entidade.x), y: Math.round(entidade.y) })
    return {
      nevoa: codificarNevoa(this.exploracao.nevoa.bits),
      lider: ponto(this.lider),
      aliados: this.aliados.map(ponto),
      vista: { x: Math.round(vista.x), y: Math.round(vista.y), largura: Math.round(vista.width), altura: Math.round(vista.height) },
    }
  }

  // A região do Líder (HUD, RF53); entrar numa região nova mostra o nome dela
  acompanharRegiao() {
    const regiao = this.regiaoEm(this.lider)
    if (!regiao || regiao === this.regiaoDoLider) return
    this.regiaoDoLider = regiao
    // No domínio do Boss, a taxa da fuga e dos perdidos sobe (RF48): o jogador fica sabendo ao entrar
    this.mensagem(regiao.dominioDeBoss ? 'Domínio do Boss: aqui a fuga e os perdidos custam mais' : `Região: ${regiao.nome}`, regiao.dominioDeBoss ? 'alerta' : 'aviso')
  }

  // Aliado longe ou preso (Fase 3): fora da tela e longe do Líder (ou travado) por alguns segundos, ele reaparece
  // logo além da borda da tela do lado em que estava, num lugar livre com caminho reto até o Líder, e entra andando.
  // Acontece fora da vista: o jogador só vê o aliado chegando. Caído não volta (continua esperando ajuda).
  trazerAliadosDeVolta(agora, ms) {
    if (!this.mapa.comCamera) return
    const { aliadoLonge } = mundo
    const vista = this.cameras.main.worldView
    for (const aliado of this.aliados) {
      if (aliado.caido || aliado.deslizando) {
        aliado.longeHa = 0
        continue
      }
      const foraDaTela = aliado.x < vista.x - aliado.raio || aliado.x > vista.right + aliado.raio || aliado.y < vista.y - aliado.raio || aliado.y > vista.bottom + aliado.raio
      const longe = Math.hypot(aliado.x - this.lider.x, aliado.y - this.lider.y) > aliadoLonge.distancia
      const preso = (aliado.travamento?.nivel ?? 0) >= 2
      aliado.longeHa = foraDaTela && (longe || preso) ? (aliado.longeHa ?? 0) + ms : 0
      if (aliado.longeHa < aliadoLonge.ms) continue
      const ponto = this.pontoParaVoltar(aliado, vista)
      if (!ponto) continue
      aliado.longeHa = 0
      aliado.colocarEm(ponto.x, ponto.y)
      this.navegador.esquecer(aliado)
      if (aliado.ia) {
        aliado.ia.parado = false
        aliado.ia.quietoAte = 0
      }
    }
  }

  // Um ponto logo além da borda da tela, na direção do aliado (ou perto dela), livre e com caminho reto até o Líder
  pontoParaVoltar(aliado, vista) {
    const lider = this.lider
    const angulo = Math.atan2(aliado.y - lider.y, aliado.x - lider.x)
    const alem = mundo.aliadoLonge.alemDaBorda + aliado.raio
    for (const desvio of [0, 0.4, -0.4, 0.8, -0.8, 1.3, -1.3, Math.PI]) {
      const direcao = { x: Math.cos(angulo + desvio), y: Math.sin(angulo + desvio) }
      // Até a borda da tela nessa direção, e um pouco além
      const ateBordaX = direcao.x > 0 ? (vista.right - lider.x) / direcao.x : direcao.x < 0 ? (vista.x - lider.x) / direcao.x : Infinity
      const ateBordaY = direcao.y > 0 ? (vista.bottom - lider.y) / direcao.y : direcao.y < 0 ? (vista.y - lider.y) / direcao.y : Infinity
      const distancia = Math.min(ateBordaX, ateBordaY) + alem
      const alvo = { x: lider.x + direcao.x * distancia, y: lider.y + direcao.y * distancia }
      const lugar = this.lugarLivre(aliado.tamanho, alvo, aliado, 6)
      const naBorda = Math.hypot(lugar.x - alvo.x, lugar.y - alvo.y) < 120
      if (naBorda && this.navegador.livre(lider, lugar, aliado.raio + 1)) return lugar
    }
    return null
  }

  // Quem tem desenho para atualizar neste quadro (os mobs que dormem longe ficam como estão)
  desenhaveis() {
    return [...this.grupo, ...this.inimigos.filter((inimigo) => !inimigo.dormindo), ...(this.boneco ? [this.boneco] : [])]
  }

  // O ponto do mapa embaixo do mouse, pela câmera
  pontoDoMouse() {
    const ponteiro = this.input.activePointer
    const ponto = this.cameras.main.getWorldPoint(ponteiro.x, ponteiro.y)
    return { x: ponto.x, y: ponto.y }
  }

  // Longe do Líder e sem perseguir ninguém, o mob dorme: não pensa nem anda (TEST-005, 60 FPS). Acorda quando o
  // grupo chega perto. Na arena (pequena), ninguém dorme.
  acordarOuDormir() {
    if (!this.mapa.comCamera) return
    const lider = this.lider
    for (const inimigo of this.inimigos) {
      const longe = Math.hypot(inimigo.x - lider.x, inimigo.y - lider.y) > mundo.raioAtivo
      const dormir = longe && !inimigo.perseguindo
      if (dormir && !inimigo.dormindo) {
        inimigo.parar()
        inimigo.corpo.body?.setVelocity(0, 0)
        this.navegador.esquecer(inimigo)
      }
      inimigo.dormindo = dormir
    }
  }

  // Desenha só o que aparece na tela (com uma folga): os pedaços do chão da Floresta e os mobs longe
  esconderForaDaTela() {
    const vista = this.cameras.main.worldView
    const folga = 200
    const naTela = (x0, y0, x1, y1) => x1 >= vista.x - folga && x0 <= vista.right + folga && y1 >= vista.y - folga && y0 <= vista.bottom + folga
    for (const pedaco of this.pedacosDoChao ?? []) {
      const visivel = naTela(pedaco.x0, pedaco.y0, pedaco.x1, pedaco.y1)
      if (visivel === pedaco.visivel) continue
      pedaco.visivel = visivel
      for (const objeto of pedaco.objetos) objeto.setVisible(visivel)
    }
    for (const inimigo of this.inimigos) {
      const r = inimigo.tamanho
      inimigo.definirVisivel(naTela(inimigo.x - r, inimigo.y - r, inimigo.x + r, inimigo.y + r))
    }
  }

  atualizarLider(agora) {
    const lider = this.lider
    if (lider.caido) {
      lider.parar()
      return
    }
    const dx = (this.teclas.direita.isDown ? 1 : 0) - (this.teclas.esquerda.isDown ? 1 : 0)
    const dy = (this.teclas.baixo.isDown ? 1 : 0) - (this.teclas.cima.isDown ? 1 : 0)
    if (Phaser.Input.Keyboard.JustDown(this.teclas.esquiva)) this.esquivar(agora, dx, dy)
    // Teclas 1, 2 e 3: as habilidades do Líder (TASK-046)
    ;['habilidade1', 'habilidade2', 'habilidade3'].forEach((tecla, indice) => {
      if (Phaser.Input.Keyboard.JustDown(this.teclas[tecla])) this.usarHabilidade(lider, indice, this.miraDoLider())
    })

    if (agora < this.fimDaEsquiva) {
      lider.andar(this.velocidadeDaEsquiva)
      if (agora - this.ultimoRastro > 35) {
        this.ultimoRastro = agora
        rastro(this, lider.x, lider.y, lider.tamanho, lider.cor)
      }
      return
    }
    lider.andar(velocidadeDoMovimento(dx, dy, personagem.velocidade))
  }

  // Para onde o Líder mira: o ângulo e o ponto do mouse (o Meteoro cai nele, até o alcance)
  miraDoLider() {
    return { angulo: this.anguloDaMira, ponto: this.mouseNoMundo ?? this.pontoDoMouse() }
  }

  // Esquiva: avanço curto na direção do movimento (parado: na direção da mira), sem levar dano
  esquivar(agora, dx, dy) {
    if (!podeUsar(agora, this.ultimaEsquiva, esquiva.recargaMs)) return
    const direcao = dx || dy ? { x: dx, y: dy } : { x: Math.cos(this.anguloDaMira), y: Math.sin(this.anguloDaMira) }
    this.velocidadeDaEsquiva = velocidadeDoMovimento(direcao.x, direcao.y, esquiva.distancia / (esquiva.ms / 1000))
    this.ultimaEsquiva = agora
    this.fimDaEsquiva = agora + esquiva.ms
    this.lider.fimDoEmpurrao = 0 // a esquiva tira o Líder do empurrão
    const deitado = Math.abs(this.velocidadeDaEsquiva.x) >= Math.abs(this.velocidadeDaEsquiva.y)
    this.lider.deformar(deitado ? 1.4 : 0.7, deitado ? 0.7 : 1.4, 60, 160)
    particulas(this, this.lider.x, this.lider.y + 16, 0xe8f5d0, 6, 120)
  }

  // A mana volta sozinha (a Sabedoria define a velocidade); a vida não (RF38)
  atualizarMana(segundos) {
    for (const membro of this.grupo) {
      if (!membro.caido) membro.mana = regenerarMana(membro.mana, membro.manaMaxima, membro.manaPorSegundo, segundos)
    }
  }

  // ---------- Movimento de todos (separação, escorregar e destravar) ----------

  // Cada um já disse para onde quer andar (andar/parar). Aqui entra a zona em volta de cada corpo:
  // quem está perto demais se afasta aos poucos; quem é empurrado contra uma pedra escorrega para o lado;
  // quem anda sozinho e não sai do lugar tenta outro jeito (regras/movimento.js).
  moverTodos(agora, segundos) {
    const andantes = this.andantes()
    const corpos = [...andantes, ...(this.boneco ? [this.boneco] : [])].map((entidade) => ({
      x: entidade.x,
      y: entidade.y,
      raio: entidade.raio,
      peso: entidade.peso,
      fixo: entidade.fixo,
    }))
    const afastamentos = separacao(corpos, combateDeTeste.separacao)
    this.encerrarSeparacaoSuave(andantes, agora)
    andantes.forEach((entidade, i) => {
      if (entidade.deslizando) return
      const corpo = entidade.corpo.body
      if (entidade.fixo) {
        corpo.setVelocity(0, 0)
        return
      }
      const empurrado = entidade.estaSendoEmpurrado(agora)
      let base = empurrado ? entidade.vetorDoEmpurrao : entidade.querida
      if (entidade.andaSozinho && !empurrado) base = this.destravar(entidade, base, agora, segundos)
      // Os outros corpos encostados contam como parede: quem anda contra eles para ou escorrega para o lado,
      // em vez de empurrá-los (assim ninguém é espremido para dentro de uma pedra nem de outro corpo).
      // O Líder é a exceção com os aliados: ele pode empurrá-los, para nunca ficar preso atrás de um aliado
      // parado (a correção de sobreposição continua valendo).
      const encostados = entidade.lider ? andantes.filter((outro) => !this.grupo.includes(outro)) : andantes
      const outros = this.corposEncostados(entidade, [entidade, ...encostados], agora)
      const paredes = this.paredesPerto(entidade)
      // Quem anda sozinho escorrega em tudo; o Líder escorrega nos corpos e, nas pedras, só no afastamento
      // (contra uma pedra, quem manda é o jogador)
      // (o "segundos" faz cada um olhar à frente o tanto que vai andar neste quadro)
      const final = entidade.andaSozinho
        ? escorregar(somar(base, afastamentos[i]), entidade, [...paredes, ...outros], this.area, 4, segundos)
        : somar(
            escorregar(base, entidade, outros, this.semBorda, 4, segundos),
            escorregar(afastamentos[i], entidade, [...paredes, ...outros], this.area, 4, segundos),
          )
      corpo.setVelocity(final.x, final.y)
    })
  }

  // Retângulos dos corpos perto o bastante para encostar (o boneco já está nas paredes). Logo depois do
  // "Juntar todos", quem ainda está no bolo não conta: ali a zona separa todo mundo aos poucos.
  corposEncostados(entidade, andantes, agora) {
    if (entidade.separandoAte > agora) return []
    const alcance = entidade.tamanho + 12
    return andantes
      .filter((outro) => outro !== entidade && !outro.deslizando && outro.separandoAte <= agora)
      .filter((outro) => Math.abs(outro.x - entidade.x) < alcance && Math.abs(outro.y - entidade.y) < alcance)
      .map((outro) => outro.retangulo())
  }

  // Depois da física: quem ficou um dentro do outro num aperto (corpos contra a pedra) é afastado pelo tanto
  // que entrou, sem entrar na pedra (regras/movimento.js). São poucos px por vez, então não dá tranco.
  corrigirSobreposicoes(agora) {
    const andantes = this.andantes()
    if (andantes.length === 0) return
    // Os obstáculos em volta de quem anda (todos ficam perto do Líder; os mobs longe dormem)
    const paredes = this.paredesEmVolta(andantes)
    // Primeiro, quem ficou dentro de uma pedra sai dela (parado, a física o considera "enterrado" e não tira)
    const foraDasPedras = tirarDasParedes(
      andantes.map((entidade) => ({ x: entidade.x, y: entidade.y, raio: entidade.raio })),
      paredes,
      this.area,
    )
    andantes.forEach((entidade, i) => {
      if (entidade.deslizando) return
      const { x, y } = foraDasPedras[i]
      if (Math.abs(x - entidade.x) > 0.01 || Math.abs(y - entidade.y) > 0.01) entidade.corpo.body.reset(x, y)
    })
    const corpos = andantes.map((entidade) => ({
      x: entidade.x,
      y: entidade.y,
      raio: entidade.raio,
      fixo: entidade.fixo,
      ignorar: entidade.deslizando || entidade.separandoAte > agora,
    }))
    const posicoes = desfazerSobreposicoes(corpos, paredes, this.area, 8)
    andantes.forEach((entidade, i) => {
      const { x, y } = posicoes[i]
      if (Math.abs(x - entidade.x) > 0.01 || Math.abs(y - entidade.y) > 0.01) entidade.corpo.body.reset(x, y)
    })
  }

  // Quem anda neste quadro: o grupo e os mobs acordados
  andantes() {
    return [...this.grupo, ...this.inimigos.filter((inimigo) => !inimigo.morto && !inimigo.dormindo)]
  }

  // Os obstáculos na caixa que envolve todos os corpos dados (com folga)
  paredesEmVolta(corpos) {
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    for (const corpo of corpos) {
      x0 = Math.min(x0, corpo.x)
      y0 = Math.min(y0, corpo.y)
      x1 = Math.max(x1, corpo.x)
      y1 = Math.max(y1, corpo.y)
    }
    const folga = alcanceDasParedes
    return retangulosNaCaixa(this.indiceDasParedes, { x: (x0 + x1) / 2, y: (y0 + y1) / 2, largura: x1 - x0 + folga * 2, altura: y1 - y0 + folga * 2 })
  }

  // Quem já saiu do bolo do "Juntar todos" (ninguém mais em cima dele) volta a ter a batida dura
  encerrarSeparacaoSuave(andantes, agora) {
    const emCima = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < ((a.tamanho + b.tamanho) / 2) * 0.6
    for (const entidade of andantes) {
      if (entidade.separandoAte > agora && !andantes.some((outro) => outro !== entidade && emCima(entidade, outro))) {
        entidade.separandoAte = 0
      }
    }
  }

  // Batida dura sempre: ninguém passa por cima de ninguém. Duas exceções: logo depois do "Juntar todos",
  // quem ainda está um em cima do outro se separa aos poucos pela zona (sem o tranco da física);
  // e quem está deslizando para o ponto livre passa por todos.
  podemColidir(a, b) {
    if (a.deslizando || b.deslizando) return false
    const agora = this.agora
    if (a.separandoAte <= agora && b.separandoAte <= agora) return true
    return Math.hypot(a.x - b.x, a.y - b.y) > ((a.tamanho + b.tamanho) / 2) * 0.6
  }

  // Quase não saiu do lugar tentando andar: escorrega para um lado, depois para o outro, dá a volta e,
  // por último, desliza até o ponto livre mais próximo.
  destravar(entidade, base, agora, segundos) {
    entidade.travamento = acompanharTravamento(
      entidade.travamento,
      { agora, segundos, posicao: { x: entidade.x, y: entidade.y }, velocidadeQuerida: base },
      travamento,
    )
    const { nivel } = entidade.travamento
    if (nivel === 0) {
      entidade.manobra = null
      return base
    }
    if (!entidade.manobra || entidade.manobra.nivel !== nivel) {
      const manobra = manobraParaDestravar(nivel, base, travamento.nivelDoPontoLivre)
      if (manobra.tipo === 'pontoLivre') {
        this.deslizarParaPontoLivre(entidade)
        return { x: 0, y: 0 }
      }
      entidade.manobra = { ...manobra, nivel }
    }
    const velocidade = Math.hypot(base.x, base.y)
    return { x: entidade.manobra.direcao.x * velocidade, y: entidade.manobra.direcao.y * velocidade }
  }

  // Último caso: desliza depressa (sem teletransporte) até o lugar livre mais próximo, com folga em volta
  deslizarParaPontoLivre(entidade) {
    entidade.travamento = null
    entidade.manobra = null
    const ponto = this.lugarLivre(entidade.tamanho, entidade, entidade, travamento.folgaDoPontoLivre)
    if (Math.hypot(ponto.x - entidade.x, ponto.y - entidade.y) < 4) return
    // O deslize não passa por cima de ninguém: se o caminho cruza outro corpo, ele fica quieto e tenta depois
    const outros = this.andantes()
      .filter((outro) => outro !== entidade)
      .map((outro) => ({ x: outro.x, y: outro.y, largura: outro.tamanho, altura: outro.tamanho }))
    if (!linhaLivre(entidade, ponto, outros, entidade.raio)) {
      if (entidade.ia) entidade.ia.quietoAte = this.agora + combateDeTeste.ia.tremor.msQuieto
      return
    }
    entidade.deslizando = true
    entidade.corpo.body.setVelocity(0, 0)
    entidade.corpo.body.checkCollision.none = true
    this.navegador.esquecer(entidade)
    particulas(this, entidade.x, entidade.y, 0xffffff, 6, 120)
    const caminho = { x: entidade.x, y: entidade.y }
    this.tweens.add({
      targets: caminho,
      x: ponto.x,
      y: ponto.y,
      duration: travamento.msDoDeslize,
      ease: 'Quad.Out',
      onUpdate: () => {
        if (!entidade.morto) entidade.corpo.body.reset(caminho.x, caminho.y)
      },
      onComplete: () => {
        entidade.deslizando = false
        if (entidade.morto) return
        entidade.corpo.body.checkCollision.none = false
        particulas(this, entidade.x, entidade.y, 0xffffff, 6, 120)
      },
    })
  }

  // ---------- Ataques e habilidades (Líder e aliados) ----------

  // Ataque de teste da classe (clique do Líder; a IA usa o mesmo). Devolve true se saiu.
  usarAtaque(membro, angulo) {
    if (membro.caido || this.terminou) return false
    const agora = this.agora
    if (!podeUsar(agora, membro.ultimoAtaque, ataques[membro.classe].recargaMs)) return false
    membro.ultimoAtaque = agora
    membro.anguloDaMira = angulo
    this.contagemDeTiros.disparados[membro.classe] = (this.contagemDeTiros.disparados[membro.classe] ?? 0) + 1
    if (membro.classe === 'guerreiro') golpeDeEspada(this, membro, angulo)
    if (membro.classe === 'arqueiro') this.adicionarProjetil(new Flecha(this, membro, angulo))
    if (membro.classe === 'mago') this.adicionarProjetil(new BolaMagica(this, membro, angulo))
    if (membro.classe === 'sacerdote') this.adicionarProjetil(new Aura(this, membro, agora))
    if (membro.classe === 'tanque') membro.escudo?.empurrar()
    return true
  }

  // A habilidade dá para usar agora? (para a IA decidir; não avisa nada)
  habilidadeDisponivel(membro, indice) {
    const habilidade = membro.habilidades[indice]
    const temAlvo = habilidade ? (temAlvoParaAHabilidade[habilidade.id]?.(this, membro) ?? true) : false
    const agora = this.agora
    return podeUsarHabilidade({ habilidade, mana: membro.mana, agora, ultimoUso: membro.ultimoUsoDaHabilidade[indice], temAlvo }).ok
  }

  // Habilidade da tecla 1, 2 ou 3 (indice 0, 1 ou 2): gasta mana, começa a recarga e faz o efeito.
  // Sem mana, em recarga, tecla vazia ou sem alvo: não sai, e o Líder vê o aviso em cima dele.
  usarHabilidade(membro, indice, mira) {
    if (membro.caido || this.terminou) return false
    const agora = this.agora
    const habilidade = membro.habilidades[indice]
    const temAlvo = habilidade ? (temAlvoParaAHabilidade[habilidade.id]?.(this, membro) ?? true) : true
    const pode = podeUsarHabilidade({ habilidade, mana: membro.mana, agora, ultimoUso: membro.ultimoUsoDaHabilidade[indice], temAlvo })
    if (!pode.ok) {
      if (membro.lider) numeroFlutuante(this, membro.x, membro.y - 50, avisoDoMotivo[pode.motivo], pode.motivo === 'semMana' ? '#8fd3ff' : '#dddddd', 18)
      return false
    }
    membro.mana = gastarMana(membro.mana, habilidade.custoDeMana)
    membro.ultimoUsoDaHabilidade[indice] = agora
    membro.anguloDaMira = mira.angulo
    const ponto = habilidade.id === 'meteoro' ? this.pontoDoMeteoro(membro, mira.ponto, habilidade.alcance) : mira.ponto
    efeitosDasHabilidades[habilidade.id](this, membro, { ...mira, ponto })
    return true
  }

  // O Meteoro cai no ponto mirado, mas no máximo até o alcance e dentro da área jogável
  pontoDoMeteoro(dono, ponto, alcance) {
    const ate = Math.hypot(ponto.x - dono.x, ponto.y - dono.y)
    const fator = ate > alcance ? alcance / ate : 1
    const x = dono.x + (ponto.x - dono.x) * fator
    const y = dono.y + (ponto.y - dono.y) * fator
    const { limites } = this
    return {
      x: Math.min(limites.direita, Math.max(limites.esquerda, x)),
      y: Math.min(limites.base, Math.max(limites.topo, y)),
    }
  }

  adicionarProjetil(projetil) {
    this.projeteis.push(projetil)
  }

  // Quem os ataques do grupo acertam: os inimigos vivos e o boneco
  alvosDoJogador() {
    return [...this.inimigos.filter((inimigo) => !inimigo.morto), ...(this.boneco ? [this.boneco] : [])]
  }

  alvoAtingido(circulo) {
    return this.alvosDoJogador().find((alvo) => circuloTocaRetangulo(circulo, alvo.retangulo()))
  }

  bateEmObstaculo(circulo) {
    const { limites } = this
    const fora =
      circulo.x < limites.esquerda + circulo.raio ||
      circulo.y < limites.topo + circulo.raio ||
      circulo.x > limites.direita - circulo.raio ||
      circulo.y > limites.base - circulo.raio
    return fora || this.tocaObstaculo(circulo)
  }

  tocaObstaculo(circulo) {
    return this.pedrasPerto(circulo, circulo.raio + 4).some((pedra) => circuloTocaRetangulo(circulo, pedra))
  }

  // Um tiro do grupo acabou numa pedra (não na borda): conta, para o roteiro conferir a linha de tiro da IA
  registrarTiroNaPedra(dono, circulo) {
    if (!dono || !this.tocaObstaculo(circulo)) return
    this.contagemDeTiros.naPedra[dono.classe] = (this.contagemDeTiros.naPedra[dono.classe] ?? 0) + 1
  }

  // Golpe do grupo num alvo: dano (mais forte com o fortalecimento da Ressurreição e no crítico, pela Agilidade de
  // quem bate), pisca branco, número, partículas e empurrão. Bater num inimigo deixa o grupo em combate
  // (no boneco de treino, não: dá para treinar e pausar).
  acertar(alvo, dano, origem, forcaDoEmpurrao, autor = null) {
    if (alvo.morto) return
    const agora = this.agora
    const fortalecido = autor?.fortalecido ? dano * (1 + combateDeTeste.habilidades.sacerdote.bonusDeDano) : dano
    const golpe = rolarCritico(fortalecido, autor?.chanceDeCritico ?? 0, critico.multiplicador)
    const { vida, danoFeito } = aplicarDano(alvo.vida, golpe.dano)
    alvo.vida = vida
    alvo.piscar()
    const numero = String(alvo.mostraDanoCheio ? Math.round(golpe.dano) : danoFeito)
    if (golpe.critico) {
      numeroFlutuante(this, alvo.x, alvo.y - alvo.tamanho * 0.6, `CRÍTICO ${numero}`, coresDaArena.critico, 26)
      if (autor?.lider) this.mensagem(`Crítico! ${numero} de dano`, 'critico')
    } else {
      numeroFlutuante(this, alvo.x, alvo.y - alvo.tamanho * 0.6, numero)
    }
    particulas(this, alvo.x, alvo.y, alvo.cor, golpe.critico ? 14 : 8, golpe.critico ? 280 : 220)
    if (forcaDoEmpurrao > 0) alvo.empurrar(vetorDeEmpurrao(origem, alvo, forcaDoEmpurrao), 160)
    alvo.aoApanhar?.(agora)
    if (alvo instanceof Inimigo) {
      this.ultimoDano = agora
      if (vida <= 0) this.derrotarInimigo(alvo)
    }
  }

  // Monstro derrotado pelo grupo: o ouro vai para o ouro ganho, e o XP é dividido na hora entre os permanentes de pé
  // (RF50). Quem passar de nível vê o aviso; o nível novo vale a partir da próxima partida (RF12).
  derrotarInimigo(inimigo) {
    const { xp = 0, ouro = 0 } = inimigo.config
    this.ganhos.ouro += ouro
    this.ganhos.monstros += 1
    if (ouro > 0) numeroFlutuante(this, inimigo.x, inimigo.y - inimigo.tamanho * 1.1, `+${ouro} ouro`, coresDaArena.ouro, 20)
    this.matarInimigo(inimigo)
    this.dividirXp(xp)
  }

  // XP de monstro ou de exploração: dividido entre os permanentes de pé (RF50), com o aviso de quem sobe de nível
  dividirXp(xp) {
    const membros = this.grupo.map((membro) => ({
      classe: membro.classe,
      temporario: membro.membro.temporario,
      caido: membro.caido,
      perdido: membro.perdido,
    }))
    this.ganhos.xpPorClasse = somarXpDoAbate(this.ganhos.xpPorClasse, xp, membros, this.lider.classe).xpDaPartida
    this.avisarNiveis()
  }

  // "Subiu de nível" na hora em que o XP da partida passa de um nível (só dos permanentes, que ganham XP)
  avisarNiveis() {
    for (const membro of this.grupo) {
      if (membro.membro.temporario) continue
      const { classe } = membro
      const nivel = nivelComOXpDaPartida({ nivel: membro.membro.nivel, xp: membro.membro.xp ?? 0 }, this.ganhos.xpPorClasse[classe] ?? 0)
      if (nivel <= (this.niveisAvisados[classe] ?? membro.membro.nivel)) continue
      this.niveisAvisados[classe] = nivel
      this.mensagem(`${nomeDaClasse(classe)} subiu para o nível ${nivel}! (vale na próxima partida)`, 'nivel')
      numeroFlutuante(this, membro.x, membro.y - 56, `NÍVEL ${nivel}!`, coresDaArena.nivel, 24)
      particulas(this, membro.x, membro.y, 0xffe14a, 14, 240)
    }
  }

  matarInimigo(inimigo) {
    this.navegador.esquecer(inimigo)
    inimigo.morrer()
    this.inimigos = this.inimigos.filter((outro) => outro !== inimigo)
  }

  // ---------- Golpes no grupo ----------

  // O primeiro do grupo, de pé, que o círculo (tiro) ou o retângulo (bote) toca
  membroAtingido(circulo) {
    return this.membrosDePe.find((membro) => circuloTocaRetangulo(circulo, membro.retangulo()))
  }

  membroTocado(retangulo) {
    return this.membrosDePe.find((membro) => retangulosSeTocam(retangulo, membro.retangulo()))
  }

  // O escudo de algum Tanque no caminho do tiro
  escudoQueBloqueia(circulo) {
    return this.grupo.find((membro) => membro.escudo?.bloqueiaTiro(circulo))?.escudo ?? null
  }

  // Golpe corpo a corpo: o escudo do Tanque bloqueia o que vem da frente
  inimigoAcerta(inimigo, membro, dano, forcaDoEmpurrao) {
    if (membro.escudo?.bloqueiaGolpe(inimigo)) {
      const { x, y } = membro.escudo.retangulo()
      this.mostrarBloqueado(x, y)
      inimigo.empurrar(vetorDeEmpurrao(membro, inimigo, forcaDoEmpurrao), 220)
      return 'bloqueado'
    }
    return this.membroLevaGolpe(membro, dano, inimigo, forcaDoEmpurrao)
  }

  // Quem é do grupo leva o golpe (Líder ou aliado). Não leva quem está caído ou imune depois de apanhar;
  // o Líder também não leva esquivando ou com o Invencível ligado. Frágil leva mais; provocando, menos.
  membroLevaGolpe(membro, dano, origem, forcaDoEmpurrao) {
    const agora = this.agora
    const protegido =
      membro.caido || agora < membro.fimDaImunidade || (membro.lider && (this.invencivel || agora < this.fimDaEsquiva))
    if (protegido) return 'protegido'
    let danoFinal = dano
    if (membro.fragil) danoFinal *= 1 + desmaio.danoExtraFragil
    if (membro.provocando) danoFinal *= 1 - combateDeTeste.habilidades.tanque.reducaoDeDano
    const { vida, danoFeito } = aplicarDano(membro.vida, danoFinal)
    membro.vida = vida
    membro.piscar()
    numeroFlutuante(this, membro.x, membro.y - membro.tamanho * 0.6, `-${danoFeito}`, membro.lider ? coresDaArena.danoNoLider : '#ffc2c2', membro.lider ? 26 : 20)
    particulas(this, membro.x, membro.y, membro.cor, 8, 200)
    membro.empurrar(vetorDeEmpurrao(origem, membro, forcaDoEmpurrao), personagem.msDeEmpurrao)
    membro.fimDaImunidade = agora + personagem.msDeImunidade
    this.ultimoDano = agora
    if (membro.lider) tremerTela(this, 90, 0.004)
    if (vida <= 0) this.desmaiar(membro)
    return 'acertou'
  }

  // Atalho usado pelo roteiro de testes no navegador
  liderLevaGolpe(dano, origem, forcaDoEmpurrao) {
    return this.membroLevaGolpe(this.lider, dano, origem, forcaDoEmpurrao)
  }

  mostrarBloqueado(x, y) {
    numeroFlutuante(this, x, y - 22, 'BLOQUEADO', coresDaArena.bloqueado, 22)
    particulas(this, x, y, 0xffffff, 6, 160)
  }

  // ---------- Desmaio e resgate (TASK-044) ----------

  // Sem vida: desmaia e abre os 30 s. Se era o último de pé, é Derrota na hora.
  desmaiar(membro) {
    membro.cair()
    membro.caidoDesde = this.agora
    this.houveDesmaio = true
    this.navegador.esquecer(membro)
    numeroFlutuante(this, membro.x, membro.y - 50, 'DESMAIOU', coresDaArena.danoNoLider, 24)
    this.mensagem(membro.lider ? 'O Líder desmaiou!' : `${nomeDaClasse(membro.classe)} desmaiou`, 'alerta')
    this.verificarFim()
    this.avisarSituacao()
  }

  // A cada quadro, para cada caído: os 30 s, a ajuda de 5 s (área limpa) e a Pedra de Retorno
  atualizarDesmaios(agora, ms) {
    for (const caido of this.grupo.filter((membro) => membro.caido)) {
      const segundos = segundosRestantes(caido.caidoDesde, agora, prazoParaLevantar)
      if (segundos === 0) {
        if (caido.lider) {
          this.verificarFim()
          return
        }
        this.perder(caido)
        continue
      }
      const limpa = areaLimpa(caido, this.inimigos, desmaio.raioDaAreaLimpa)
      // Com "Aliados ajudam: não" (barra de teste), só o Líder conta como ajudante
      const ajudando = this.grupo.some(
        (membro) =>
          (membro.lider || this.aliadosAjudam) &&
          estaAjudando(membro, caido, { raioDaAjuda: desmaio.raioDaAjuda, velocidadeQuerida: membro.querida }),
      )
      // Só conta o tempo depois do desmaio (o primeiro quadro pode ter começado antes da queda)
      const passou = Math.min(ms, agora - caido.caidoDesde)
      caido.progressoDaAjuda = avancarAjuda(caido.progressoDaAjuda, { temAjudante: ajudando, limpa, ms: passou })
      if (caido.progressoDaAjuda >= msDaAjuda) {
        this.levantar(caido, { vida: vidaAoLevantar(caido.vidaMaxima, vidaAoSerAjudadoPercentual), fimDaFragilidade: agora + desmaio.msDeFragilidade })
        continue
      }
      caido.mostrarDesmaio({ segundos, fracaoDaAjuda: caido.progressoDaAjuda / msDaAjuda, ajudando, limpa })
    }
  }

  // Volta de pé (pela ajuda: pouca vida e frágil; pela Ressurreição: vida cheia, imune e fortalecido)
  levantar(membro, { vida, fimDaFragilidade = 0, fimDaImunidade = 0, fimDoFortalecimento = 0 }) {
    membro.levantar(vida)
    membro.fimDaFragilidade = fimDaFragilidade
    membro.fimDaImunidade = Math.max(membro.fimDaImunidade, fimDaImunidade)
    membro.fimDoFortalecimento = fimDoFortalecimento
    numeroFlutuante(this, membro.x, membro.y - 50, 'DE PÉ!', coresDaArena.numeroDeCura, 24)
    particulas(this, membro.x, membro.y, 0x9dff9d, 12, 220)
    this.mensagem(`${membro.lider ? 'O Líder' : nomeDaClasse(membro.classe)} está de pé`, 'bom')
    this.avisarSituacao()
  }

  // Sem ajuda em 30 s: a Pedra de Retorno leva o personagem ao Reino. Ele vira perdido e sai do mapa,
  // e o lugar onde caiu fica guardado (a taxa de cada perdido sai da distância até o ponto inicial, RF48).
  perder(membro) {
    this.perdidos.push({ classe: membro.classe, x: Math.round(membro.x), y: Math.round(membro.y), noDominioDeBoss: this.noDominioDeBoss(membro) })
    const brilho = this.add.circle(membro.x, membro.y, membro.tamanho, 0x9fd8ff, 0.7).setDepth(camadas.textos - 4)
    this.tweens.add({ targets: brilho, scale: 2.5, alpha: 0, duration: 500, onComplete: () => brilho.destroy() })
    particulas(this, membro.x, membro.y, 0x9fd8ff, 20, 260)
    numeroFlutuante(this, membro.x, membro.y - 50, 'PERDIDO', '#9fd8ff', 24)
    this.mensagem(`${nomeDaClasse(membro.classe)} foi levado pela Pedra de Retorno: perdido`, 'perdido')
    membro.perdido = true
    membro.escudo?.destruir()
    membro.escudo = null
    this.navegador.esquecer(membro)
    this.grupo = this.grupo.filter((outro) => outro !== membro)
    membro.destruir()
    this.verificarFim()
    this.avisarSituacao()
  }

  // Todos caídos → Derrota; Líder caído há 30 s → Retorno forçado (regras/desmaio.js).
  // Vale também durante a fuga: se todos caem antes dos 5 s, é Derrota (RF46).
  verificarFim() {
    const fim = fimPorDesmaio(this.grupo, this.agora, prazoParaLevantar)
    if (fim) this.terminar({ como: fim.como, motivo: fim.motivo })
  }

  // Fim da partida: manda para o React tudo o que as regras da etapa 4 precisam (o React faz as contas e salva).
  // como: 'retornoNormal' (Q), 'fuga' (F), 'liderNaoLevantado' ou 'todosDesmaiaram'. resultado e motivo: só os
  // botões de teste forçam. Posições em px da arena; quem está caído agora conta como perdido (RF48).
  terminar({ como, resultado, motivo }) {
    if (this.terminou) return
    this.terminou = true
    for (const membro of this.grupo) membro.corpo.body?.setVelocity(0, 0)
    for (const inimigo of this.inimigos) inimigo.corpo.body?.setVelocity(0, 0)
    const lugar = (membro) => ({ classe: membro.classe, x: Math.round(membro.x), y: Math.round(membro.y), noDominioDeBoss: this.noDominioDeBoss(membro) })
    this.ponte.avisar('fimDaPartida', {
      como,
      resultado,
      motivo,
      houveDesmaio: this.houveDesmaio,
      perdidos: [...this.perdidos],
      caidosNoFim: this.grupo.filter((membro) => membro.caido).map(lugar),
      lider: lugar(this.lider),
      // A taxa conta do ponto inicial do bioma até a borda do mapa (RF48)
      inicio: { ...this.mapa.inicio },
      distanciaAteABorda: this.mapa.distanciaAteABorda,
      ouroGanho: this.ganhos.ouro,
      monstros: this.ganhos.monstros,
      recursos: 0, // a coleta entra na etapa 6
      xpPorClasse: { ...this.ganhos.xpPorClasse },
      // O mapa descoberto (Fase 3): entra no save no fim, em qualquer resultado (RF50)
      descobertas: this.exploracao && {
        bioma: this.mapa.id,
        nevoa: codificarNevoa(this.exploracao.nevoa.bits),
        areas: [...this.exploracao.conhecidas],
        areasNovas: [...this.exploracao.novas],
        regioes: [...this.exploracao.regioes],
        xpDeExploracao: this.exploracao.xp,
      },
      segundosAtivos: Math.floor(this.msAtivos / 1000),
      segundosTotais: Math.floor(this.agora / 1000),
    })
  }

  // ---------- Em combate, retorno com Q e fuga com F (TASK-040, TASK-041) ----------

  // A cada quadro: em combate (dano nos últimos 5 s ou mob perseguindo), tempo ativo e as contagens do Q e da fuga
  atualizarAndamento(agora, ms) {
    const perseguidores = this.inimigos.filter((inimigo) => !inimigo.morto && inimigo.perseguindo).length
    this.emCombate = estaEmCombate({ agora, ultimoDano: this.ultimoDano, perseguidores }, msDeCombate)
    this.msAtivos = somarTempoAtivo(this.msAtivos, { agora, ultimoDano: this.ultimoDano, ms }, msDeCombate)

    // Retorno normal: em combate volta a 15 s e espera; fora dele, corre
    const antes = this.retorno
    const retorno = avancarRetorno(this.retorno, { emCombate: this.emCombate, ms }, msDoRetorno)
    this.retorno = retorno.retorno
    if (antes && !antes.interrompido && this.retorno?.interrompido) this.mensagem('Em combate: o retorno voltou a 15 s', 'alerta')
    this.avisarAndamento()
    if (retorno.terminou) {
      this.terminar({ como: 'retornoNormal' })
      return
    }

    // Fuga: corre até em combate; se o Líder cair, continua (o fim por desmaio vem antes, em atualizarDesmaios)
    const fuga = avancarFuga(this.fuga, ms)
    this.fuga = fuga.fuga
    if (fuga.terminou) this.terminar({ como: 'fuga' })
  }

  // O React precisa saber na hora (não 8 vezes por segundo) quando o grupo entra ou sai de combate: o Esc depende disso
  avisarAndamento() {
    const andamento = { emCombate: this.emCombate, retornando: Boolean(this.retorno), fugindo: Boolean(this.fuga) }
    const chave = JSON.stringify(andamento)
    if (chave === this.andamentoAvisado) return
    this.andamentoAvisado = chave
    this.ponte.avisar('andamento', andamento)
  }

  // Tecla Q: começa a contagem de 15 s fora de combate; Q de novo cancela (RF45).
  // "soComecar" (Voltar ao Reino da pausa): nunca cancela uma contagem que já está correndo.
  alternarRetorno(soComecar = false) {
    if (soComecar && this.retorno) return
    const { retorno, aviso } = alternarRetorno(this.retorno, { emCombate: this.emCombate, fugindo: Boolean(this.fuga) }, msDoRetorno)
    this.retorno = retorno
    if (aviso === 'cancelado') this.mensagem('Retorno ao Reino cancelado', 'aviso')
    if (aviso === 'emCombate') this.mensagem('Em combate: não dá para voltar ao Reino agora', 'alerta')
    this.avisarAndamento()
  }

  // Fuga confirmada (o segundo F): 5 s, mesmo em combate. Uma por partida; o retorno com Q para (RF46).
  fugir() {
    if (this.fuga) return
    this.fuga = comecarFuga(this.fuga, msDaFuga)
    this.retorno = null
    this.mensagem('A Pedra de Retorno vai levar o grupo ao Reino', 'alerta')
    particulas(this, this.lider.x, this.lider.y, 0x9fd8ff, 16, 240)
    this.avisarAndamento()
  }

  // Mensagem curta no HUD (crítico, nível, desmaio, perdido, retorno...). O React mostra e tira depois de 2,5 s.
  mensagem(texto, tipo = 'aviso') {
    this.ponte.avisar('mensagem', { texto, tipo })
  }

  // Quem vai ajudar quem (o Sacerdote primeiro; o Líder caído primeiro), para a IA dos aliados.
  // Com "Aliados ajudam: não" na barra de teste, ninguém vai (para ver os 30 s inteiros).
  tarefasDeAjuda(dePe) {
    const caidos = this.grupo.filter((membro) => membro.caido)
    if (caidos.length === 0 || !this.aliadosAjudam) return new Map()
    const pares = escolherAjudantes(
      caidos.map((caido) => ({ id: caido, x: caido.x, y: caido.y, lider: caido.lider, caidoDesde: caido.caidoDesde })),
      dePe.map((aliado) => ({ id: aliado, x: aliado.x, y: aliado.y, classe: aliado.classe })),
    )
    return new Map(pares.map(({ ajudante, caido }) => [ajudante, caido]))
  }

  // ---------- Barra de teste (comandos do React) ----------

  executarComando(comando) {
    if (this.terminou) return
    // Teclas e pedidos do jogo (não são de teste): Q, Voltar ao Reino da pausa e a fuga confirmada
    if (comando.tipo === 'alternarRetorno') this.alternarRetorno()
    if (comando.tipo === 'comecarRetorno') this.alternarRetorno(true)
    if (comando.tipo === 'fugir') this.fugir()
    // Barra de teste: só no npm run dev (no jogo publicado a faixa mostra só as teclas e nenhum comando de teste vale)
    if (import.meta.env.DEV) this.comandoDeTeste(comando)
    if (this.terminou) return
    this.avisarSituacao()
  }

  comandoDeTeste(comando) {
    if (comando.tipo === 'forcarFim') this.forcarFim(comando.resultado)
    if (comando.tipo === 'testarFoco') this.testarFoco()
    // Mexem no que a partida ganhou (que só vai para o save no fim, pelo caminho normal)
    if (comando.tipo === 'subirNivel') this.subirNivelDeTeste()
    if (comando.tipo === 'ganharOuro') this.ganhos.ouro += testes.ouroDoBotao
    if (comando.tipo === 'trocarClasse') this.trocarClasse(comando.classe)
    if (comando.tipo === 'encherGrupo') this.encherGrupo()
    if (comando.tipo === 'criarInimigo') this.criarInimigoLonge(comando.inimigo)
    if (comando.tipo === 'juntarTodos') this.juntarTodos()
    if (comando.tipo === 'recarregarHabilidades') this.recarregarHabilidades()
    if (comando.tipo === 'alternarInvencivel') this.invencivel = !this.invencivel
    if (comando.tipo === 'derrubarAliado') this.derrubar(this.aliados.find((aliado) => !aliado.caido))
    if (comando.tipo === 'derrubarLider') this.derrubar(this.lider)
    if (comando.tipo === 'alternarAjuda') this.aliadosAjudam = !this.aliadosAjudam
    if (comando.tipo === 'trocarIA') this.trocarIA(comando.nivel)
  }

  // Os 4 botões de resultado: acabam a partida já, com os números reais dela e o resultado pedido
  // (a taxa segue o jeito de cada um: Grande Vitória e Vitória pelos perdidos, Retorno forçado como fuga,
  // Derrota como todos desmaiam)
  forcarFim(resultado) {
    const como = comoPeloResultado[resultado]
    this.terminar({ como, resultado, motivo: `${motivosDoFim[como]} (botão de teste)` })
  }

  // Botão "Subir nível" (só no npm run dev): cada permanente de pé ganha, na partida, o XP que falta para o próximo
  // nível. O aviso aparece na hora, e o nível novo vai para o save no fim, como o XP de um monstro.
  subirNivelDeTeste() {
    for (const membro of this.grupo) {
      if (membro.membro.temporario || membro.caido) continue
      const ganho = this.ganhos.xpPorClasse[membro.classe] ?? 0
      const falta = xpParaOProximoNivel({ nivel: membro.membro.nivel, xp: membro.membro.xp ?? 0 }, ganho)
      this.ganhos.xpPorClasse = { ...this.ganhos.xpPorClasse, [membro.classe]: ganho + falta }
    }
    this.avisarNiveis()
  }

  // Situação de teste do momento de foco (pendência da 5b.1): IA avançada para todos, grupo cheio, Líder com 25% da
  // vida (presa assim por 20 s, para a cura do Sacerdote não acabar com o foco) e Invencível, e 3 mobs perto.
  // A barra de teste mostra quantas decisões os aliados tomaram em foco e quantas foram erradas.
  testarFoco() {
    const { foco } = testes
    if (this.lider.caido) return
    this.trocarIA('avancada')
    this.encherGrupo()
    this.invencivel = true
    this.vidaPresaAte = this.agora + foco.msPreso
    this.lider.vida = Math.max(1, Math.floor(this.lider.vidaMaxima * foco.vidaDoLider))
    this.contagemDoFoco = { decisoes: 0, erros: 0 }
    for (let i = 0; i < foco.mobs; i++) {
      const angulo = ((i - (foco.mobs - 1) / 2) * Math.PI) / 5
      const ponto = { x: this.lider.x + Math.cos(angulo) * foco.distancia, y: this.lider.y + Math.sin(angulo) * foco.distancia }
      const inimigo = this.criarInimigo('mobVermelho', ponto)
      particulas(this, inimigo.x, inimigo.y, inimigo.cor, 12, 200)
    }
    this.mensagem('Teste do foco: IA avançada, Líder com 25% da vida por 20 s', 'aviso')
  }

  // Durante o teste do foco, a vida do Líder não passa de 25%
  prenderVidaDoTesteDoFoco(agora) {
    if (agora >= this.vidaPresaAte || this.lider.caido) return
    this.lider.vida = Math.min(this.lider.vida, Math.max(1, Math.floor(this.lider.vidaMaxima * testes.foco.vidaDoLider)))
  }

  // Seletor da barra de teste: pelo nível de cada um → básica → média → avançada → pelo nível...
  // (ou direto num nível, quando o comando diz qual)
  trocarIA(nivel) {
    const opcoes = [null, ...idsDosNiveisDaIA]
    this.iaForcada = nivel !== undefined ? nivel : opcoes[(opcoes.indexOf(this.iaForcada) + 1) % opcoes.length]
    for (const aliado of this.aliados) {
      aliado.ia.proximaDecisao = 0
      aliado.ia.parado = false
    }
  }

  // Teste do desmaio: tira toda a vida de quem está de pé (passa por cima do Invencível)
  derrubar(membro) {
    if (!membro || membro.caido) return
    membro.vida = 0
    membro.piscar()
    this.desmaiar(membro)
  }

  // O Líder continua sendo o mesmo quadrado; se um aliado já era da classe nova, ele fica com a antiga.
  // Ninguém muda de lugar, então ninguém fica em cima de ninguém.
  trocarClasse(classe) {
    const lider = this.lider
    if (lider.caido || lider.classe === classe) return
    const classeAntiga = lider.classe
    const novos = trocarClasseDoLider(
      this.grupo.map((membro) => membro.membro),
      classe,
    )
    for (const aliado of this.aliados) {
      if (aliado.classe === classe) aliado.definirMembro(novos.find((membro) => !membro.lider && membro.classe === classeAntiga))
    }
    lider.definirMembro(novos.find((membro) => membro.lider))
    this.prepararEscudos()
    particulas(this, lider.x, lider.y, lider.cor, 12, 200)
  }

  // Um aliado de cada classe que falta, só na memória da partida (o save não muda).
  // Cada um nasce num lugar livre perto da vaga dele em volta do Líder.
  encherGrupo() {
    const faltam = classesQueFaltam([...this.grupo.map((membro) => membro.membro), ...this.perdidos])
    const total = this.aliados.length + faltam.length
    for (const classe of faltam) {
      const vaga = vagaNaFormacao(this.aliados.length, total, raioDaFormacao)
      const lugar = this.lugarLivre(personagem.tamanho, { x: this.lider.x + vaga.x, y: this.lider.y + vaga.y })
      const novo = new Personagem(this, membroDeTeste(classe), lugar.x, lugar.y)
      this.corposDoGrupo.add(novo.corpo)
      this.grupo.push(novo)
      particulas(this, novo.x, novo.y, novo.cor, 10, 180)
    }
    this.prepararEscudos()
  }

  // Teste da separação: põe os aliados e os inimigos no mesmo ponto do Líder.
  // A zona em volta de cada um afasta todos aos poucos.
  juntarTodos() {
    const ponto = { x: this.lider.x, y: this.lider.y }
    const separandoAte = this.agora + 2000
    this.lider.separandoAte = separandoAte
    for (const entidade of [...this.aliados, ...this.inimigos]) {
      entidade.colocarEm(ponto.x, ponto.y)
      entidade.separandoAte = separandoAte
      this.navegador.esquecer(entidade)
    }
    particulas(this, ponto.x, ponto.y, 0xffffff, 14, 220)
  }

  // Teste das habilidades: mana cheia e nenhuma recarga para todo o grupo (a Ressurreição demora 3 min)
  recarregarHabilidades() {
    for (const membro of this.grupo) {
      membro.mana = membro.manaMaxima
      membro.ultimoUsoDaHabilidade = [null, null, null]
      particulas(this, membro.x, membro.y, 0x5ab4ff, 8, 160)
    }
  }

  // Aparece no ponto de surgimento mais longe do Líder
  criarInimigoLonge(tipo) {
    const distancia = (ponto) => Math.hypot(ponto.x - this.lider.x, ponto.y - this.lider.y)
    // Na Floresta, num ponto a ~600 px do Líder, na direção da mira (fica na tela)
    const pontos = this.mapa.pontosDeSurgimento ?? [
      { x: this.lider.x + Math.cos(this.anguloDaMira) * 600, y: this.lider.y + Math.sin(this.anguloDaMira) * 600 },
    ]
    const ponto = pontos.reduce((maisLonge, outro) => (distancia(outro) > distancia(maisLonge) ? outro : maisLonge))
    const inimigo = this.criarInimigo(tipo, ponto)
    particulas(this, inimigo.x, inimigo.y, inimigo.cor, 12, 200)
  }

  definirPausa(pausado) {
    if (pausado) this.scene.pause()
    else this.scene.resume()
  }

  avisarSituacao() {
    if (this.terminou) return
    const agora = this.agora
    const lider = this.lider
    const recargaDe = (membro, indice) => {
      const habilidade = membro.habilidades[indice]
      if (!habilidade) return null
      return {
        nome: habilidade.nome,
        custo: habilidade.custoDeMana,
        recarga: fracaoDaRecarga(agora, membro.ultimoUsoDaHabilidade[indice], habilidade.recargaMs),
        semMana: membro.mana < habilidade.custoDeMana,
      }
    }
    this.ponte.avisar('situacao', {
      classe: lider.classe,
      vida: lider.vida,
      vidaMaxima: lider.vidaMaxima,
      mana: Math.floor(lider.mana),
      manaMaxima: lider.manaMaxima,
      caido: lider.caido,
      segundosParaLevantar: lider.caido ? segundosRestantes(lider.caidoDesde, agora, prazoParaLevantar) : null,
      recargaDoAtaque: fracaoDaRecarga(agora, lider.ultimoAtaque, ataques[lider.classe].recargaMs),
      recargaDaEsquiva: fracaoDaRecarga(agora, this.ultimaEsquiva, esquiva.recargaMs),
      habilidades: lider.habilidades.map((_, indice) => recargaDe(lider, indice)),
      aliados: this.aliados.map((aliado) => ({
        classe: aliado.classe,
        vida: aliado.vida,
        vidaMaxima: aliado.vidaMaxima,
        caido: aliado.caido,
        segundosParaLevantar: aliado.caido ? segundosRestantes(aliado.caidoDesde, agora, prazoParaLevantar) : null,
        fragil: aliado.fragil,
        ia: this.perfilDaIA(aliado).id,
      })),
      perdidos: this.perdidos.map((perdido) => perdido.classe),
      houveDesmaio: this.houveDesmaio,
      invencivel: this.invencivel,
      aliadosAjudam: this.aliadosAjudam,
      iaForcada: this.iaForcada,
      // O foco só existe na IA avançada: o HUD mostra "Foco!" quando algum aliado de pé está nela
      emFoco: this.focoAte > agora && this.aliados.some((aliado) => !aliado.caido && this.perfilDaIA(aliado).id === 'avancada'),
      contagemDoFoco: { ...this.contagemDoFoco },
      // Andamento e números da partida (5c)
      tempo: Math.floor(agora / 1000),
      pontuacao: pontuacaoBase({ monstros: this.ganhos.monstros, ouroGanho: this.ganhos.ouro, segundosAtivos: Math.floor(this.msAtivos / 1000) }),
      ouroGanho: this.ganhos.ouro,
      monstros: this.ganhos.monstros,
      custoDaFuga: custoDaFuga(
        { lider, inicio: this.mapa.inicio, ouroGanho: this.ganhos.ouro, noDominioDeBoss: this.noDominioDeBoss(lider) },
        this.mapa.distanciaAteABorda,
      ),
      minimapa: this.situacaoDoMinimapa(),
      // A região atual (HUD, RF53)
      regiao: this.mapa.comCamera
        ? { nome: this.regiaoDoLider?.nome ?? '—', dificuldade: this.regiaoDoLider?.dificuldade ?? null, dominioDeBoss: Boolean(this.regiaoDoLider?.dominioDeBoss) }
        : { nome: this.mapa.nome, dificuldade: null, dominioDeBoss: false },
      emCombate: this.emCombate,
      retorno: this.retorno && { segundos: segundosDaContagem(this.retorno.msRestantes), interrompido: this.retorno.interrompido },
      fuga: this.fuga && { segundos: segundosDaContagem(this.fuga.msRestantes) },
      fps: Math.round(this.game.loop.actualFps),
      tamanhoDoGrupo: this.grupo.length,
      inimigos: this.inimigos.length,
    })
  }
}
