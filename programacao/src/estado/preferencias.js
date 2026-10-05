import { ehObjeto } from './validacao.js'

// Preferências de som e tema (RF18). Valem antes do login e ficam salvas à parte do progresso.
export const preferenciasPadrao = { musica: true, som: true, tema: 'claro' }

// Confere preferências que vieram de fora; o que estiver faltando ou errado volta ao padrão.
export function normalizarPreferencias(dados) {
  if (!ehObjeto(dados)) return { ...preferenciasPadrao }
  return {
    musica: typeof dados.musica === 'boolean' ? dados.musica : preferenciasPadrao.musica,
    som: typeof dados.som === 'boolean' ? dados.som : preferenciasPadrao.som,
    tema: dados.tema === 'claro' || dados.tema === 'escuro' ? dados.tema : preferenciasPadrao.tema,
  }
}
