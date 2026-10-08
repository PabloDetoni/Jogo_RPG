import { ehObjeto } from './validacao.js'

// Preferências de som e tema (RF18). Valem antes do login e ficam salvas à parte do progresso.
// mudo (tecla M, a qualquer momento): silencia música e som sem mudar a escolha de cada um.
export const preferenciasPadrao = { musica: true, som: true, mudo: false, tema: 'claro' }

// Confere preferências que vieram de fora; o que estiver faltando ou errado volta ao padrão.
export function normalizarPreferencias(dados) {
  if (!ehObjeto(dados)) return { ...preferenciasPadrao }
  const ligaDesliga = (chave) => (typeof dados[chave] === 'boolean' ? dados[chave] : preferenciasPadrao[chave])
  return {
    musica: ligaDesliga('musica'),
    som: ligaDesliga('som'),
    mudo: ligaDesliga('mudo'),
    tema: dados.tema === 'claro' || dados.tema === 'escuro' ? dados.tema : preferenciasPadrao.tema,
  }
}
