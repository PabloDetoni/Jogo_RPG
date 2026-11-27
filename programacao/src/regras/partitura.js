// PARTITURA (Parte 13, 27/11/2026): as músicas do jogo são feitas em código (dados/musicas.js) e tocadas pela Web Audio
// API (audio/sintetizador.js). Esta regra pura lê a partitura e devolve a lista de notas com o tempo de cada uma, em
// segundos; o sintetizador só toca o que ela diz.
//
// Como uma música é escrita (dados/musicas.js):
// - bpm (batidas por minuto) e compasso (batidas por compasso; todas as músicas são em 4);
// - secoes: cada seção tem os acordes (um por compasso; "Gm A" = dois acordes, meia barra cada) e a melodia, com os
//   compassos separados por "|" e cada nota como "A4:1.5" (lá da 4ª oitava, uma batida e meia; sem ":", 1 batida;
//   "-" é pausa);
// - forma: a ordem das seções ("a", "b", "a"...);
// - padroes: o baixo, o arpejo e o acorde, repetidos em todo compasso pelo acorde da hora: cada nota é
//   [batida, duração, grau], grau 0 = a fundamental, 1 = a terça, 2 = a quinta, 3 a 5 = as mesmas uma oitava acima;
// - bateria: linhas de passos de 1/4 de batida (16 por compasso): k bumbo, s caixa, h chimbal, t tambor, "." nada; cada
//   linha se repete pelo próprio tamanho (uma linha de 32 passos cobre dois compassos);
// - instrumentos: qual instrumento toca a melodia, o baixo, o arpejo e o acorde (dados/sons.js, instrumentos).

const NOTAS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const TIPOS_DE_ACORDE = { '': [0, 4, 7], m: [0, 3, 7], '°': [0, 3, 6] }
export const PERCUSSAO = { k: 'bumbo', s: 'caixa', h: 'chimbal', t: 'tambor' }
export const PASSOS_POR_BATIDA = 4

// "A4" → 69 (o número MIDI da nota); nome que não é nota → null
export function midiDaNota(nome) {
  const achado = /^([A-G])([#b]?)(\d)$/.exec(nome)
  if (!achado) return null
  const [, letra, acidente, oitava] = achado
  return 12 * (Number(oitava) + 1) + NOTAS[letra] + (acidente === '#' ? 1 : acidente === 'b' ? -1 : 0)
}

export const hzDoMidi = (midi) => 440 * 2 ** ((midi - 69) / 12)

// "Dm" → { raiz: 2, intervalos: [0, 3, 7] }; "Bb" → maior; "B°" → diminuto. Nome que não é acorde → null
export function acordeDoNome(nome) {
  const achado = /^([A-G])([#b]?)(m|°)?$/.exec(nome)
  if (!achado) return null
  const [, letra, acidente, tipo = ''] = achado
  const raiz = (NOTAS[letra] + (acidente === '#' ? 1 : acidente === 'b' ? -1 : 0) + 12) % 12
  return { raiz, intervalos: TIPOS_DE_ACORDE[tipo] }
}

// A nota de um grau do acorde (0 a 5) com a fundamental na oitava pedida, em número MIDI
export function notaDoAcorde(acorde, grau, oitava) {
  const [, terca, quinta] = acorde.intervalos
  const deslocamento = [0, terca, quinta, 12, 12 + terca, 12 + quinta][grau]
  if (deslocamento === undefined) return null
  return 12 * (oitava + 1) + acorde.raiz + deslocamento
}

// "A4:1 G4:.5 -:.5 | D5:4" → [[{ midi: 69, batidas: 1 }, { midi: 67, batidas: 0.5 }, { midi: null, batidas: 0.5 }], [...]]
export function lerMelodia(texto) {
  if (!texto) return []
  return texto.split('|').map((compasso) =>
    compasso
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((ficha) => {
        const [nome, duracao] = ficha.split(':')
        const batidas = duracao === undefined ? 1 : Number(duracao)
        return { midi: nome === '-' ? null : midiDaNota(nome), batidas, nome }
      }),
  )
}

// Um compasso de acordes ("Gm A") → [{ acorde, inicio, batidas }], cada acorde com a mesma parte do compasso
export function lerCompassoDeAcordes(texto, batidasPorCompasso) {
  const nomes = texto.trim().split(/\s+/)
  const batidas = batidasPorCompasso / nomes.length
  return nomes.map((nome, i) => ({ nome, acorde: acordeDoNome(nome), inicio: i * batidas, batidas }))
}

// Os compassos da música, na ordem da forma: [{ secao, acordes, melodia }]
export function compassosDaMusica(musica) {
  const lista = []
  for (const id of musica.forma) {
    const secao = musica.secoes[id]
    const melodia = lerMelodia(secao.melodia)
    secao.acordes.forEach((acordes, i) => lista.push({ secao: id, acordes: lerCompassoDeAcordes(acordes, musica.compasso), melodia: melodia[i] ?? [] }))
  }
  return lista
}

export const segundosPorBatida = (musica) => 60 / musica.bpm

// Quanto a música dura, em segundos (uma volta, para as que repetem)
export function duracaoDaMusica(musica) {
  const compassos = musica.forma.reduce((soma, id) => soma + musica.secoes[id].acordes.length, 0)
  return compassos * musica.compasso * segundosPorBatida(musica)
}

// Todas as notas da música, em ordem de tempo: { t, dur, instrumento, hz } (a percussão sem hz). t e dur em segundos.
export function eventosDaMusica(musica) {
  const batida = segundosPorBatida(musica)
  const eventos = []
  const compassos = compassosDaMusica(musica)
  const passosPorCompasso = musica.compasso * PASSOS_POR_BATIDA
  compassos.forEach((compasso, n) => {
    const inicio = n * musica.compasso * batida
    const secao = musica.secoes[compasso.secao]
    // a melodia
    let andou = 0
    for (const nota of compasso.melodia) {
      if (nota.midi !== null) eventos.push({ t: inicio + andou * batida, dur: nota.batidas * batida, instrumento: musica.instrumentos.melodia, hz: hzDoMidi(nota.midi) })
      andou += nota.batidas
    }
    // o baixo, o arpejo e o acorde, pelo acorde de cada batida
    const padroes = { ...musica.padroes, ...secao.padroes }
    for (const [parte, padrao] of Object.entries(padroes)) {
      if (!padrao || !musica.instrumentos[parte]) continue
      for (const [batidaDaNota, duracao, grau] of padrao.notas) {
        const daHora = compasso.acordes.find((a) => batidaDaNota >= a.inicio && batidaDaNota < a.inicio + a.batidas) ?? compasso.acordes[0]
        const midi = notaDoAcorde(daHora.acorde, grau, padrao.oitava)
        eventos.push({ t: inicio + batidaDaNota * batida, dur: duracao * batida, instrumento: musica.instrumentos[parte], hz: hzDoMidi(midi) })
      }
    }
    // a bateria (a seção pode tirar: bateria null)
    const bateria = secao.bateria === undefined ? musica.bateria : secao.bateria
    for (const linha of bateria ?? []) {
      for (let passo = 0; passo < passosPorCompasso; passo++) {
        const instrumento = PERCUSSAO[linha[(n * passosPorCompasso + passo) % linha.length]]
        if (instrumento) eventos.push({ t: inicio + (passo / PASSOS_POR_BATIDA) * batida, dur: batida / PASSOS_POR_BATIDA, instrumento })
      }
    }
  })
  eventos.sort((a, b) => a.t - b.t)
  return eventos
}

// Os problemas de uma partitura (para os testes): compasso de melodia que não fecha, nota ou acorde que não existe,
// melodia com mais ou menos compassos que os acordes, linha de bateria que não fecha o compasso
export function problemasDaPartitura(musica) {
  const problemas = []
  const passosPorCompasso = musica.compasso * PASSOS_POR_BATIDA
  for (const [id, secao] of Object.entries(musica.secoes)) {
    const melodia = lerMelodia(secao.melodia)
    if (melodia.length !== secao.acordes.length) problemas.push(`seção ${id}: ${melodia.length} compassos de melodia para ${secao.acordes.length} de acordes`)
    melodia.forEach((compasso, i) => {
      const soma = compasso.reduce((total, nota) => total + nota.batidas, 0)
      if (Math.abs(soma - musica.compasso) > 1e-9) problemas.push(`seção ${id}, compasso ${i + 1}: ${soma} batidas`)
      for (const nota of compasso) if (nota.nome !== '-' && nota.midi === null) problemas.push(`seção ${id}, compasso ${i + 1}: nota "${nota.nome}"`)
      for (const nota of compasso) if (!(nota.batidas > 0)) problemas.push(`seção ${id}, compasso ${i + 1}: duração de "${nota.nome}"`)
    })
    for (const compasso of secao.acordes) for (const nome of compasso.trim().split(/\s+/)) if (!acordeDoNome(nome)) problemas.push(`seção ${id}: acorde "${nome}"`)
    for (const linha of (secao.bateria === undefined ? musica.bateria : secao.bateria) ?? []) {
      if (linha.length % passosPorCompasso !== 0) problemas.push(`seção ${id}: linha de bateria com ${linha.length} passos`)
      if (/[^ksht.]/.test(linha)) problemas.push(`seção ${id}: bateria com letra desconhecida`)
    }
  }
  for (const id of musica.forma) if (!musica.secoes[id]) problemas.push(`forma: seção "${id}" não existe`)
  return problemas
}
