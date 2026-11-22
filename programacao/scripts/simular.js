// Simulador de balanceamento (RF62, Parte 3 de 11/2026): um grupo de nível N contra uma região da Floresta ou o Boss.
// Usa as mesmas fórmulas da partida (regras/simulador.js); é um modelo simplificado (sem física nem IA).
//
//   npm run simular -- --nivel 5 --regiao media --classes guerreiro,mago,tanque,sacerdote,arqueiro
//   npm run simular -- --tabela            (níveis 1, 5, 10, 20 e 30, sozinho e com o grupo completo, todas as regiões)
//
// Regiões: facil, media, dificil, dominioDoBoss, boss. Classes: guerreiro, mago, tanque, sacerdote, arqueiro.
import { simular } from '../src/regras/simulador.js'

const argumentos = process.argv.slice(2)
const valor = (nome, padrao) => {
  const i = argumentos.indexOf(`--${nome}`)
  return i >= 0 && argumentos[i + 1] && !argumentos[i + 1].startsWith('--') ? argumentos[i + 1] : padrao
}
const grupoCompleto = ['guerreiro', 'mago', 'tanque', 'sacerdote', 'arqueiro']
const regioes = ['facil', 'media', 'dificil', 'dominioDoBoss', 'boss']
const nomes = { facil: 'Fácil', media: 'Média', dificil: 'Difícil', dominioDoBoss: 'Domínio do Boss', boss: 'Boss' }

function linha(r) {
  const luta = r.lutaPadrao
  const quedas = luta.membros.filter((m) => m.caiuEm !== null).map((m) => `${m.classe} ${m.caiuEm.toFixed(1)} s`)
  const dado = luta.membros.reduce((s, m) => s + m.danoDado, 0)
  const recebido = luta.membros.reduce((s, m) => s + m.danoRecebido, 0)
  return [
    r.nivel,
    r.classes.length === 1 ? r.classes[0] : 'grupo de 5',
    nomes[r.regiao],
    luta.venceu ? `vence em ${luta.segundos.toFixed(1)} s` : `perde em ${luta.segundos.toFixed(1)} s`,
    quedas.length ? quedas.join(', ') : 'ninguém cai',
    dado,
    recebido,
    r.maximoSemCair,
    r.xpPorMinuto,
    r.ouroPorMinuto,
    r.fugirResolve ? 'sim' : 'não',
  ]
}

const cabecalho = ['Nível', 'Grupo', 'Região', 'Luta padrão (3 mobs; Boss sozinho)', 'Quem cai (tempo)', 'Dano dado', 'Dano recebido', 'Mobs ao mesmo tempo sem cair', 'XP/min', 'Ouro/min', 'Fugir resolve']

if (argumentos.includes('--tabela')) {
  console.log(`| ${cabecalho.join(' | ')} |`)
  console.log(`|${cabecalho.map(() => '---').join('|')}|`)
  for (const nivel of [1, 5, 10, 20, 30]) {
    for (const classes of [['guerreiro'], grupoCompleto]) {
      for (const regiao of regioes) console.log(`| ${linha(simular({ nivel, regiao, classes })).join(' | ')} |`)
    }
  }
} else {
  const nivel = Number(valor('nivel', '1'))
  const regiao = valor('regiao', 'facil')
  const classes = valor('classes', grupoCompleto.join(',')).split(',').map((c) => c.trim()).filter(Boolean)
  if (!regioes.includes(regiao)) {
    console.error(`Região desconhecida: ${regiao}. Use: ${regioes.join(', ')}`)
    process.exit(1)
  }
  const r = simular({ nivel, regiao, classes })
  console.log(`Nível ${nivel} · ${classes.join(', ')} · ${nomes[regiao]}`)
  console.log(JSON.stringify(r, null, 2))
}
