// TOQUE (Parte 14, 28/11/2026): as decisões puras do jogo no celular e no tablet. O jogo olha o jeito de apontar
// (o dedo), não o tamanho da tela: com toque aparecem os controles na tela; com mouse e teclado, nada muda.

// Usa os controles de toque? Só quando o jeito principal de apontar é o dedo ("pointer: coarse"). Um notebook com tela
// de toque tem o mouse como principal e continua igual ao computador.
export function usaToque({ ponteiroGrosso }) {
  return Boolean(ponteiroGrosso)
}

// A tela "Gire o celular": com toque e em pé (o jogo é deitado, paisagem)
export function precisaGirar({ toque, emPe }) {
  return Boolean(toque && emPe)
}

// O joystick: o dedo a (dx, dy) do lugar onde encostou, num círculo de raio "raio". Devolve a direção (x, y entre -1
// e 1, tamanho até 1) e a força (de 0 a 1). Perto do meio (a zona morta, uma fração do raio), parado. Longe do meio,
// anda na velocidade de sempre (como o WASD: a força só desenha o botão, não muda a velocidade).
export function vetorDoJoystick({ dx, dy, raio, zonaMorta }) {
  const distancia = Math.hypot(dx, dy)
  if (!(raio > 0) || distancia <= raio * zonaMorta) return { x: 0, y: 0, forca: 0 }
  const forca = Math.min(1, distancia / raio)
  return { x: (dx / distancia) * forca, y: (dy / distancia) * forca, forca }
}

// Onde desenhar o botão do joystick: no máximo na borda do círculo
export function pontaDoJoystick({ dx, dy, raio }) {
  const distancia = Math.hypot(dx, dy)
  if (distancia <= raio || distancia === 0) return { x: dx, y: dy }
  return { x: (dx / distancia) * raio, y: (dy / distancia) * raio }
}

// O inimigo vivo mais perto do Líder até "alcance" (contando o tamanho do corpo dele: a borda é que precisa estar
// perto), ou null. Os mobs que dormem longe e os mortos não contam.
export function inimigoMaisPerto(lider, inimigos, alcance) {
  let melhor = null
  let menor = Infinity
  for (const inimigo of inimigos ?? []) {
    if (!inimigo || inimigo.morto || inimigo.dormindo) continue
    const distancia = Math.hypot(inimigo.x - lider.x, inimigo.y - lider.y) - (inimigo.raio ?? 0)
    if (distancia <= alcance && distancia < menor) {
      menor = distancia
      melhor = inimigo
    }
  }
  return melhor
}

// O ponto a "distancia" do Líder no ângulo dado
export function pontoNaDirecao(lider, angulo, distancia) {
  return { x: lider.x + Math.cos(angulo) * distancia, y: lider.y + Math.sin(angulo) * distancia }
}

// A mira do Líder no toque (não há mouse). Na ordem:
// 1. arrastando a partir do botão (ataque ou habilidade): na direção do arraste;
// 2. o inimigo mais perto dentro do alcance da mira: nele (a mira automática);
// 3. andando: para onde anda; parado: o último ângulo.
// Devolve { angulo, ponto, alvo }: o ponto é onde cai o que precisa de um lugar (o Meteoro), no alvo ou à frente.
export function miraDoToque({ lider, inimigos, alcance, arraste = null, andando = null, anguloAnterior = 0 }) {
  if (Number.isFinite(arraste)) return { angulo: arraste, ponto: pontoNaDirecao(lider, arraste, alcance), alvo: null }
  const alvo = inimigoMaisPerto(lider, inimigos, alcance)
  if (alvo) return { angulo: Math.atan2(alvo.y - lider.y, alvo.x - lider.x), ponto: { x: alvo.x, y: alvo.y }, alvo }
  const angulo = andando && (andando.x || andando.y) ? Math.atan2(andando.y, andando.x) : anguloAnterior
  return { angulo, ponto: pontoNaDirecao(lider, angulo, alcance), alvo: null }
}

// O arraste a partir de um botão (ataque ou habilidade) só vale como mira depois de uma distância (um toque com o dedo
// tremendo continua sendo um toque: mira automática). Devolve o ângulo ou null.
export function anguloDoArraste({ dx, dy, minimo }) {
  return Math.hypot(dx, dy) >= minimo ? Math.atan2(dy, dx) : null
}

// Os textos das dicas no toque: "clique" vira "toque" (as dicas que mudam mais, como as teclas da partida, têm um texto
// próprio do toque em dados/ajuda.js)
export function textoParaOToque(texto) {
  if (typeof texto !== 'string') return texto
  return texto
    .replace(/\bClique\b/g, 'Toque')
    .replace(/\bclique\b/g, 'toque')
    .replace(/\bClicar\b/g, 'Tocar')
    .replace(/\bclicar\b/g, 'tocar')
}

// MODO LEVE (desempenho no celular): liga sozinho quando o FPS fica abaixo do limite por "segundos" seguidos (com a
// opção "automático" das Configurações). amostras: os FPS de cada segundo, do mais velho ao mais novo.
export function deveLigarModoLeve(amostras, { limite, segundos }) {
  if (!Array.isArray(amostras) || amostras.length < segundos) return false
  return amostras.slice(-segundos).every((fps) => fps > 0 && fps < limite)
}

// O modo leve vale agora? Pela opção das Configurações ('automatico', 'ligado' ou 'desligado') e pelo que o automático
// já decidiu nesta partida.
export function modoLeveAtivo({ opcao, ligouSozinho }) {
  if (opcao === 'ligado') return true
  if (opcao === 'desligado') return false
  return Boolean(ligouSozinho)
}
