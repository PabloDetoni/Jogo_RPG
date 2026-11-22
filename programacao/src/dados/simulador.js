// Números do MODELO do simulador de balanceamento (RF62, Parte 3 de 11/2026; regras/simulador.js). PROVISÓRIO.
// Não mudam o jogo: só dizem como o simulador imagina a luta.
export const simulador = {
  // Passo de tempo e o máximo de uma luta (ms)
  passoMs: 50,
  msMaximoDaLuta: 180000,
  // Os mobs só batem depois de chegar (ms), um pouco espalhados
  msAteOPrimeiroGolpe: 800,
  // O grupo também só bate quando os mobs chegam perto (ms; o tiro e a bola chegam um pouco antes do corpo a corpo)
  msAteOPrimeiroAtaqueDoGrupo: 600,
  // Quantos alvos cada clique pega de uma vez (a espada em arco, a explosão da bola, o empurrão do escudo)
  alvosPorGolpe: { guerreiro: 2, mago: 3, tanque: 2 },
  // A parte dos golpes corpo a corpo que vem de frente para o Tanque (o escudo só segura esses)
  fracaoDosGolpesDeFrente: 0.5,
  // Dos 5 espinhos do Boss, quantos acertam em média
  espinhosQueAcertam: 2,
  // Bando padrão (a luta do relatório) e o maior bando testado
  bandoPadrao: 3,
  bandoMaximo: 12,
  // Andar até o próximo bando (s), para o XP e o ouro por minuto
  segundosAndandoEntreBandos: 12,
  // Como os pontos de atributo de cada nível são distribuídos (pesos), por classe
  distribuicao: {
    guerreiro: { forca: 0.45, vitalidade: 0.35, agilidade: 0.2 },
    mago: { inteligencia: 0.5, vitalidade: 0.3, sabedoria: 0.2 },
    tanque: { vitalidade: 0.5, forca: 0.5 },
    sacerdote: { sabedoria: 0.5, vitalidade: 0.35, inteligencia: 0.15 },
    arqueiro: { agilidade: 0.4, forca: 0.4, vitalidade: 0.2 },
  },
}
