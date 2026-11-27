// SINTETIZADOR (Parte 13, 27/11/2026): faz a música e os efeitos na hora, pela Web Audio API, sem arquivo e sem
// biblioteca (chiptune: ondas simples, o quadrado fino "pulso25" e ruído). Não sabe nada do jogo: recebe os
// instrumentos (dados/sons.js), as notas já com o tempo (regras/partitura.js) e as receitas dos efeitos. Quem decide o
// que toca e quando é o gerenciador (audio/gerenciador.js).

// A onda quadrada fina do chiptune (25% ligada), pela série de Fourier do pulso
function criarPulso(contexto, largura) {
  const harmonicos = 40
  const real = new Float32Array(harmonicos)
  const imaginario = new Float32Array(harmonicos)
  for (let k = 1; k < harmonicos; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * largura)
  return contexto.createPeriodicWave(real, imaginario)
}

// Um segundo de ruído branco (caixa, chimbal, espada, passos...)
function criarRuido(contexto) {
  const buffer = contexto.createBuffer(1, contexto.sampleRate, contexto.sampleRate)
  const dados = buffer.getChannelData(0)
  for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1
  return buffer
}

const POUCO = 0.0001 // o "zero" das rampas exponenciais (que não chegam a 0)

export function criarSintetizador(contexto, instrumentos) {
  const ruido = criarRuido(contexto)
  let pulso = null
  const darOnda = (oscilador, tipo) => {
    if (tipo === 'pulso25') oscilador.setPeriodicWave((pulso ??= criarPulso(contexto, 0.25)))
    else oscilador.type = tipo
  }
  const fonteDeRuido = (quando, segundos) => {
    const fonte = contexto.createBufferSource()
    fonte.buffer = ruido
    fonte.start(quando, Math.random() * 0.5)
    fonte.stop(quando + segundos + 0.02)
    return fonte
  }
  const desligarNoFim = (fonte, ...nos) => {
    fonte.onended = () => {
      for (const no of nos) no.disconnect()
    }
  }

  // Uma nota de instrumento (melodia, baixo, arpejo, acorde): o volume sobe no ataque, cai até a sustentação e some na
  // soltura; a corda beliscada (sustentação 0) toca até sumir sozinha
  function nota(instrumento, hz, duracao, quando, destino) {
    const fim = instrumento.sustentacao === 0 ? quando + instrumento.ataque + instrumento.decaimento * 1.6 : quando + Math.max(duracao, instrumento.ataque)
    const ate = fim + instrumento.soltura * 2 + 0.05
    const oscilador = contexto.createOscillator()
    darOnda(oscilador, instrumento.onda)
    oscilador.frequency.setValueAtTime(hz, quando)
    const ganho = contexto.createGain()
    const pico = instrumento.volume
    ganho.gain.setValueAtTime(0, quando)
    ganho.gain.linearRampToValueAtTime(pico, quando + instrumento.ataque)
    ganho.gain.setTargetAtTime(pico * instrumento.sustentacao, quando + instrumento.ataque, Math.max(0.01, instrumento.decaimento / 3))
    if (instrumento.sustentacao > 0) ganho.gain.setTargetAtTime(0, fim, Math.max(0.005, instrumento.soltura / 3))
    let saida = oscilador
    if (instrumento.filtro) {
      const filtro = contexto.createBiquadFilter()
      filtro.type = 'lowpass'
      filtro.frequency.value = instrumento.filtro
      oscilador.connect(filtro)
      saida = filtro
    }
    saida.connect(ganho).connect(destino)
    // o vibrato (a flauta) começa um pouco depois da nota
    if (instrumento.vibrato) {
      const lfo = contexto.createOscillator()
      const fundo = contexto.createGain()
      lfo.frequency.value = instrumento.vibrato.hz
      const desvio = hz * (2 ** (instrumento.vibrato.cents / 1200) - 1)
      fundo.gain.setValueAtTime(0, quando)
      fundo.gain.linearRampToValueAtTime(desvio, quando + instrumento.vibrato.atraso + 0.1)
      lfo.connect(fundo).connect(oscilador.frequency)
      lfo.start(quando)
      lfo.stop(ate)
      desligarNoFim(lfo, fundo)
    }
    // o brilho (harpa e sino): a oitava de cima, mais baixa
    if (instrumento.brilho) {
      const harmonico = contexto.createOscillator()
      const ganhoDoHarmonico = contexto.createGain()
      harmonico.frequency.setValueAtTime(hz * 2, quando)
      ganhoDoHarmonico.gain.value = instrumento.brilho
      harmonico.connect(ganhoDoHarmonico).connect(ganho)
      harmonico.start(quando)
      harmonico.stop(ate)
      desligarNoFim(harmonico, ganhoDoHarmonico)
    }
    oscilador.start(quando)
    oscilador.stop(ate)
    desligarNoFim(oscilador, saida, ganho)
  }

  // A bateria: o tom que cai (bumbo e tambor) ou o ruído filtrado (caixa e chimbal)
  function percussao(instrumento, quando, destino) {
    const segundos = instrumento.ms / 1000
    const ganho = contexto.createGain()
    ganho.gain.setValueAtTime(instrumento.volume, quando)
    ganho.gain.exponentialRampToValueAtTime(POUCO, quando + segundos)
    ganho.connect(destino)
    if (instrumento.percussao === 'tom') {
      const oscilador = contexto.createOscillator()
      oscilador.frequency.setValueAtTime(instrumento.de, quando)
      oscilador.frequency.exponentialRampToValueAtTime(instrumento.ate, quando + segundos)
      oscilador.connect(ganho)
      oscilador.start(quando)
      oscilador.stop(quando + segundos + 0.02)
      desligarNoFim(oscilador, ganho)
      return
    }
    const fonte = fonteDeRuido(quando, segundos)
    const filtro = contexto.createBiquadFilter()
    filtro.type = instrumento.filtro.tipo
    filtro.frequency.value = instrumento.filtro.hz
    fonte.connect(filtro).connect(ganho)
    desligarNoFim(fonte, filtro, ganho)
  }

  // Um evento da partitura (nota ou batida)
  function tocarEvento(evento, quando, destino) {
    const instrumento = instrumentos[evento.instrumento]
    if (!instrumento) return
    if (instrumento.percussao) percussao(instrumento, quando, destino)
    else nota(instrumento, evento.hz, evento.dur, quando, destino)
  }

  // Um efeito: as partes da receita tocam juntas (cada uma com o seu atraso)
  function efeito(receita, destino, inicio = contexto.currentTime) {
    for (const parte of receita) {
      const quando = inicio + (parte.atraso ?? 0) / 1000
      const segundos = parte.ms / 1000
      const [de, ate] = parte.hz
      const ganho = contexto.createGain()
      ganho.gain.setValueAtTime(0, quando)
      ganho.gain.linearRampToValueAtTime(parte.volume, quando + 0.004)
      ganho.gain.exponentialRampToValueAtTime(POUCO, quando + segundos)
      ganho.connect(destino)
      if (parte.onda === 'ruido') {
        const fonte = fonteDeRuido(quando, segundos)
        const filtro = contexto.createBiquadFilter()
        filtro.type = parte.filtro ?? 'bandpass'
        filtro.Q.value = 0.9
        filtro.frequency.setValueAtTime(de, quando)
        filtro.frequency.exponentialRampToValueAtTime(ate, quando + segundos)
        fonte.connect(filtro).connect(ganho)
        desligarNoFim(fonte, filtro, ganho)
        continue
      }
      const oscilador = contexto.createOscillator()
      darOnda(oscilador, parte.onda)
      oscilador.frequency.setValueAtTime(de, quando)
      oscilador.frequency.exponentialRampToValueAtTime(ate, quando + segundos)
      let saida = oscilador
      if (parte.filtro) {
        const filtro = contexto.createBiquadFilter()
        filtro.type = parte.filtro
        filtro.frequency.value = 1000
        oscilador.connect(filtro)
        saida = filtro
      }
      saida.connect(ganho)
      oscilador.start(quando)
      oscilador.stop(quando + segundos + 0.02)
      desligarNoFim(oscilador, saida, ganho)
    }
  }

  return { tocarEvento, efeito }
}

// O tocador das músicas: agenda as notas um pouco à frente (segundosAFrente) a cada msDoAgendador, para o tempo ficar
// certo mesmo com o jogo ocupado; cada música tem o seu volume, que entra e sai devagar (a troca de música)
export function criarTocador(contexto, sintetizador, { segundosAFrente, msDoAgendador }) {
  const faixas = new Set()
  let relogio = null
  let notas = 0

  function agendar() {
    const agora = contexto.currentTime
    const horizonte = agora + segundosAFrente
    for (const faixa of faixas) {
      // muito atrasada (a aba ficou parada): pula para a volta de agora, sem despejar as notas perdidas
      if (faixa.laco && agora - (faixa.inicio + faixa.volta * faixa.duracao) > faixa.duracao) {
        faixa.volta = Math.floor((agora - faixa.inicio) / faixa.duracao)
        faixa.indice = 0
      }
      while (!faixa.acabou) {
        const evento = faixa.eventos[faixa.indice]
        const quando = faixa.inicio + faixa.volta * faixa.duracao + evento.t
        if (quando > horizonte) break
        if (quando >= agora - 0.02) {
          sintetizador.tocarEvento(evento, Math.max(quando, agora), faixa.ganho)
          notas++
        }
        faixa.indice++
        if (faixa.indice < faixa.eventos.length) continue
        if (faixa.laco) {
          faixa.indice = 0
          faixa.volta++
        } else faixa.acabou = true
      }
      if (faixa.acabou && !faixa.parando) faixas.delete(faixa)
    }
    if (faixas.size === 0) {
      clearInterval(relogio)
      relogio = null
    }
  }

  // Toca uma música (as notas de regras/partitura.js); devolve { parar(ms) }
  function tocar(eventos, duracao, laco, destino, msDeEntrada = 0) {
    const ganho = contexto.createGain()
    const agora = contexto.currentTime
    ganho.gain.setValueAtTime(0, agora)
    ganho.gain.linearRampToValueAtTime(1, agora + Math.max(0.01, msDeEntrada / 1000))
    ganho.connect(destino)
    const faixa = { eventos, duracao, laco, inicio: agora + 0.08, volta: 0, indice: 0, acabou: eventos.length === 0, parando: false, ganho }
    faixas.add(faixa)
    if (!relogio) relogio = setInterval(agendar, msDoAgendador)
    agendar()
    return {
      parar(ms = 0) {
        if (faixa.parando) return
        faixa.parando = true
        faixa.acabou = true
        const agora = contexto.currentTime
        ganho.gain.cancelScheduledValues(agora)
        ganho.gain.setValueAtTime(ganho.gain.value, agora)
        ganho.gain.linearRampToValueAtTime(0, agora + Math.max(0.01, ms / 1000))
        setTimeout(() => {
          faixas.delete(faixa)
          ganho.disconnect()
        }, ms + 200)
      },
    }
  }

  return { tocar, notasTocadas: () => notas }
}
