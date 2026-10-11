# Guia de interface

O padrão visual das telas do jogo, criado na Fase 4.5 (interface intuitiva, 11/10/2026). Vale para todas as telas novas e para a pixel art que vai substituir as formas simples.

A ideia: quem não programou o jogo tem que entender, só de olhar, o que cada tela faz e o que cada botão vai mudar. A Árvore de Habilidades foi a referência de clareza.

## 1. Regras gerais

- **Cada ação tem cor e símbolo próprios, iguais no jogo todo.** O símbolo fica num quadradinho da cor da ação, antes do texto do botão.
- **O botão diz o verbo e o resultado.** Exemplos: "Comprar por 25 de ouro", "Vender 1 por 12", "Fabricar Manoplas de ferro", "Equipar Arco de caça".
- **Antes de qualquer ação, a tela mostra o que muda**, com "antes → depois":
  - o ouro;
  - na Forja, cada atributo, a defesa e a recarga;
  - verde com ▲ quando melhora, vermelho com ▼ quando piora.
- **Botão que não dá para usar fica apagado e diz o motivo logo embaixo**, em vermelho. Exemplos: "Ouro insuficiente: custa 300 e você tem 0.", "Espada curta é só para Guerreiro.", "Falta 1 Pele de lobo.". O motivo é o mesmo que a regra do jogo daria.
- **Tela vazia explica o que fazer.** Exemplo: "Sua mochila está vazia. Itens vêm das partidas (aperte E perto deles), dos minijogos e do Mercado."
- **Toda tela tem um "?" no canto de cima**, ao lado de Configurações. Ele abre "Como funciona", uma explicação curta (os textos ficam em `programacao/src/dados/ajuda.js`). Esc fecha.
- **Imagens são só fundo e moldura.** Textos, números e botões são do código, por cima. Nenhum texto desenhado dentro da imagem.
- **Nada muda nas regras do jogo:** a interface só mostra e chama as mesmas regras de antes.

## 2. Cores e símbolos das ações

| Ação | Cor | Símbolo | Significado | Imagem (opcional) |
|---|---|---|---|---|
| Comprar | âmbar `#b8740a` | ⊖ | o ouro sai (moeda saindo) | `acao-comprar.png` |
| Vender | verde `#2b8a3e` | ⊕ | o ouro entra (moeda entrando) | `acao-vender.png` |
| Trocar | azul `#1971c2` | ⇄ | item por item, sem ouro | `acao-trocar.png` |
| Fabricar | laranja `#d9480f` | ⚒ | materiais viram equipamento (martelo) | `acao-fabricar.png` |
| Equipar e tirar | roxo `#6741d9` | ⛨ e ↩ | vestir no personagem; a peça volta para a Mochila | `acao-equipar.png`, `acao-tirar.png` |
| Contratar | vinho `#a61e4d` | ✎ | assinar um contrato (pena) | `acao-contratar.png` |
| Aceitar e entregar missão | verde-água `#0b7285` | ! e ✓ | pegar uma missão; receber a recompensa | `acao-aceitar.png`, `acao-entregar.png` |
| Descartar, abandonar | vermelho `#c92a2a` | ✕ | algo some (item, missão, multa) | `acao-perder.png` |
| Usar item | rosa `#d6336c` | ♥ | usar uma poção na partida | `acao-usar.png` |
| Levar na partida | ciano `#1098ad` | → | da Mochila do Reino para a da partida | `acao-levar.png` |

As cores e os símbolos ficam em `programacao/src/dados/interface.js` (`acoes`).

## 3. Raridade: a cor da borda dos quadradinhos

| Raridade | Cor da borda |
|---|---|
| Comum | cinza `#868e96` |
| Incomum | verde `#2f9e44` |
| Raro | azul `#1c7ed6` |
| Especial | laranja `#f08c00` |
| Teste (só no `npm run dev`) | rosa `#e64980` |

O nome da raridade também aparece num selo, no detalhe do item.

## 4. Tipos de missão e lugares do Reino

- **Tipos de missão** (o cartaz no quadro da Guilda): Matar ⚔ vermelho, Coletar ✿ verde, Entregar ✉ âmbar, Explorar ⚑ azul. As imagens são `tipo-matar.png`, `tipo-coletar.png`, `tipo-entregar.png` e `tipo-explorar.png`.
- **Lugares do Reino** (o símbolo no botão e uma linha embaixo dizendo o que é):

| Lugar | Símbolo | Linha embaixo |
|---|---|---|
| Guilda | ♜ | missões e contratos |
| Mercado | ⚖ | comprar, vender e trocar |
| Forja | ⚒ | equipar e fabricar |
| Mochila | ▣ | os seus itens |
| Árvores | ♣ | atributos e habilidades |
| Jogar | ▶ | escolher o bioma |

  As imagens são `lugar-guilda.png`, `lugar-mercado.png` e assim por diante. As posições dos botões do Reino continuam as de `posicoes.js`: elas dependem da arte do Reino, que ainda vai chegar.

## 5. Tamanhos

- **Quadradinho de item:**
  - 72 px nas grades do Reino, com o ícone em 64 px (o ícone de 32 px, 2×);
  - 56 px no boneco da Forja e na Preparação, e 44 px nas receitas, nas trocas e na mochila da partida, todos com o ícone em 32 px (1×).
- **O ícone sempre em tamanho inteiro e nítido** (`image-rendering: pixelated`): nada de 1,5×, que borra a pixel art.
- **Até o ícone chegar**, o quadradinho mostra uma forma simples, na cor do item, com a inicial dentro:
  - círculo para consumível;
  - quadrado para recurso;
  - losango para material;
  - escudo para equipamento;
  - pergaminho para utilitário.
- **No quadradinho:** a quantidade fica no canto de baixo, à direita; o preço (ou "tem 6", "leva 2") fica numa faixa embaixo.
- **Tela de referência:** 1366 × 768. O resto da tela cresce e encolhe com a caixa 16:9; as grades encaixam quantos quadradinhos couberem.

## 6. Estados

| Estado | Como aparece | Quando |
|---|---|---|
| Normal | borda da raridade | sempre |
| Escolhido | contorno laranja em volta | o item, o espaço ou a receita que está no detalhe |
| Apagado (40%) | mais claro | não dá agora: falta ouro, é de outra classe, a receita não fecha, só serve no Reino |
| Desativado com motivo | botão apagado e o motivo em vermelho embaixo | a ação não pode ser feita agora |
| Silhueta | tracejado, com "?" | item que o jogador nunca teve (Catálogo) |
| Falta | o número em vermelho | material ou item que falta numa receita ou troca |
| Antes → depois | verde ▲ melhora, vermelho ▼ piora | antes de comprar, vender, equipar, contratar e abandonar |
| Destaque | borda laranja | a missão ativa, os 3 primeiros e a linha do jogador no ranking |

## 7. Molduras e a arte da interface

Toda caixa é um **painel**: um fundo e uma borda simples. Quando a pixel art chegar, cada peça abaixo troca sozinha a forma simples pela imagem. Basta salvar o arquivo em `programacao/src/assets/arte/`.

| Peça | Arquivo | Como a imagem é usada |
|---|---|---|
| Moldura dos painéis | `moldura-painel.png` | 9 pedaços: os cantos de 12 px ficam do tamanho certo e o meio estica |
| Botão | `botao.png` | 9 pedaços, cantos de 8 px |
| Selo | `selo.png` | 9 pedaços, cantos de 6 px |
| Cartaz de missão | `cartaz.png` | 9 pedaços, cantos de 12 px |
| Carta de contrato | `carta.png` | 9 pedaços, cantos de 12 px |
| Quadradinho | `slot.png` | esticado no quadradinho (32 × 32) |
| Quadradinho escolhido | `slot-escolhido.png` | no lugar do `slot.png` quando escolhido |
| Barra (peso, progresso) | `barra-fundo.png` e `barra-cheia.png` | o fundo esticado; a parte cheia repetida para o lado |
| Boneco da Forja | `silhueta-boneco.png` | no lugar da silhueta simples, no meio dos 7 espaços |

O tamanho dos cantos (a "fatia") fica em `programacao/src/dados/interface.js` (`arteDaInterface`). `npm run conferir:arte` mostra quais dessas imagens já chegaram.

## 8. Temas claro e escuro

As cores ficam em variáveis (`--painel`, `--boa`, `--ruim`, `--destaque`, `--quadro`, `--papel`), redefinidas no tema escuro. Algumas peças ficam iguais nos dois temas, porque imitam objetos:
- os cartazes de missão (papel claro sobre o quadro de cortiça);
- as medalhas do ranking (ouro, prata e bronze).

## 9. Onde fica no código

- **Componentes comuns:** `programacao/src/componentes/ui/` (Slot, GradeDeItens, BotaoDeAcao, Painel, Selo, Barra, Mudanca, Simbolo e a arte da interface na raiz).
- **Contas puras da interface:** `programacao/src/regras/interface.js`, com testes (filtros, ordem, comparação antes e depois, de onde vem cada item, itens já vistos).
- **Telas:** Mochila, Mercado, Forja, Guilda (missões e contratos), Preparação, mochila da partida (Tab), Salão da Glória e Reino.
