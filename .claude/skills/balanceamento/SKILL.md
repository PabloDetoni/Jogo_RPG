---
name: balanceamento
description: Onde ficam os números do Jogo RPG (dano, vida, XP, taxas, tempos, tamanhos), como mudar ou acrescentar um valor, regenerar o documentacao/Balanceamento.md e os testes de limite que precisam passar. Use ao mexer em qualquer número do jogo ou quando pedirem "balancear", "valor provisório", "deixar mais fácil/difícil".
---

# Números do jogo (balanceamento)

## Onde cada número fica (nunca espalhado no código)

- `programacao/src/dados/regras.js` e `taxas.js`: valores **da documentação** (Conceito, requisitos).
- `programacao/src/dados/balanceamento.js`: valores **provisórios** (os nossos, até o grupo decidir). Cada bloco tem um comentário dizendo o que é e marcado como PROVISÓRIO quando for. Os principais:
  - `combateDeTeste`: personagem (tamanho, velocidade), esquiva, ataques de cada classe, separação, travamento, IA, mana, habilidades, desmaio, HUD, inimigos de teste;
  - `mundo`: obstáculos, câmera, mobs da Floresta, Boss, força das regiões, nascimento, coleta (tempo dos drops), minimapa, XP por área;
  - `curvaDeXp`, `curvaDosAtributos`, `critico`, `contratos`, `mercado`, `equipamentoNaPartida`, `minijogos`, `evolucaoDasHabilidades`, `pesosDaPontuacao`.
- Conteúdo (itens, receitas, árvores, missões) fica nos outros arquivos de `src/dados/`, marcado "PROVISÓRIO – substituir pelo do grupo".

## Mudar ou acrescentar um número

1. Ponha o valor no bloco certo de `balanceamento.js`, com um comentário curto (o que é, a unidade: ms, px, fração) e "provisório".
2. Use o valor pelo import (`import { mundo } from '../dados/balanceamento.js'`); nada de número solto na regra ou na cena.
3. Se o número tiver um limite que faça sentido (nunca 0, menor que outro, entre 0 e 1), acrescente um teste em `src/dados/balanceamento.test.js` (os testes de limite barram números absurdos).
4. Se for um bloco novo, acrescente-o ao `scripts/gerarBalanceamento.js` (import e uma seção da tabela).
5. Regenere o documento e rode os testes:

```bash
cd programacao
npm run balanceamento     # reescreve documentacao/Balanceamento.md a partir do código (não edite o .md à mão)
npx vitest run src/dados/balanceamento.test.js
npm test
```

## Testes de limite que precisam passar (`balanceamento.test.js`)

XP inteiro, crescente e com teto; atributos entre 1 e o máximo, com o perfil de cada classe (Conceito §5 e §6); atributo 100 vale mais que o dobro do 50 sem exagero; taxas (4 perdidos < fuga < todos desmaiam); capacidade da mochila; números do combate positivos e finitos; separação menor que um corpo; travamento rápido; mana e habilidades; níveis da IA; esquiva; inimigos (desistem mais longe do que detectam, tiro esquivável).

## Ideias do Pablo para os valores

XP limitado por monstro; atributo 100 bem mais forte que o 50; nada absurdo. Valores do grupo (TASK-014) substituem os provisórios quando chegarem: troque e rode todos os testes.
