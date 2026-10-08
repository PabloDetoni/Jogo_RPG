// Regras de movimento da partida (ajustes da parte 5a). Funções puras, sem Phaser.
// - separação: ninguém fica em cima de ninguém (cada corpo tem uma zona em volta);
// - escorregar: quem é empurrado contra uma pedra ou a borda vai para o lado, em vez de travar;
// - caminho na grade: a arena vira quadradinhos, e quem anda sozinho acha o caminho em volta das pedras;
// - travamento: percebe quem tenta andar e não sai do lugar, e diz o que fazer;
// - ponto livre: o lugar mais perto onde um corpo cabe (para nascer, reaparecer e destravar).
// Corpos são quadrados: { x, y, raio } com raio = metade do lado. Retângulos: { x, y, largura, altura }, x e y no centro.
import { segmentoCortaRetangulo } from './combate.js'

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const tamanhoDoVetor = (v) => Math.hypot(v.x, v.y)

function limitarVetor(vetor, maximo) {
  const tamanho = tamanhoDoVetor(vetor)
  if (tamanho <= maximo || tamanho === 0) return vetor
  return { x: (vetor.x / tamanho) * maximo, y: (vetor.y / tamanho) * maximo }
}

// Dois retângulos se sobrepõem de verdade (só encostar não conta)
function sobrepoe(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.largura + b.largura && Math.abs(a.y - b.y) * 2 < a.altura + b.altura
}

const quadradoDoCorpo = (corpo, folga = 0) => ({
  x: corpo.x,
  y: corpo.y,
  largura: 2 * (corpo.raio + folga),
  altura: 2 * (corpo.raio + folga),
})

const aumentar = (retangulo, folga) => ({
  ...retangulo,
  largura: retangulo.largura + 2 * folga,
  altura: retangulo.altura + 2 * folga,
})

// O corpo (com a folga) cabe inteiro dentro da área?
function dentroDaArea(corpo, area, folga = 0) {
  const r = corpo.raio + folga
  return (
    corpo.x - r >= area.x - area.largura / 2 &&
    corpo.x + r <= area.x + area.largura / 2 &&
    corpo.y - r >= area.y - area.altura / 2 &&
    corpo.y + r <= area.y + area.altura / 2
  )
}

// ---------- Separação ----------

// corpos: [{ x, y, raio, peso?, fixo? }]. Dois corpos estão perto demais quando a distância entre os centros
// é menor que raioA + raioB + folga. Cada um recebe uma velocidade para longe do outro, que cresce aos poucos
// conforme um entra na zona do outro: só encostando na zona, quase nada; um em cima do outro, a força toda.
// O mais pesado se mexe menos; quem é fixo (caído, boneco) não se mexe e o outro sai sozinho.
// No mesmo ponto exato, cada par se afasta numa direção diferente, então ninguém fica parado em cima de ninguém.
// Devolve uma velocidade { x, y } para cada corpo, na mesma ordem, nunca maior que a força.
export function separacao(corpos, { folga, forca }) {
  const velocidades = corpos.map(() => ({ x: 0, y: 0 }))
  for (let i = 0; i < corpos.length; i++) {
    for (let j = i + 1; j < corpos.length; j++) {
      const a = corpos[i]
      const b = corpos[j]
      if (a.fixo && b.fixo) continue
      const zona = a.raio + b.raio + folga
      const ate = distancia(a, b)
      if (ate >= zona) continue
      let direcao
      if (ate < 0.001) {
        const angulo = (i + 1) * 2.399963 + (j + 1) * 0.618034 * Math.PI
        direcao = { x: Math.cos(angulo), y: Math.sin(angulo) }
      } else {
        direcao = { x: (a.x - b.x) / ate, y: (a.y - b.y) / ate }
      }
      const intensidade = forca * (1 - ate / zona)
      const pesoA = a.peso ?? 1
      const pesoB = b.peso ?? 1
      const parteDeA = b.fixo ? 1 : a.fixo ? 0 : pesoB / (pesoA + pesoB)
      const parteDeB = 1 - parteDeA
      velocidades[i].x += direcao.x * intensidade * parteDeA
      velocidades[i].y += direcao.y * intensidade * parteDeA
      velocidades[j].x -= direcao.x * intensidade * parteDeB
      velocidades[j].y -= direcao.y * intensidade * parteDeB
    }
  }
  return velocidades.map((velocidade) => limitarVetor(velocidade, forca))
}

// ---------- Escorregar ----------

// Se a velocidade empurra o corpo contra uma pedra ou contra a borda, a parte que entra na parede some.
// Se o que sobra para o lado é pouco (empurrão de frente), o corpo escorrega para o lado: na pedra, para a ponta
// mais perto; na borda, para o lado em que já ia (ou para o meio da área). Nos cantos fechados, para.
// O corpo "testa" à frente pelo menos "passo" px, ou o tanto que vai andar no quadro (segundos), se for mais:
// assim, rápido ou com o navegador lento, ele não entra na parede antes de percebê-la.
export function escorregar(velocidade, corpo, paredes, area, passo = 4, segundos = 0) {
  const tamanho = tamanhoDoVetor(velocidade)
  if (tamanho === 0) return velocidade
  const passoX = Math.max(passo, Math.abs(velocidade.x) * segundos + 1)
  const passoY = Math.max(passo, Math.abs(velocidade.y) * segundos + 1)
  const passoDoLado = Math.max(passo, tamanho * 0.9 * segundos + 1)

  // A parede só bloqueia quem vai na direção dela: quem já está um pouco dentro consegue sair
  const bloqueio = (dx, dy) => {
    const movido = { ...corpo, x: corpo.x + dx, y: corpo.y + dy }
    const r = corpo.raio
    const passaDaBorda =
      (dx > 0 && movido.x + r > area.x + area.largura / 2) ||
      (dx < 0 && movido.x - r < area.x - area.largura / 2) ||
      (dy > 0 && movido.y + r > area.y + area.altura / 2) ||
      (dy < 0 && movido.y - r < area.y - area.altura / 2)
    if (passaDaBorda) return { borda: true }
    const vaiNaDirecao = (parede) =>
      !sobrepoe(quadradoDoCorpo(corpo), parede) ||
      (dx !== 0 && Math.sign(parede.x - corpo.x) === Math.sign(dx)) ||
      (dy !== 0 && Math.sign(parede.y - corpo.y) === Math.sign(dy))
    return paredes.find((parede) => sobrepoe(quadradoDoCorpo(movido), parede) && vaiNaDirecao(parede)) ?? null
  }
  const paredeEmX = velocidade.x !== 0 ? bloqueio(Math.sign(velocidade.x) * passoX, 0) : null
  const paredeEmY = velocidade.y !== 0 ? bloqueio(0, Math.sign(velocidade.y) * passoY) : null
  if (!paredeEmX && !paredeEmY) return velocidade

  let { x, y } = velocidade
  if (paredeEmX) x = 0
  if (paredeEmY) y = 0
  if (paredeEmX && paredeEmY) return { x, y }

  // Sobrou pouco para o lado: escorrega com quase toda a velocidade
  const minimo = tamanho * 0.3
  if (paredeEmX && Math.abs(y) < minimo) {
    const sentido = ladoParaEscorregar(paredeEmX, corpo.y, velocidade.y, area.y, 'y')
    if (!bloqueio(0, sentido * passoDoLado)) y = sentido * tamanho * 0.9
  }
  if (paredeEmY && Math.abs(x) < minimo) {
    const sentido = ladoParaEscorregar(paredeEmY, corpo.x, velocidade.x, area.x, 'x')
    if (!bloqueio(sentido * passoDoLado, 0)) x = sentido * tamanho * 0.9
  }
  return { x, y }
}

function ladoParaEscorregar(parede, posicao, velocidadeDoLado, meioDaArea, eixo) {
  if (parede.borda) {
    if (velocidadeDoLado !== 0) return Math.sign(velocidadeDoLado)
    return posicao <= meioDaArea ? 1 : -1
  }
  return posicao < parede[eixo] ? -1 : 1
}

// ---------- Tirar de dentro das pedras ----------

// Quem ficou um pouco dentro de uma pedra (empurrado no aperto) sai pelo lado em que entrou menos; se esse lado
// der em outra pedra ou fora da área, tenta os outros lados. A física sozinha não tira um corpo parado de dentro
// da pedra (ela o considera "enterrado"). corpos: [{ x, y, raio }]. Devolve as posições novas { x, y }.
export function tirarDasParedes(corpos, paredes, area) {
  return corpos.map((corpo) => {
    let posicao = { x: corpo.x, y: corpo.y }
    for (let volta = 0; volta < 3; volta++) {
      const parede = paredes.find((outra) => sobrepoe(quadradoDoCorpo({ ...corpo, ...posicao }), outra))
      if (!parede) break
      const meioX = corpo.raio + parede.largura / 2
      const meioY = corpo.raio + parede.altura / 2
      const saidas = [
        { x: parede.x - meioX, y: posicao.y },
        { x: parede.x + meioX, y: posicao.y },
        { x: posicao.x, y: parede.y - meioY },
        { x: posicao.x, y: parede.y + meioY },
      ].sort((a, b) => distancia(a, posicao) - distancia(b, posicao))
      const livre = saidas.find(
        (saida) =>
          dentroDaArea({ ...corpo, ...saida }, area) && !paredes.some((outra) => sobrepoe(quadradoDoCorpo({ ...corpo, ...saida }), outra)),
      )
      if (!livre) break
      posicao = livre
    }
    return posicao
  })
}

// ---------- Desfazer sobreposições ----------

// Depois da física, desfaz o que ainda ficou um dentro do outro (o aperto entre corpos e pedras): cada par
// sobreposto é afastado pelo tanto que entrou, no eixo em que entrou menos. Quem sai:
// - nunca alguém fixo (caído), e nunca para dentro de uma pedra ou para fora da área;
// - se só um dos dois sairia para cima de um terceiro, sai o outro (assim uma fila contra a pedra se desfaz).
// Quem tem "ignorar" (no bolo do "Juntar todos", deslizando) fica de fora. Algumas voltas, porque desfazer
// um par pode encostar em outro. corpos: [{ x, y, raio, fixo?, ignorar? }]. Devolve as posições novas { x, y }.
export function desfazerSobreposicoes(corpos, paredes, area, voltas = 3) {
  const posicoes = corpos.map((corpo) => ({ x: corpo.x, y: corpo.y }))
  // O que impede o corpo i de ir para (x, y): 'parede', 'corpo' (um terceiro, que não é o par) ou null
  const impedimento = (i, x, y, par) => {
    const corpo = { x, y, raio: corpos[i].raio }
    if (!dentroDaArea(corpo, area) || paredes.some((parede) => sobrepoe(quadradoDoCorpo(corpo), parede))) return 'parede'
    const outro = corpos.some((terceiro, k) => {
      if (k === i || k === par || terceiro.ignorar) return false
      const p = posicoes[k]
      const meio = corpos[i].raio + terceiro.raio - 0.5
      return Math.abs(p.x - x) < meio && Math.abs(p.y - y) < meio
    })
    return outro ? 'corpo' : null
  }
  for (let volta = 0; volta < voltas; volta++) {
    let mexeu = false
    for (let i = 0; i < corpos.length; i++) {
      for (let j = i + 1; j < corpos.length; j++) {
        const a = corpos[i]
        const b = corpos[j]
        if (a.ignorar || b.ignorar || (a.fixo && b.fixo)) continue
        const pa = posicoes[i]
        const pb = posicoes[j]
        const entrouX = a.raio + b.raio - Math.abs(pa.x - pb.x)
        const entrouY = a.raio + b.raio - Math.abs(pa.y - pb.y)
        if (entrouX <= 0.5 || entrouY <= 0.5) continue
        // Tenta primeiro o eixo em que entraram menos; se ali os dois estão contra uma parede, tenta o outro
        const eixos = entrouX <= entrouY ? ['x', 'y'] : ['y', 'x']
        for (const eixo of eixos) {
          const quanto = eixo === 'x' ? entrouX : entrouY
          const sentido = Math.sign(pa[eixo] - pb[eixo]) || (i % 2 === 0 ? 1 : -1)
          const moverA = (d) => ({ ...pa, [eixo]: pa[eixo] + sentido * d })
          const moverB = (d) => ({ ...pb, [eixo]: pb[eixo] - sentido * d })
          const comoA = a.fixo ? 'parede' : impedimento(i, moverA(quanto / 2).x, moverA(quanto / 2).y, j)
          const comoB = b.fixo ? 'parede' : impedimento(j, moverB(quanto / 2).x, moverB(quanto / 2).y, i)
          // Quem sai: quem tem o caminho mais livre (parede pesa mais que outro corpo); empatado, metade cada.
          // Nunca para dentro de uma parede: se só um pode, ele sai todo; se nenhum pode, tenta o outro eixo.
          const peso = { parede: 2, corpo: 1, null: 0 }
          let parteDeA = 0.5
          if (peso[comoA] > peso[comoB]) parteDeA = 0
          if (peso[comoB] > peso[comoA]) parteDeA = 1
          if (comoA === 'parede' && comoB === 'parede') continue
          if (parteDeA === 1 && impedimento(i, moverA(quanto).x, moverA(quanto).y, j) === 'parede') continue
          if (parteDeA === 0 && impedimento(j, moverB(quanto).x, moverB(quanto).y, i) === 'parede') continue
          posicoes[i] = moverA(quanto * parteDeA)
          posicoes[j] = moverB(quanto * (1 - parteDeA))
          mexeu = true
          break
        }
      }
    }
    if (!mexeu) break
  }
  return posicoes
}

// ---------- Caminho na grade ----------

// A área vira quadradinhos de "celula" pixels. Um quadradinho é livre se um corpo com raio "folga" cabe nele,
// centrado, sem encostar em nenhuma parede nem na borda. Paredes são as coisas que não andam (pedras, boneco).
export function criarGrade(area, paredes, { celula, folga }) {
  const esquerda = area.x - area.largura / 2
  const topo = area.y - area.altura / 2
  const colunas = Math.floor(area.largura / celula)
  const linhas = Math.floor(area.altura / celula)
  const livre = new Uint8Array(colunas * linhas)
  const grossas = paredes.map((parede) => aumentar(parede, folga))
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const centro = { x: esquerda + (c + 0.5) * celula, y: topo + (l + 0.5) * celula, raio: folga }
      const cabe = dentroDaArea(centro, area) && !grossas.some((parede) => pontoDentro(centro, parede))
      livre[l * colunas + c] = cabe ? 1 : 0
    }
  }
  return { colunas, linhas, celula, esquerda, topo, livre, paredes, folga }
}

function pontoDentro(ponto, retangulo) {
  return Math.abs(ponto.x - retangulo.x) * 2 < retangulo.largura && Math.abs(ponto.y - retangulo.y) * 2 < retangulo.altura
}

export function celulaDoPonto(grade, ponto) {
  const c = Math.min(grade.colunas - 1, Math.max(0, Math.floor((ponto.x - grade.esquerda) / grade.celula)))
  const l = Math.min(grade.linhas - 1, Math.max(0, Math.floor((ponto.y - grade.topo) / grade.celula)))
  return { c, l }
}

export function centroDaCelula(grade, { c, l }) {
  return { x: grade.esquerda + (c + 0.5) * grade.celula, y: grade.topo + (l + 0.5) * grade.celula }
}

const celulaLivre = (grade, c, l) => c >= 0 && l >= 0 && c < grade.colunas && l < grade.linhas && grade.livre[l * grade.colunas + c] === 1

// Quadradinho livre mais perto (busca em largura). Serve quando o ponto cai colado numa pedra.
function celulaLivreMaisPerto(grade, inicio) {
  if (celulaLivre(grade, inicio.c, inicio.l)) return inicio
  const vistos = new Uint8Array(grade.colunas * grade.linhas)
  const fila = [inicio]
  vistos[inicio.l * grade.colunas + inicio.c] = 1
  for (let i = 0; i < fila.length; i++) {
    const { c, l } = fila[i]
    for (const [dc, dl] of vizinhosRetos) {
      const nc = c + dc
      const nl = l + dl
      if (nc < 0 || nl < 0 || nc >= grade.colunas || nl >= grade.linhas || vistos[nl * grade.colunas + nc]) continue
      if (celulaLivre(grade, nc, nl)) return { c: nc, l: nl }
      vistos[nl * grade.colunas + nc] = 1
      fila.push({ c: nc, l: nl })
    }
  }
  return null
}

const vizinhosRetos = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const vizinhosDiagonais = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

// A linha reta de a até b passa longe (folga) de todas as paredes?
export function linhaLivre(a, b, paredes, folga) {
  return !paredes.some((parede) => segmentoCortaRetangulo(a, b, aumentar(parede, folga)))
}

// Caminho mais curto pela grade (A*), andando reto ou na diagonal (sem cortar quina de pedra).
// Devolve os pontos a percorrer, já encurtados: só os cantos onde é preciso virar, terminando no fim.
// Sem caminho possível, devolve [].
export function caminhoNaGrade(grade, inicio, fim) {
  const de = celulaLivreMaisPerto(grade, celulaDoPonto(grade, inicio))
  const ate = celulaLivreMaisPerto(grade, celulaDoPonto(grade, fim))
  if (!de || !ate) return []
  const total = grade.colunas * grade.linhas
  const indice = (c, l) => l * grade.colunas + c
  const custo = new Float64Array(total).fill(Infinity)
  const veioDe = new Int32Array(total).fill(-1)
  const fechado = new Uint8Array(total)
  const estimativa = (c, l) => {
    const dc = Math.abs(c - ate.c)
    const dl = Math.abs(l - ate.l)
    return Math.max(dc, dl) + (Math.SQRT2 - 1) * Math.min(dc, dl)
  }
  const fila = new FilaDePrioridade()
  const comeco = indice(de.c, de.l)
  custo[comeco] = 0
  fila.colocar(comeco, estimativa(de.c, de.l))
  const objetivo = indice(ate.c, ate.l)

  while (fila.tamanho > 0) {
    const atual = fila.tirar()
    if (fechado[atual]) continue
    if (atual === objetivo) break
    fechado[atual] = 1
    const c = atual % grade.colunas
    const l = Math.floor(atual / grade.colunas)
    for (const [dc, dl] of [...vizinhosRetos, ...vizinhosDiagonais]) {
      const nc = c + dc
      const nl = l + dl
      if (!celulaLivre(grade, nc, nl)) continue
      // Na diagonal, os dois vizinhos retos precisam estar livres (não corta a quina da pedra)
      if (dc !== 0 && dl !== 0 && (!celulaLivre(grade, c + dc, l) || !celulaLivre(grade, c, l + dl))) continue
      const vizinho = indice(nc, nl)
      const novoCusto = custo[atual] + (dc !== 0 && dl !== 0 ? Math.SQRT2 : 1)
      if (novoCusto < custo[vizinho]) {
        custo[vizinho] = novoCusto
        veioDe[vizinho] = atual
        fila.colocar(vizinho, novoCusto + estimativa(nc, nl))
      }
    }
  }
  if (objetivo !== comeco && veioDe[objetivo] === -1) return []

  const celulas = []
  for (let atual = objetivo; atual !== comeco; atual = veioDe[atual]) {
    celulas.push(centroDaCelula(grade, { c: atual % grade.colunas, l: Math.floor(atual / grade.colunas) }))
  }
  celulas.reverse()
  // O último ponto é o fim de verdade, se ele estiver num lugar livre; senão, o centro do quadradinho livre
  const fimLivre = celulaLivre(grade, celulaDoPonto(grade, fim).c, celulaDoPonto(grade, fim).l)
  if (fimLivre && celulas.length > 0) celulas[celulas.length - 1] = { x: fim.x, y: fim.y }
  if (celulas.length === 0) celulas.push(fimLivre ? { x: fim.x, y: fim.y } : centroDaCelula(grade, ate))
  return encurtarCaminho(inicio, celulas, grade.paredes, grade.folga)
}

// Tira os pontos do meio quando dá para ir direto (linha livre) até um ponto mais à frente
export function encurtarCaminho(inicio, pontos, paredes, folga) {
  const resultado = []
  let de = inicio
  let i = 0
  while (i < pontos.length) {
    let maisLonge = i
    for (let j = pontos.length - 1; j > i; j--) {
      if (linhaLivre(de, pontos[j], paredes, folga - 1)) {
        maisLonge = j
        break
      }
    }
    resultado.push(pontos[maisLonge])
    de = pontos[maisLonge]
    i = maisLonge + 1
  }
  return resultado
}

// Fila de prioridade pequena (heap binário) para o A*
class FilaDePrioridade {
  constructor() {
    this.itens = []
    this.prioridades = []
  }

  get tamanho() {
    return this.itens.length
  }

  colocar(item, prioridade) {
    this.itens.push(item)
    this.prioridades.push(prioridade)
    let i = this.itens.length - 1
    while (i > 0) {
      const pai = (i - 1) >> 1
      if (this.prioridades[pai] <= this.prioridades[i]) break
      this.trocar(i, pai)
      i = pai
    }
  }

  tirar() {
    const primeiro = this.itens[0]
    const ultimoItem = this.itens.pop()
    const ultimaPrioridade = this.prioridades.pop()
    if (this.itens.length > 0) {
      this.itens[0] = ultimoItem
      this.prioridades[0] = ultimaPrioridade
      let i = 0
      for (;;) {
        const esquerda = 2 * i + 1
        const direita = esquerda + 1
        let menor = i
        if (esquerda < this.itens.length && this.prioridades[esquerda] < this.prioridades[menor]) menor = esquerda
        if (direita < this.itens.length && this.prioridades[direita] < this.prioridades[menor]) menor = direita
        if (menor === i) break
        this.trocar(i, menor)
        i = menor
      }
    }
    return primeiro
  }

  trocar(a, b) {
    ;[this.itens[a], this.itens[b]] = [this.itens[b], this.itens[a]]
    ;[this.prioridades[a], this.prioridades[b]] = [this.prioridades[b], this.prioridades[a]]
  }
}

// ---------- Travamento ----------

// Acompanha quem anda sozinho. Em cada janela de tempo, compara quanto andou com quanto queria andar.
// Se andou menos que a fração mínima, o nível de travamento sobe; se andou bem, volta a 0.
// Quem não está tentando andar (abaixo da velocidade mínima, por exemplo freando ao chegar) também volta a 0.
// registro: { inicio, origem, esperado, nivel } (null no começo). Devolve o registro novo.
export function acompanharTravamento(
  registro,
  { agora, segundos, posicao, velocidadeQuerida },
  { msDaJanela, fracaoMinima, velocidadeMinima = 10 },
) {
  const querida = tamanhoDoVetor(velocidadeQuerida)
  if (!registro || querida < velocidadeMinima) return { inicio: agora, origem: { ...posicao }, esperado: 0, nivel: 0 }
  const esperado = registro.esperado + querida * segundos
  if (agora - registro.inicio < msDaJanela) return { ...registro, esperado }
  const andou = distancia(registro.origem, posicao)
  const nivel = andou < esperado * fracaoMinima ? registro.nivel + 1 : 0
  return { inicio: agora, origem: { ...posicao }, esperado: 0, nivel }
}

// O que fazer em cada nível de travamento:
// 1 e 2: escorregar para o lado (um lado e depois o outro), 3: dar a volta (um desvio maior),
// a partir de nivelDoPontoLivre: ir para o ponto livre mais próximo.
// Devolve { tipo, direcao } com a direção (vetor de tamanho 1) para escorregar ou dar a volta.
export function manobraParaDestravar(nivel, velocidadeQuerida, nivelDoPontoLivre) {
  if (nivel <= 0) return { tipo: 'nenhuma' }
  if (nivel >= nivelDoPontoLivre) return { tipo: 'pontoLivre' }
  const tamanho = tamanhoDoVetor(velocidadeQuerida) || 1
  const frente = { x: velocidadeQuerida.x / tamanho, y: velocidadeQuerida.y / tamanho }
  const lado = nivel % 2 === 1 ? 1 : -1
  const perpendicular = { x: -frente.y * lado, y: frente.x * lado }
  if (nivel < 3) return { tipo: 'escorregar', direcao: perpendicular }
  // Dar a volta: mais para o lado do que para a frente
  const volta = { x: perpendicular.x * 0.85 + frente.x * 0.5, y: perpendicular.y * 0.85 + frente.y * 0.5 }
  const tamanhoDaVolta = tamanhoDoVetor(volta)
  return { tipo: 'darAVolta', direcao: { x: volta.x / tamanhoDaVolta, y: volta.y / tamanhoDaVolta } }
}

// ---------- Ponto livre ----------

// O corpo (raio) cabe aqui? Dentro da área, sem encostar numa parede nem em outro corpo (com a folga).
export function lugarLivre(ponto, { area, paredes, ocupados = [], raio, folga = 0 }) {
  const corpo = { x: ponto.x, y: ponto.y, raio }
  if (!dentroDaArea(corpo, area, folga)) return false
  const quadrado = quadradoDoCorpo(corpo, folga)
  if (paredes.some((parede) => sobrepoe(quadrado, parede))) return false
  return !ocupados.some((outro) => sobrepoe(quadrado, quadradoDoCorpo(outro)))
}

// O lugar livre mais perto do ponto: testa o próprio ponto e depois anéis cada vez maiores em volta dele.
// Devolve { x, y } ou null se não houver lugar até o alcance máximo.
export function pontoLivreMaisProximo(ponto, { area, paredes, ocupados = [], raio, folga = 0, passo = 8, alcanceMaximo = 800 }) {
  const regras = { area, paredes, ocupados, raio, folga }
  if (lugarLivre(ponto, regras)) return { x: ponto.x, y: ponto.y }
  for (let anel = passo; anel <= alcanceMaximo; anel += passo) {
    const pontos = Math.max(8, Math.round((2 * Math.PI * anel) / passo))
    let melhor = null
    for (let i = 0; i < pontos; i++) {
      const angulo = (2 * Math.PI * i) / pontos
      const candidato = { x: ponto.x + Math.cos(angulo) * anel, y: ponto.y + Math.sin(angulo) * anel }
      if (lugarLivre(candidato, regras)) {
        melhor = candidato
        break
      }
    }
    if (melhor) return melhor
  }
  return null
}

// Desvio de quem está parado no caminho (pedido do Pablo de 08/10: a IA de nível mais alto não é atrapalhada pela de
// nível mais baixo). Olhando até "alcance" px à frente, na reta de "de" até "para": se um corpo parado (círculo
// { x, y, raio }) corta essa reta, devolve um ponto ao lado dele, a "folga" px das bordas dos dois, do lado em que a reta
// já passa (bem no meio: à esquerda de quem anda). Corpo em cima do destino não conta (é para lá que se vai).
// raio: o de quem anda. null = caminho livre.
export function pontoDeDesvio(de, para, corpos, { raio, alcance, folga }) {
  const dx = para.x - de.x
  const dy = para.y - de.y
  const comprimento = Math.hypot(dx, dy)
  if (comprimento < 1) return null
  const frente = { x: dx / comprimento, y: dy / comprimento }
  const esquerda = { x: -frente.y, y: frente.x }
  let primeiro = null
  for (const corpo of corpos) {
    const encostam = raio + corpo.raio
    if (Math.hypot(para.x - corpo.x, para.y - corpo.y) <= encostam) continue
    const rx = corpo.x - de.x
    const ry = corpo.y - de.y
    const adiante = rx * frente.x + ry * frente.y
    const lateral = rx * esquerda.x + ry * esquerda.y
    if (adiante <= 0 || adiante > Math.min(alcance, comprimento) + corpo.raio || Math.abs(lateral) >= encostam) continue
    if (!primeiro || adiante < primeiro.adiante) primeiro = { corpo, adiante, lateral }
  }
  if (!primeiro) return null
  const { corpo, lateral } = primeiro
  const lado = lateral > 0 ? -1 : 1 // o corpo está à esquerda da reta: passa pela direita
  const afastar = raio + corpo.raio + folga
  return { x: corpo.x + esquerda.x * lado * afastar, y: corpo.y + esquerda.y * lado * afastar }
}
