// VALORES PROVISÓRIOS de balanceamento (Conceito §19). Nenhum deles muda uma regra, só o tamanho dos números.
// Depois de mudar algo aqui:
//   npm run balanceamento → atualiza o documentacao/Balanceamento.md com as tabelas (XP até o nível 100, taxas, etc.)
//   npm test              → os testes de limite avisam se algum valor ficou absurdo
// Os atributos iniciais de cada classe ficam em dados/classes.js.

// Distância do ponto inicial até a borda de cada bioma (a unidade do mapa se define na etapa 6)
export const distanciaAteABorda = { floresta: 1000, deserto: 1000, tundra: 1000, vulcanico: 1000 }

// XP para passar do nível n para o n + 1 = base × n ^ expoente (arredondado).
// Expoente 1: cresce em linha reta (100, 200, 300...). Acima de 1, cresce cada vez mais rápido.
export const curvaDeXp = { base: 100, expoente: 1 }

// Pontos ganhos a cada nível (RF55)
export const pontosDeAtributoPorNivel = 3
export const pontosDeHabilidadePorNivel = 1

// Maior valor que um atributo pode ter
export const atributoMaximo = 100

// Força do efeito de um atributo: efeito = atributoMaximo × (valor ÷ atributoMaximo) ^ expoente.
// Expoente 1: atributo 100 vale o dobro do 50. Acima de 1, os valores altos valem cada vez mais.
// Nada usa isso ainda; o combate entra na etapa 5.
export const curvaDosAtributos = { expoente: 1.5 }

// Mochila da partida: capacidade = soma da Força do grupo × este valor (RF33)
export const capacidadePorPontoDeForca = 2

// Pontuação base (RF49) = soma de cada parte × o seu peso, mais o bônus de Boss
export const pesosDaPontuacao = { porMonstro: 10, porOuro: 1, porRecurso: 5, porSegundoAtivo: 1 }

// Pontuação base mínima para a Grande Vitória (RF47); alta de propósito
export const minimoDaGrandeVitoria = 1000

// Contratos da Guilda (RF29). O temporário tem nível fixo e dura algumas partidas;
// o permanente cria um personagem no nível 1 que evolui normalmente.
export const contratos = {
  precoDoTemporario: 200,
  partidasDoTemporario: 3,
  nivelDoTemporario: 5,
  precoDoPermanente: 1000,
}
