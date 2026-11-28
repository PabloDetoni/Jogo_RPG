# Relatório da Parte 14 · O jogo no celular (28/11/2026)

## 1. Resumo

O jogo inteiro agora funciona no celular e no tablet, deitados, com controles de toque na tela; em pé aparece "Gire
o celular". No computador nada mudou (o toque é detectado pelo jeito de apontar, não pelo tamanho da tela). Publicado
no endereço principal (`10bb31e` no `main`) e conferido lá: contas 54/54, celular 168/168, app instalável funcionando.

## 2. Onde o projeto está

| Etapa / parte | Situação |
|---|---|
| Etapas 1 a 9, Fase 4.5, visual novo, camadas | ✔ |
| Partes 0 a 13 | ✔ publicadas |
| **Parte 14 (celular)** | ✔ publicada (`10bb31e`) |
| Partes 15 a 17 (Administração, telas novas e teclas, amostra de pixel art) | começando agora (mensagem de 28/11) |
| Fase 5 (testes, protótipos, DOC-006) e Fase 6 (entrega, 03/12) | protótipos do celular feitos; resto com as Partes 15 a 17 |

## 3. O que mudou

- **Detectar o toque:** [regras/toque.js](../programacao/src/regras/toque.js) (regras puras, com teste: mira automática, joystick, modo leve, "clique" → "toque") e [componentes/useToque.js](../programacao/src/componentes/useToque.js). A moldura ganha `data-toque`.
- **Gire o celular:** [componentes/GireOCelular.jsx](../programacao/src/componentes/GireOCelular.jsx).
- **Controles da partida:** [telas/partida/ControlesDeToque.jsx](../programacao/src/telas/partida/ControlesDeToque.jsx) → ponte → `CenaArena.receberToque` (joystick, ataque com mira automática e arraste, arco segurado, 3 habilidades em arco com a recarga, esquiva, Pegar, Mochila, Mapa, Pausa e "Mais" com Q, F e M). As teclas viraram `comandos` em [Partida.jsx](../programacao/src/telas/partida/Partida.jsx), os mesmos para tecla e botão.
- **Mochila com o dedo:** [GradeComMao.jsx](../programacao/src/componentes/ui/GradeComMao.jsx) (segurar 0,5 s = metade; arrastar para outro quadradinho ou para fora = chão) e [MochilaNaPartida.jsx](../programacao/src/telas/partida/MochilaNaPartida.jsx) ("Usar no Líder", "No aliado", "Fechar a mochila").
- **Telas:** [estilo/toque.css](../programacao/src/estilo/toque.css) (tudo preso a `data-toque`); letra mínima de 12 px em todas as letras do CSS; lugar e altura só no toque pelo campo `toque` de [dados/posicoes.js](../programacao/src/dados/posicoes.js); no Mapa os nomes aparecem sempre; as dicas falam em "toque" ([dados/ajuda.js](../programacao/src/dados/ajuda.js)); o painel DEV começa minimizado no celular.
- **Desempenho:** menos partículas no toque, "Modo leve" (automático, ligado ou desligado nas Configurações; preferência nova `modoLeve`).
- **App instalável:** [public/manifest.webmanifest](../programacao/public/manifest.webmanifest), [public/icones/](../programacao/public/icones/) (ícone provisório: espadas cruzadas), [public/sw.js](../programacao/public/sw.js) (escrito à mão; só no site publicado), metas no `index.html`; no Android, a tela cheia trava deitado.
- **Testes:** [scripts/testarCelular.mjs](../programacao/scripts/testarCelular.mjs) (`npm run testar:celular` e `testar:celular:publicado`); ferramentas de celular em `ferramentasDoNavegador.mjs` (emular aparelho, tocar, arrastar, achar o que está cortado); `npm run prints -- prototipos-celular`.
- **Documentação:** RNF03 e RNF08, matriz, "Alterações do projeto", [Arquitetura](../documentacao/Arquitetura_do_Codigo.md), [Guia de Interface](../documentacao/Guia_de_Interface.md) (7c), [protótipos do celular](../documentacao/prototipos/celular/README.md) (56 prints, ligados aos casos de uso), Roteiros CE-01 a CE-08, Conceito (§2, §16 item 7, §17, §22 e a nova 21.12) e o PDF exportado pelo Word (26 páginas).
- **Regras de trabalho** novas no CLAUDE.md e na skill `modo-continuo`.

## 4. Testes rodados

| Teste | Resultado |
|---|---|
| Unitários (`npm test`) | 1.079 passando (21 novos) |
| Lint e build | ok |
| **`testar:celular`** (novo) | **197/197**: Pixel 7 e iPhone 14 deitados, a tela em pé, o caminho inteiro com o dedo, a Mina, a partida (joystick, mira automática, arco, habilidade, esquiva, mochila, mapa, pausa, mudo, Q) e as telas em 640 × 360 e 932 × 430 |
| Desempenho (no `testar:celular`) | 60 FPS no celular emulado; com o processador 8× mais lento, 16 FPS e o Modo leve ligou sozinho com o aviso |
| Floresta, Reino, paredes, botões, camadas, arte, som | 109, 86, 12, 52, 34, 39, 30: todos iguais a antes |
| **Arena (`testar:navegador`)** | **184 de 191, igual no `main` de antes do celular** (ver 8) |
| Prints do celular | 56 telas, nada cortado nem pequeno |
| Site publicado | `conferir:configuracao` tudo certo; contas 54/54; `testar:celular:publicado` 168/168; service worker ativo |

## 5. Teste para o Pablo no celular

**Endereço:** `https://jogo-rpg-six.vercel.app` (no celular).

**Instalar na tela inicial:**
- Android (Chrome): menu ⋮ › "Adicionar à tela inicial" ou "Instalar app".
- iPhone (Safari): botão Compartilhar › "Adicionar à Tela de Início".
- Abra pelo ícone das espadas cruzadas: deve abrir deitado, sem a barra do navegador.

**O que conferir:**
1. Em pé: aparece "Gire o celular". Deitado: a Tela inicial.
2. Toque em Iniciar jogo (no Android entra em tela cheia), entre como convidado, escolha a classe e toque em cada placa do Reino: tudo cabe e dá para ler; o que é comprido rola com o dedo.
3. No Mapa, os nomes dos lugares aparecem sem nada em cima; jogue a Mina tocando nas pedras.
4. Na partida: o polegar esquerdo anda (o joystick aparece onde encostar); o botão grande ataca o inimigo mais perto; arrastar a partir dele mira; com o Arqueiro, segure e solte. Toque numa habilidade e na esquiva (»).
5. Perto de um item no chão, aparece "Pegar". Na Mochila: toque numa poção e em "Usar no Líder"; segure numa pilha (pega a metade); arraste uma pilha para fora (vai para o chão).
6. Mapa (sem pausar), Pausa, e em "Mais": Mudo, Voltar ao Reino (Q) e Cancelar a volta.
7. Configurações › Modo leve (automático, ligado, desligado).
8. No computador, tudo deve estar exatamente como antes.

Roteiro completo: CE-01 a CE-08 em [testes/Roteiros.md](../testes/Roteiros.md).

## 6. Decisões tomadas por conta própria

- **Segurar o ataque repete o golpe** (na recarga de sempre): tocar várias vezes seguidas cansa o dedo. O arco continua "segurar e soltar".
- **Arrastar a partir de uma habilidade também mira** (como o ataque); tocar usa a mira automática.
- **Mapa pelo botão "Mapa" não pausa** (em combate não dá para pausar; assim dá para olhar o mapa sempre).
- **No toque, o HUD do grupo fica mais curto** (sem "IA básica" e sem o rótulo "Grupo:"); a IA de cada um continua nas Árvores.
- **No Mapa do celular, as placas mostram só o nome** (com as rodadas do dia, as do Planalto ficavam uma em cima da outra); a placa do castelo desce um pouco só no celular.
- **O Modo leve automático só mede no celular**; no computador o jogo fica igual.
- **O service worker vale para o site inteiro** (também no computador): ele só guarda arquivos, e a página sempre vem primeiro da internet, então uma versão nova chega na hora.
- **Ícone do app provisório** (espadas cruzadas nas cores do jogo), como a mensagem permitiu.
- **Nos roteiros, cada tamanho de celular abre numa aba nova e com densidade 2:** o Edge escondido para de desenhar quando a emulação muda com a página aberta, e não tira print do Reino com densidade 3 (o jogo continua a 60 quadros por segundo; é só a foto).

## 7. Pendências

- **Comigo:** as Partes 15 a 17 (começo agora, sem esperar).
- **Com o Pablo:** testar no celular de verdade (seção 5), Android e iPhone se der; dizer se o ícone provisório serve.
- **Com o grupo:** testar no celular de cada um (a página do grupo explica).

## 8. Problemas conhecidos e riscos

- **Roteiro da arena (`testar:navegador`): 184 de 191.** O navegador escondido dos testes (Edge) foi atualizado para a versão 158; no roteiro longo da arena o jogo cai para 14 quadros por segundo dentro dele e as conferências de tempo falham (o Líder anda pouco em meio segundo, a contagem anda devagar). **O `main` de antes da Parte 14 falha do mesmo jeito** (184 de 191), e a arena aberta sozinha roda perto de 60. Não é coisa do jogo; fica para investigar (talvez o Edge 158 não solte os jogos que o roteiro abre e fecha).
- Também nesta madrugada, 42 Edges escondidos tinham ficado presos de rodadas interrompidas e deixaram a máquina lenta; fechei todos.
- A arte do Reino e do Mapa pesa (cerca de 15 MB em imagens). No celular com 4G, a primeira abertura pode demorar; o service worker deixa as seguintes rápidas.
- O teste em celular de verdade (toque real, iPhone real) ainda não foi feito: só emulado.

## 9. Próximo passo

As Partes 15 a 17 (`mensagens-claude/2026-11-28-para-o-claude-code-parte-15-administracao.md`): Administração com os papéis de dono e ADM, entrar como dev, o SQL 006 (o Claude do chat roda), telas novas (Salão da Glória, Configurações, botões do canto), teclas novas e a amostra de pixel art.

## 10. Commits

- `234af6b` Regras de trabalho novas e a mensagem da Parte 14
- `5382528` Parte 14: o jogo no celular e no tablet e o `testar:celular`
- `bb7dd33` Mensagens: a Parte 14 atualizada e a das Partes 15 a 17
- `27394c8` Protótipos do celular e o registro dos testes
- `10bb31e` no `main`: a Parte 14 publicada

---

## Para o grupo (Uener e Lucas)

**O que aconteceu:** o jogo agora roda no celular. O professor pedia "funcionar em desktop e, se possível, em
mobile", e agora as duas coisas valem. No celular deitado aparecem controles na tela: um joystick que surge onde o
polegar esquerdo encosta, um botão grande de ataque que acerta sozinho o inimigo mais perto, as habilidades em volta
dele, a esquiva e, no alto, mochila, mapa, pausa e "Mais". Em pé, o jogo pede para girar o celular. Todas as telas
cabem e dá para ler; o que é comprido rola com o dedo. Também dá para instalar o jogo como app na tela inicial. No
computador, nada mudou.

**Página com prints e um GIF jogando com o dedo:** https://claude.ai/artifact/BNSxDP9omxEVzazr7vFydE (é privada: o
Pablo compartilha pelo botão Share).

**O que vocês podem fazer:** abrir `https://jogo-rpg-six.vercel.app` no próprio celular, jogar uma partida, testar o
"Adicionar à tela inicial" e dizer o que ficou ruim de tocar ou de ler. O ícone do app é provisório.
