import * as Phaser from 'phaser'
import {
  boneco as lugarDoBoneco,
  coresDaArena,
  inicio,
  inimigosIniciais,
  manchas,
  pedras,
  pontosDeSurgimento,
  tamanhoDaArena,
} from '../../dados/arenaDeTeste.js'
import { combateDeTeste } from '../../dados/balanceamento.js'
import {
  aplicarDano,
  circuloTocaRetangulo,
  desvioDePedras,
  fracaoDaRecarga,
  podeUsar,
  vagaNaFormacao,
  velocidadeDoMovimento,
  velocidadeParaSeguir,
  vetorDeEmpurrao,
} from '../../regras/combate.js'
import { classesQueFaltam, membroDeTeste, trocarClasseDoLider } from '../../regras/grupoDaPartida.js'
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

const { personagem, esquiva, ataques, raioDaFormacao, msAteADerrota } = combateDeTeste
const { largura, altura } = tamanhoDaArena
const tiposDeInimigo = { mobVermelho: MobVermelho, atirador: Atirador }

// A arena de teste da Fase 1, parte 5a (TASK-004 e TASK-042).
// Recebe da tela de Partida a ponte (src/jogo/ponte.js) e o grupo (regras/grupoDaPartida.js).
export default class CenaArena extends Phaser.Scene {
  constructor() {
    super('arena')
  }

  init({ ponte, grupo }) {
    this.ponte = ponte
    this.grupoInicial = grupo
  }

  create() {
    criarTexturas(this)
    this.physics.world.setBounds(0, 0, largura, altura)
    this.desenharChao()

    // Grupos de física: quem bate em quem
    this.obstaculos = this.physics.add.staticGroup()
    this.corposDoGrupo = this.physics.add.group({ collideWorldBounds: true })
    this.corposDosInimigos = this.physics.add.group({ collideWorldBounds: true })
    this.criarPedras()
    this.boneco = new BonecoDeTreino(this, lugarDoBoneco.x, lugarDoBoneco.y)
    this.obstaculos.add(this.boneco.corpo)
    // O que ninguém atravessa, para quem anda desviar (aliados e inimigos)
    this.retangulosDosObstaculos = [...pedras, this.boneco.retangulo()]

    this.grupo = [] // Líder e aliados (Personagem); o Líder é this.lider
    this.inimigos = []
    this.projeteis = [] // flechas, bolas mágicas, auras e tiros: tudo que tem atualizar() e destruir()
    this.escudo = null
    this.invencivel = false
    this.anguloDaMira = 0
    this.ultimoAtaque = {} // por classe: trocar de classe na barra de teste não herda a recarga da outra
    this.ultimaEsquiva = null
    this.fimDaEsquiva = 0
    this.fimDaImunidade = 0
    this.ultimoRastro = 0

    this.grupoInicial.forEach((membro, indice) => this.adicionarAoGrupo(membro, indice, this.grupoInicial.length))
    for (const inimigo of inimigosIniciais) this.criarInimigo(inimigo.tipo, inimigo)
    this.prepararAtaqueDaClasse()

    this.physics.add.collider(this.corposDoGrupo, this.obstaculos)
    this.physics.add.collider(this.corposDosInimigos, this.obstaculos)
    this.physics.add.collider(this.corposDosInimigos, this.corposDosInimigos)
    // Aliados não se empilham; o Líder passa entre eles sem ser travado
    this.physics.add.collider(this.corposDoGrupo, this.corposDoGrupo, null, (a, b) => !a.entidade.lider && !b.entidade.lider)

    // Teclado (só existe enquanto a Partida está aberta) e mouse. Espaço não rola a página.
    this.teclas = this.input.keyboard.addKeys({ cima: 'W', baixo: 'S', esquerda: 'A', direita: 'D', esquiva: 'SPACE' })
    this.input.on('pointerdown', (ponteiro) => {
      if (ponteiro.leftButtonDown()) this.atacar()
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

  desenharChao() {
    for (const mancha of manchas) {
      this.add.ellipse(mancha.x, mancha.y, mancha.largura, mancha.altura, coresDaArena.mancha).setDepth(camadas.manchas)
    }
    this.add.rectangle(largura / 2, altura / 2, largura - 8, altura - 8).setStrokeStyle(8, coresDaArena.borda).setDepth(camadas.borda)
  }

  criarPedras() {
    for (const pedra of pedras) {
      this.add.rectangle(pedra.x + 6, pedra.y + 8, pedra.largura, pedra.altura, coresDaArena.sombra, 0.22).setDepth(camadas.sombras)
      this.add
        .rectangle(pedra.x, pedra.y, pedra.largura, pedra.altura, coresDaArena.pedra)
        .setStrokeStyle(2, coresDaArena.contorno)
        .setDepth(pedra.y)
      this.add.rectangle(pedra.x, pedra.y - pedra.altura / 2 + 7, pedra.largura - 12, 6, 0xffffff, 0.25).setDepth(pedra.y + 1)
      this.obstaculos.add(this.add.zone(pedra.x, pedra.y, pedra.largura, pedra.altura))
    }
  }

  adicionarAoGrupo(membro, indice, total) {
    const vaga = membro.lider ? { x: 0, y: 0 } : vagaNaFormacao(indice - 1, Math.max(1, total - 1), raioDaFormacao)
    const novo = new Personagem(this, membro, inicio.x + vaga.x, inicio.y + vaga.y)
    this.corposDoGrupo.add(novo.corpo)
    this.grupo.push(novo)
    if (membro.lider) this.lider = novo
    return novo
  }

  criarInimigo(tipo, ponto) {
    const inimigo = new tiposDeInimigo[tipo](this, ponto.x, ponto.y)
    this.corposDosInimigos.add(inimigo.corpo)
    this.inimigos.push(inimigo)
    return inimigo
  }

  // O escudo só existe com o Tanque de Líder
  prepararAtaqueDaClasse() {
    if (this.lider.classe === 'tanque' && !this.escudo) this.escudo = new Escudo(this, this.lider)
    if (this.lider.classe !== 'tanque' && this.escudo) {
      this.escudo.destruir()
      this.escudo = null
    }
  }

  get aliados() {
    return this.grupo.filter((membro) => !membro.lider)
  }

  // ---------- A cada quadro ----------

  update(tempo, delta) {
    const agora = this.time.now
    const segundos = Math.min(delta, 50) / 1000
    const lider = this.lider

    if (!lider.caido) {
      const ponteiro = this.input.activePointer
      this.anguloDaMira = Math.atan2(ponteiro.worldY - lider.y, ponteiro.worldX - lider.x)
    }
    lider.atualizarMira(this.anguloDaMira)
    this.atualizarLider(agora)
    this.atualizarAliados()
    for (const inimigo of [...this.inimigos]) inimigo.atualizar(agora)
    this.boneco.atualizar(agora)

    this.projeteis = this.projeteis.filter((projetil) => {
      const continua = projetil.atualizar(agora, segundos)
      if (!continua) projetil.destruir()
      return continua
    })
    this.escudo?.atualizar(this.anguloDaMira)

    for (const entidade of [...this.grupo, ...this.inimigos, this.boneco]) entidade.atualizarDesenho(agora, delta)
    // Pisca enquanto está imune depois de apanhar
    const imune = !lider.caido && agora < this.fimDaImunidade
    lider.visual.setAlpha(lider.caido ? 0.7 : imune && Math.floor(agora / 60) % 2 ? 0.35 : 1)
  }

  atualizarLider(agora) {
    const lider = this.lider
    const corpo = lider.corpo.body
    if (lider.caido) {
      corpo.setVelocity(0, 0)
      return
    }
    const dx = (this.teclas.direita.isDown ? 1 : 0) - (this.teclas.esquerda.isDown ? 1 : 0)
    const dy = (this.teclas.baixo.isDown ? 1 : 0) - (this.teclas.cima.isDown ? 1 : 0)
    if (Phaser.Input.Keyboard.JustDown(this.teclas.esquiva)) this.esquivar(agora, dx, dy)

    if (agora < this.fimDaEsquiva) {
      corpo.setVelocity(this.velocidadeDaEsquiva.x, this.velocidadeDaEsquiva.y)
      if (agora - this.ultimoRastro > 35) {
        this.ultimoRastro = agora
        rastro(this, lider.x, lider.y, lider.tamanho, lider.cor)
      }
      return
    }
    if (lider.estaSendoEmpurrado(agora)) return
    const velocidade = velocidadeDoMovimento(dx, dy, personagem.velocidade)
    corpo.setVelocity(velocidade.x, velocidade.y)
  }

  // Esquiva: avanço curto na direção do movimento (parado: na direção da mira), sem levar dano
  esquivar(agora, dx, dy) {
    if (!podeUsar(agora, this.ultimaEsquiva, esquiva.recargaMs)) return
    const direcao = dx || dy ? { x: dx, y: dy } : { x: Math.cos(this.anguloDaMira), y: Math.sin(this.anguloDaMira) }
    this.velocidadeDaEsquiva = velocidadeDoMovimento(direcao.x, direcao.y, esquiva.distancia / (esquiva.ms / 1000))
    this.ultimaEsquiva = agora
    this.fimDaEsquiva = agora + esquiva.ms
    const deitado = Math.abs(this.velocidadeDaEsquiva.x) >= Math.abs(this.velocidadeDaEsquiva.y)
    this.lider.deformar(deitado ? 1.4 : 0.7, deitado ? 0.7 : 1.4, 60, 160)
    particulas(this, this.lider.x, this.lider.y + 16, 0xe8f5d0, 6, 120)
  }

  // Os aliados vão para as vagas em volta do Líder (formação solta), contornando as pedras
  atualizarAliados() {
    const aliados = this.aliados
    aliados.forEach((aliado, indice) => {
      const vaga = vagaNaFormacao(indice, aliados.length, raioDaFormacao)
      const alvo = { x: this.lider.x + vaga.x, y: this.lider.y + vaga.y }
      const destino = desvioDePedras(aliado, alvo, this.retangulosDosObstaculos, aliado.tamanho / 2 - 2)
      // Só freia na vaga; nos cantos das pedras passa direto
      const velocidade = velocidadeParaSeguir(aliado, destino, personagem.velocidade * 1.15, destino === alvo ? 60 : 1)
      aliado.corpo.body.setVelocity(velocidade.x, velocidade.y)
    })
  }

  // ---------- Ataques do Líder ----------

  atacar() {
    const lider = this.lider
    if (lider.caido) return
    const agora = this.time.now
    if (!podeUsar(agora, this.ultimoAtaque[lider.classe] ?? null, ataques[lider.classe].recargaMs)) return
    this.ultimoAtaque[lider.classe] = agora
    const angulo = this.anguloDaMira
    if (lider.classe === 'guerreiro') golpeDeEspada(this, lider, angulo)
    if (lider.classe === 'arqueiro') this.adicionarProjetil(new Flecha(this, lider, angulo))
    if (lider.classe === 'mago') this.adicionarProjetil(new BolaMagica(this, lider, angulo))
    if (lider.classe === 'sacerdote') this.adicionarProjetil(new Aura(this, lider, agora))
    if (lider.classe === 'tanque') this.escudo.empurrar()
  }

  adicionarProjetil(projetil) {
    this.projeteis.push(projetil)
  }

  // Quem os ataques do Líder acertam: os inimigos vivos e o boneco
  alvosDoJogador() {
    return [...this.inimigos.filter((inimigo) => !inimigo.morto), this.boneco]
  }

  alvoAtingido(circulo) {
    return this.alvosDoJogador().find((alvo) => circuloTocaRetangulo(circulo, alvo.retangulo()))
  }

  bateEmObstaculo(circulo) {
    const fora = circulo.x < circulo.raio || circulo.y < circulo.raio || circulo.x > largura - circulo.raio || circulo.y > altura - circulo.raio
    return fora || pedras.some((pedra) => circuloTocaRetangulo(circulo, pedra))
  }

  // Golpe do jogador num alvo: dano, pisca branco, número, partículas e empurrão
  acertar(alvo, dano, origem, forcaDoEmpurrao) {
    if (alvo.morto) return
    const agora = this.time.now
    const { vida, danoFeito } = aplicarDano(alvo.vida, dano)
    alvo.vida = vida
    alvo.piscar()
    numeroFlutuante(this, alvo.x, alvo.y - alvo.tamanho * 0.6, String(alvo.mostraDanoCheio ? Math.round(dano) : danoFeito))
    particulas(this, alvo.x, alvo.y, alvo.cor, 8, 220)
    if (forcaDoEmpurrao > 0) alvo.empurrar(vetorDeEmpurrao(origem, alvo, forcaDoEmpurrao), 160)
    alvo.aoApanhar?.(agora)
    if (vida <= 0 && alvo instanceof Inimigo) this.matarInimigo(alvo)
  }

  matarInimigo(inimigo) {
    inimigo.morrer()
    this.inimigos = this.inimigos.filter((outro) => outro !== inimigo)
  }

  // ---------- Golpes no Líder ----------

  // Golpe corpo a corpo: o escudo do Tanque bloqueia o que vem da frente
  inimigoAcertaLider(inimigo, dano, forcaDoEmpurrao) {
    if (this.escudo?.bloqueiaGolpe(inimigo)) {
      const { x, y } = this.escudo.retangulo()
      this.mostrarBloqueado(x, y)
      inimigo.empurrar(vetorDeEmpurrao(this.lider, inimigo, forcaDoEmpurrao), 220)
      return 'bloqueado'
    }
    return this.liderLevaGolpe(dano, inimigo, forcaDoEmpurrao)
  }

  // Esquivando, imune depois de apanhar ou com o Invencível ligado, o Líder não leva dano
  liderLevaGolpe(dano, origem, forcaDoEmpurrao) {
    const lider = this.lider
    const agora = this.time.now
    const protegido = lider.caido || this.invencivel || agora < this.fimDaEsquiva || agora < this.fimDaImunidade
    if (protegido) return 'protegido'
    const { vida, danoFeito } = aplicarDano(lider.vida, dano)
    lider.vida = vida
    lider.piscar()
    numeroFlutuante(this, lider.x, lider.y - lider.tamanho * 0.6, `-${danoFeito}`, coresDaArena.danoNoLider)
    particulas(this, lider.x, lider.y, lider.cor, 8, 200)
    lider.empurrar(vetorDeEmpurrao(origem, lider, forcaDoEmpurrao), personagem.msDeEmpurrao)
    this.fimDaImunidade = agora + personagem.msDeImunidade
    tremerTela(this, 90, 0.004)
    if (vida <= 0) this.liderCaiu()
    return 'acertou'
  }

  mostrarBloqueado(x, y) {
    numeroFlutuante(this, x, y - 22, 'BLOQUEADO', coresDaArena.bloqueado, 22)
    particulas(this, x, y, 0xffffff, 6, 160)
  }

  // Provisório até a TASK-044: sem vida, o Líder cai e, depois de 2 s, a partida termina em Derrota
  liderCaiu() {
    this.lider.cair()
    numeroFlutuante(this, this.lider.x, this.lider.y - 50, 'DESMAIOU', coresDaArena.danoNoLider, 26)
    this.avisarSituacao()
    this.time.delayedCall(msAteADerrota, () => this.ponte.avisar('liderCaiu'))
  }

  // ---------- Barra de teste (comandos do React) ----------

  executarComando(comando) {
    if (comando.tipo === 'trocarClasse') this.trocarClasse(comando.classe)
    if (comando.tipo === 'encherGrupo') this.encherGrupo()
    if (comando.tipo === 'criarInimigo') this.criarInimigoLonge(comando.inimigo)
    if (comando.tipo === 'alternarInvencivel') this.invencivel = !this.invencivel
    this.avisarSituacao()
  }

  // O Líder continua sendo o mesmo quadrado; se um aliado já era da classe nova, ele fica com a antiga
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
    this.prepararAtaqueDaClasse()
    particulas(this, lider.x, lider.y, lider.cor, 12, 200)
  }

  // Um aliado de cada classe que falta, só na memória da partida (o save não muda)
  encherGrupo() {
    const faltam = classesQueFaltam(this.grupo.map((membro) => membro.membro))
    for (const classe of faltam) {
      const angulo = Math.random() * Math.PI * 2
      const lugar = { x: this.lider.x + Math.cos(angulo) * 30, y: this.lider.y + Math.sin(angulo) * 30 }
      const livre = !this.bateEmObstaculo({ ...lugar, raio: personagem.tamanho / 2 })
      const novo = new Personagem(this, membroDeTeste(classe), livre ? lugar.x : this.lider.x, livre ? lugar.y : this.lider.y)
      this.corposDoGrupo.add(novo.corpo)
      this.grupo.push(novo)
      particulas(this, novo.x, novo.y, novo.cor, 10, 180)
    }
  }

  // Aparece no ponto de surgimento mais longe do Líder
  criarInimigoLonge(tipo) {
    const distancia = (ponto) => Math.hypot(ponto.x - this.lider.x, ponto.y - this.lider.y)
    const ponto = pontosDeSurgimento.reduce((maisLonge, outro) => (distancia(outro) > distancia(maisLonge) ? outro : maisLonge))
    const inimigo = this.criarInimigo(tipo, ponto)
    particulas(this, ponto.x, ponto.y, inimigo.cor, 12, 200)
  }

  definirPausa(pausado) {
    if (pausado) this.scene.pause()
    else this.scene.resume()
  }

  avisarSituacao() {
    const agora = this.time.now
    const lider = this.lider
    this.ponte.avisar('situacao', {
      classe: lider.classe,
      vida: lider.vida,
      vidaMaxima: lider.vidaMaxima,
      caido: lider.caido,
      recargaDoAtaque: fracaoDaRecarga(agora, this.ultimoAtaque[lider.classe] ?? null, ataques[lider.classe].recargaMs),
      recargaDaEsquiva: fracaoDaRecarga(agora, this.ultimaEsquiva, esquiva.recargaMs),
      invencivel: this.invencivel,
      fps: Math.round(this.game.loop.actualFps),
      tamanhoDoGrupo: this.grupo.length,
      inimigos: this.inimigos.length,
    })
  }
}
