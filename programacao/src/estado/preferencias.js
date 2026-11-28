import { ehObjeto } from './validacao.js'

// Preferências de som e tema (RF18). Valem antes do login e ficam salvas à parte do progresso.
// mudo (tecla M, a qualquer momento): silencia música e som sem mudar a escolha de cada um.
// dicasVistas (ajustes de 14/10): as telas cuja dica da primeira visita já foi fechada neste navegador.
// telaCheia (ajustes de 14/10): entrar em tela cheia nos cliques de Iniciar jogo, Jogar e Começar partida.
// animacoesDoCenario (20/10): o moinho, a fumaça, a água, a lava e a neve do Reino e do Mapa (o "reduzir movimento" do sistema
// também desliga, regras/cenario.js).
// modoLeve (Parte 14): 'automatico' (no celular, liga sozinho com o jogo lento; no computador nunca), 'ligado' ou
// 'desligado'. Menos partículas e desenho só perto da câmera.
export const modosLeves = ['automatico', 'ligado', 'desligado']
export const preferenciasPadrao = { musica: true, som: true, mudo: false, tema: 'claro', telaCheia: true, animacoesDoCenario: true, modoLeve: 'automatico', dicasVistas: [] }

// Confere preferências que vieram de fora; o que estiver faltando ou errado volta ao padrão.
export function normalizarPreferencias(dados) {
  if (!ehObjeto(dados)) return { ...preferenciasPadrao, dicasVistas: [] }
  const ligaDesliga = (chave) => (typeof dados[chave] === 'boolean' ? dados[chave] : preferenciasPadrao[chave])
  return {
    musica: ligaDesliga('musica'),
    som: ligaDesliga('som'),
    mudo: ligaDesliga('mudo'),
    telaCheia: ligaDesliga('telaCheia'),
    animacoesDoCenario: ligaDesliga('animacoesDoCenario'),
    tema: dados.tema === 'claro' || dados.tema === 'escuro' ? dados.tema : preferenciasPadrao.tema,
    modoLeve: modosLeves.includes(dados.modoLeve) ? dados.modoLeve : preferenciasPadrao.modoLeve,
    dicasVistas: Array.isArray(dados.dicasVistas) ? [...new Set(dados.dicasVistas.filter((tela) => typeof tela === 'string'))] : [],
  }
}
