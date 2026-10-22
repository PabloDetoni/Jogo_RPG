---
name: gerar-arte
description: Gerar arte do Jogo RPG pelo PixelLab (MCP "pixellab") e pôr no jogo - personagem, animação nova de ataque, monstro, item, tile, retrato, ícone ou fundo de tela. Use quando o Pablo pedir "gerar arte", "anime o ataque novo do Mago", "faça o ícone do item X", "o lobo precisa de sprite", ou mandar seguir a fila de arte.
---

# Gerar arte pelo PixelLab

A arte entra no jogo sozinha: o arquivo salvo em `programacao/src/assets/arte/` com o nome da Lista de Arte e Som troca o
quadrado pela imagem (sem mexer em código). O PixelLab **gasta da conta do Pablo**: confira o saldo antes e depois.

## Antes de tudo: a aparência é decisão do Pablo

- Personagem novo só depois de um **teste de estilo aprovado** (um boneco de frente, 1 a 2 gerações) e no estilo do
  `documentacao/Guia_de_Arte.md` (o do Taskbar Hero). O Mago de 15/10, feito sem consultar, foi rejeitado.
- Molduras, botões, painéis e efeitos são código (CSS e SVG, Guia de Interface): não gastam gerações.

## Regras de custo (do Pablo, 15/10/2026)

- **Antes de cada lote, dizer quantas gerações ele vai usar e esperar o ok.** Nunca gerar um lote grande sem perguntar.
  Uma peça só, pedida por ele, pode ir direto (dizendo o custo no fim).
- `get_balance` antes e depois; anotar o gasto na tabela da fila (abaixo) e no relatório.
- Custos de referência (plano trial, 15/10): imagem solta (`create_image_pixflux`, ícone, retrato, fundo) = 1; personagem
  padrão de 4 direções (`create_character`, mode standard) = 1; animação por molde (`animate_character`, template) =
  1 por direção; retrato pelo `create_portrait_character` = 10 a 15 (evitar: usar o pixflux a partir do boneco ampliado).
- O trial só aceita **uma geração por vez**: uma direção por chamada, esperando cada uma (`wait_for_jobs`).
- **Se a geração falhar por falta de créditos, parar e avisar o Pablo** (ele pode trocar de conta).

## Passo a passo

1. **Ler** `documentacao/Guia_de_Arte.md` (estilo, tamanhos, cores, modelo de descrição) e a seção da peça em
   `documentacao/Lista_de_Arte_e_Som.md` (nome exato do arquivo, quadros, direções).
2. **Montar a descrição sempre com o modelo do Guia (seção 4)** e os mesmos ajustes (vista `low top-down`, contorno
   fino escuro, 2 a 3 tons, tamanho 48 = quadro de 68). Referência de estilo: a do Guia (Taskbar Hero para os
   personagens, as imagens do Reino e do mapa para cenários e fundos). Frente, costas e direita; a esquerda é espelhada.
3. **Gerar pelo PixelLab:**
   - personagem: o teste de estilo (`create_image_pixflux` 64 × 64, de frente) → aprovado, `create_character` mode `v3`
     com ele como `reference_image_url` (via `get_upload_url`) → `animate_character` (molde; ou `skeleton-v3` quando o
     molde perde detalhes), uma direção por chamada no trial, repetindo o `animation_group_id` e o `animation_name`;
   - animação nova de um ataque: `animate_character` com o molde que combina (ou `mode: v3` com `action_description`),
     nas 4 direções;
   - ícone, retrato, fundo: `create_image_pixflux` (retrato: o boneco de frente ampliado para 128 como `init_image`;
     fundo: 400 × 225, sem transparência, salvo como `fundo-<tela>.png` em `src/assets/arte/telas/`).
4. **Baixar na hora** (os resultados do servidor podem ser apagados depois de algumas horas):
   - personagem: `node scripts/importarPersonagem.mjs <id do personagem> <classe>` (em `programacao/`) baixa o ZIP do
     PixelLab e monta as faixas `<classe>-<animação>-<direção>.png` em `src/assets/arte/bonecos/` (parado, andando,
     atacando nas 4 direções e o desmaiado, o último quadro do `falling-back-death`);
   - imagem solta: `curl -sSfL -o src/assets/arte/<pasta>/<nome>.png <download_url>`.
   Guardar também o original (o ZIP ou o PNG) em `programacao/arte-original/` (fora do git), para refazer sem gastar.
5. **Conferir:** `npm run conferir:arte` (o que foi achado, o que falta, nomes ou tamanhos estranhos) e abrir o jogo
   (skill `run-jogo-rpg`) para ver no lugar: na partida (arena de teste, com a classe na barra de teste), na Seleção de
   classe, na Preparação e no HUD. Ajustar no código o que precisar combinar com a arte nova (o `tamanhoNaTela` em
   `dados/arte.js`, o tamanho e o tempo dos efeitos em `dados/balanceamento.js`), com teste.
6. **Tirar prints** (o driver da `run-jogo-rpg`, `print:<nome>`) e uma ampliação da folha (as direções e os quadros lado
   a lado, 5×) para o Pablo ver os pixels.
7. **Mostrar para o Pablo aprovar:** os prints, a ampliação, o custo e o roteiro do que conferir. O que ele **não
   aprovar volta para a fila** abaixo com o comentário dele; refazer só depois de dizer o custo.

## Ataque novo (pedido do tipo "o Mago tem um ataque novo, anime")

- A **animação do personagem** vem do PixelLab (passo 3, nas 4 direções, com o nome `<classe>-<animação>-<direção>`;
  um nome novo de animação precisa entrar em `dados/arte.js`, `animacoes` e a lista da classe, e em `regras/arte.js` se
  tiver apelidos).
- O **efeito do golpe** (projétil, explosão, aura, rastro) é **código**, em `jogo/ataques/` ou `jogo/habilidades/`,
  com o tempo casado com os quadros da animação.
- Os **números** (dano, recarga, mana, alcance, duração) vão para `src/dados/balanceamento.js` (skill `balanceamento`),
  com teste da regra pura e o `npm run balanceamento`.
- Testes de sempre (skill `verify`) e prints.

## Fila de arte

| Lote | O quê | Gerações (estimativa) | Situação |
|---|---|---|---|
| 0 | Teste: ícone da Poção de vida | 1 | gerado em 15/10 (fora do jogo; o estilo dos ícones vem com o lote de ícones) |
| — | Mago chibi (estilo do protótipo) | 13 | **rejeitado** em 19/10 (estilo escolhido sem consultar); descartado |
| — | Camadas do Reino e do Mapa (fundo limpo do Reino, fachadas atrás das placas, teste do castelo do Planalto) | 14 | feito em 20/10; **rejeitado** pelo Pablo em 21/10 ("ficaram feias"): o Reino e o Mapa usam as peças que ele fez (`documentacao/Telas`), e nada do PixelLab entrou |
| 1 | Fundos das telas internas (estilo das imagens do Reino e do mapa) | 1 de teste + 1 por tela | proposto em 20/10; espera o ok do Pablo |
| 2 | Teste de estilo de personagem (um boneco de frente, Taskbar Hero) | 1 a 2 | próximo pedido do Pablo |
| 3 | As 5 classes (girar, animar, retrato, emblema) | 15 a 25 por classe | espera o teste aprovado e o ok do custo |
| 4 | Monstros e o Boss | a calcular | espera |
| 5 | Tiles e objetos da Floresta | a calcular | espera |
| 6 | Ícones dos itens (40) | 40 | espera |

Saldo em 20/10 (depois das camadas): 28 de 40 gerações usadas (sobram 12, mais o bônus diário de até 20).

**Custos achados em 20/10:** o "apagar e preencher" de verdade (`inpaint_image`) custa 10 a 25 gerações por pedaço e
o do Pro Flash, 9; a edição Pixen (`edit_image_pixen`, até 256 px) custa 1: para apagar um objeto de uma cena grande,
editar uma cópia reduzida da área e colar de volta só a área apagada. O
`create_map_object` só aceita a imagem de referência colada no pedido (base64), sem endereço de upload.

Comentários do Pablo sobre o que voltou para a fila:
- Camadas (21/10): as peças geradas e os recortes "ficaram feias"; o Reino e o Mapa são montados com as peças dele (`documentacao/Telas/reino_pixel_art` e `mapa_pixel_art`), sem gerar nem mudar nada (a Árvore de Habilidades, a frente dela e as nuvens chegaram depois e também entraram). As bandeiras e as árvores ele anima depois.
- Mago (19/10): "a aparência deles fosse um pouco melhor e mais estilizada", no estilo do Taskbar Hero; estilo novo no Guia de Arte.
