# Mensagem do Claude do chat para o Claude Code — Parte 14 (versão para celular)

> **Modelo e esforço:** rode com **Opus 5.5, esforço alto**.
> **De quem é:** do Claude do chat. **Data:** 28/11/2026. Entrega do professor: código no GitHub até 03/12 às 23h59.

---

## 0. Regras de trabalho novas (valem para esta e para todas as próximas mensagens)

O Pablo pediu, e é para gravar no `CLAUDE.md` e na skill `modo-continuo` **agora, antes de começar**:

1. **Não pare no meio.** Trabalhe até terminar tudo o que a mensagem pede ou até o limite de uso acabar. Não pare para
   pedir "posso continuar?", não pare no fim de uma parte para esperar ok, não pare para resumir. Pare só se uma
   decisão for impossível de tomar sozinho (e, nesse caso, adiante todo o resto antes de perguntar).
2. **Avise antes de cada teste ou roteiro demorado**, numa linha só, assim:
   `Rodando o testar:floresta (cerca de 6 min). Começou às 14h20; deve terminar perto das 14h26.`
   Assim o Pablo sabe que você está trabalhando e não manda "continue" à toa.
3. Se o limite acabar no meio, o "Onde parei" do `PLANO.md` diz exatamente o próximo passo.

---

## 1. Objetivo

A especificação do professor pede, no item 7: **"Funcionar em pelo menos desktop e, se possível, adaptar para
mobile"**. Hoje o jogo é só desktop. A meta é o jogo **funcionar de verdade no celular**, inteiro, sem quebrar nada no
computador.

**Trabalhe num ramo `mobile`** saído do `main`. Publique no endereço principal **só quando** tudo estiver passando nos
dois (computador e celular). O computador tem que ficar exatamente igual ao de hoje.

---

## 2. Decisões (já tomadas; siga)

- **Celular deitado (paisagem).** Em pé, mostrar uma tela "Gire o celular" com um desenho simples. Tablet também.
- **Detectar toque**, não o tamanho da tela: com toque, aparecem os controles; com mouse e teclado, nada muda.
- **Controles na partida:**
  - **Joystick virtual à esquerda** (aparece onde o polegar encosta) para andar.
  - **Botão de ataque à direita.** Tocar ataca na direção do inimigo mais próximo dentro do alcance (mira automática);
    arrastar a partir do botão mira na direção do arraste. **Arco do Arqueiro:** segurar o botão carrega, soltar atira
    (com a mesma linha de alcance de hoje).
  - Botões das **3 habilidades** em arco em volta do de ataque, com a recarga desenhada, e o de **esquiva**.
  - Botões pequenos no alto: **mochila** (Tab), **pausa** (Esc), **mapa**, e um botão "Mais" com **voltar (Q)**,
    **fugir (F)** e **mudo (M)**. A confirmação do F e o cancelamento do Q continuam iguais.
  - Interagir (E): um botão que aparece só quando há algo para pegar ou levantar perto.
  - Tamanho mínimo de toque de 44 px; nada embaixo dos polegares que importe (o HUD se arruma em volta).
- **Mochila no toque:** tocar pega, tocar noutro quadradinho põe; segurar 0,5 s pega a metade; arrastar para fora da
  janela joga no chão. Usar em si (E) e no aliado (R) viram botões quando um consumível está selecionado.
- **Telas do Reino e menus:** tudo cabendo em celulares de 640 × 360 até 932 × 430 (paisagem). Janelas viram tela
  cheia com rolagem quando não couberem; nenhum texto menor que 12 px; nada cortado. O Reino e o Mapa em camadas
  continuam com o clique pelo desenho (vale o toque).
- **Minijogos** (Lago, Fazenda, Mina) com toque.
- **Desempenho:** no celular, menos partículas, desenhar só perto da câmera, e um "Modo leve" ligado sozinho quando o
  FPS ficar abaixo de 40 por alguns segundos (com opção nas Configurações). Meça.
- **Instalar como app:** `manifest.webmanifest` com nome, ícones (pode usar o emblema provisório) e orientação
  paisagem, e um service worker **simples, escrito à mão** (sem biblioteca nova) que guarda os arquivos do jogo para
  abrir rápido. Dá para "Adicionar à tela inicial" no Android e no iPhone.
- **Tela cheia no celular:** entra junto com o toque em Iniciar jogo e Jogar, como no computador (no iPhone, onde não
  existe, o app instalado já ocupa a tela toda).
- **Nada de biblioteca nova.** Se achar que precisa, pergunte antes.

---

## 3. Testes

- Os de sempre, no computador, todos passando **sem mudar número** (o computador não pode mudar).
- **Roteiro novo `npm run testar:celular`** com a emulação de aparelho do Playwright (por exemplo Pixel 7 e iPhone 14,
  deitados): tela "Gire o celular" em pé; entrar como convidado, escolher a classe, andar pelo Reino, abrir cada tela,
  começar uma partida, andar com o joystick, atacar com toque, usar uma habilidade, abrir a mochila e pegar um item,
  pausar, voltar com Q; jogar um minijogo; nada cortado em 640 × 360 e em 932 × 430.
- Prints do celular de todas as telas, para os protótipos (pasta `prototipos/celular/`, ligada aos casos de uso no
  README dos protótipos).
- Documentação: o RNF da responsividade passa para "feito" (computador e celular), "Alterações do projeto" e a seção 16
  do Conceito (o item 7 do professor). Exporte o PDF de novo pelo Word.

---

## 4. Fim

1. Junte no `main`, publique, confira no site (`conferir:configuracao`, `testar:contas:publicado` e o
   `testar:celular` contra o site publicado).
2. **Página do grupo** com prints do celular e um GIF jogando com o toque.
3. Relatório em `mensagens-claude/2026-11-XX-relatorio-parte-14.md` com o **"Teste para o Pablo no celular"**: o
   endereço, como instalar na tela inicial e o que conferir.
4. **Depois de terminar e publicar o mobile, não pare:** leia `mensagens-claude/2026-11-28-para-o-claude-code-parte-15-administracao.md`
   e siga direto, sem esperar o Pablo.
