# Jogo RPG: código

RPG 2D visto de cima, em pixel art, para computador (teclado e mouse). Trabalho de Análise e Projeto de Sistemas e de Desenvolvimento Web 2 da UTFPR Campo Mourão.

**Equipe:** Pablo Detoni, Lucas Garcia e Uener Peres.

A documentação do jogo (conceito, requisitos, casos de uso, diagramas) fica em [`../documentacao`](../documentacao/README.md) e é a fonte de verdade. O que vai acontecer até a entrega está no [`PLANO.md`](../PLANO.md).

## Como rodar

Precisa do [Node.js](https://nodejs.org) 22.12 ou mais novo (os testes usam o Vitest 5, que exige isso). Todos os comandos rodam **dentro desta pasta** (`programacao`).

```bash
npm install            # só na primeira vez, ou quando o package.json mudar
npm run dev            # abre o jogo em http://localhost:5173
npm test               # roda todos os testes (Vitest) uma vez
npm run test:observar  # roda os testes de novo a cada arquivo salvo
npm run lint           # procura erros comuns no código
npm run build          # gera a versão final em dist/
npm run balanceamento  # atualiza ../documentacao/Balanceamento.md
npm run testar:navegador  # joga a arena num Edge escondido e confere tudo (prints em testes-do-navegador/)
```

Durante o `npm run dev` aparece um **painel de desenvolvimento** num canto da tela (dá para arrastar e minimizar no "–": ele vira o botãozinho "</> DEV"). Ele pula direto para qualquer tela e não existe na versão final.

## Pastas

```text
src/
  componentes/  peças de tela reaproveitadas: Tela, Botao, Campo, Area, Abas, Janela, Avisos, PainelDev
  telas/        uma tela por arquivo, separadas em acesso/, reino/ e partida/
  jogo/         a partida em Phaser: cenas/, entidades/ (Líder, aliados, inimigos), ataques/, habilidades/, a IA dos aliados, o caminho em volta das pedras e a ponte com o React
  janelas/      janelas que abrem por cima da tela: Configurações, Pausa, Como jogar
  estado/       estado global (um reducer) e o formato do progresso do jogador
  salvamento/   salvamento no navegador (modo convidado) e o controle de uma aba só
  regras/       regras puras do jogo (taxa, XP, atributos, mochila, fim da partida, Guilda, combate, movimento, IA e níveis da IA, desmaio, habilidades), cada uma com teste
  dados/        TODOS os números do jogo e as listas fixas (classes, biomas, resultados, posições na tela)
  testes/       ajudantes dos testes (navegador e relógio falsos)
scripts/        gerador do Balanceamento.md
```

## Decisões que guiam o código

- **Navegação sem React Router.** A tela atual fica no estado global (`src/estado`), num Context com `useReducer`. Ir de uma tela a outra é uma ação (`navegar`); as telas raiz (Tela inicial, Reino, Mapa) zeram o caminho de volta.
- **Imagens são só fundo.** Textos, botões e áreas clicáveis são componentes React por cima. As posições ficam em porcentagem em `src/dados/posicoes.js`, então trocar a arte não quebra os cliques.
- **Primeiro funcional, depois bonito.** Até a etapa de arte, cada classe é um quadrado colorido e os ataques são quadradinhos.
- **Números só em `src/dados`.** Taxas, XP, atributos, peso, preços: nada fica espalhado no código.
  - `regras.js` e `taxas.js`: valores que a documentação já fixa;
  - `balanceamento.js`: valores **provisórios**, que o grupo ainda vai decidir. Depois de mudar um, rode `npm run balanceamento` e `npm test`. Os testes de limite (`balanceamento.test.js`) barram números absurdos, como XP na casa dos bilhões.
- **Regras puras e testadas.** Cada arquivo de `src/regras` só recebe dados e devolve o resultado, sem tela e sem salvamento, e tem um `.test.js` ao lado.
- **O progresso não muda durante a partida (RF12).** Ouro, XP e itens ganhos ficam na partida atual e só entram no progresso ao encerrar. Se a aba fechar no meio, a partida é descartada e nada do que foi ganho conta.
- **Salvamento do convidado.** O progresso vai para o `localStorage` com o formato `{ formato, versao, salvoEm, progresso, partidaEmAndamento }`. Ele é salvo a cada 3 minutos, ao fechar ou esconder a aba e em cada momento importante (classe escolhida, começo e fim da partida). Um save estragado é guardado como cópia e não trava o jogo. Se o jogo estiver aberto em duas abas, só uma joga (Web Locks).
- **Partida em canvas com Phaser 4** (etapa 5), na pasta `src/jogo/`. O Phaser desenha e move; o HUD, os menus, as janelas e a barra de teste continuam em React. Os dois só conversam pela ponte (`src/jogo/ponte.js`), poucas vezes por segundo. O Phaser só é baixado quando a Partida abre, e quem decide dano, crítico, recarga, cura, separação, caminho, alvos da IA, desmaio, mana, em combate, retorno, fuga e o fim da partida são as regras puras de `src/regras/` (combate, movimento, iaDosAliados, nivelDaIA, desmaio, habilidades, andamentoDaPartida, fimDaPartida e ganhosDaPartida). A partida tem um relógio próprio, que para na pausa.
- **Arena de teste (Fase 1, partes 5a a 5c).** Hoje a Partida é uma arena com quadrados, para testar o combate: WASD anda, o mouse mira, o clique ataca, 1 usa a habilidade de teste, o Espaço esquiva, Q volta ao Reino (15 s, fora de combate), F foge (5 s, mesmo em combate), Esc pausa (fora de combate) e M muta. Os mobs dão XP e ouro, e o fim da partida calcula resultado, taxa, pontuação e XP e grava no save; o Resumo mostra tudo. Os aliados lutam sozinhos, desmaiam e se levantam, com uma IA que melhora com o nível de cada personagem (básica, média e avançada); só o Líder esquiva. O HUD fica numa faixa em cima e a barra de teste numa faixa embaixo, e ninguém anda embaixo delas. A barra troca a classe do Líder, enche o grupo, junta todos num ponto, cria inimigos, recarrega as habilidades, derruba um aliado ou o Líder, liga e desliga a ajuda dos aliados, força um nível da IA ("IA:"), liga o modo invencível (só do Líder), monta a situação de teste do momento de foco ("Testar foco") e acaba a partida com qualquer um dos 4 resultados, com os números reais dela. Só no `npm run dev`, a barra tem "Subir nível" e "+300 de ouro", e o painel `</> DEV` mexe nos personagens do save (só fora da partida). No `npm run dev`, o jogo fica em `window.__jogoDaPartida`, para o roteiro de testes no navegador.
- **Contas com Supabase** (etapa 8). As chaves ficam num `.env`, que nunca vai para o GitHub.
- **Nomes em português**: telas, componentes, variáveis e funções.

## Etapas

1. Base do projeto ✔
2. Esqueleto de telas navegável ✔
3. Estado global e salvamento local (modo convidado) ✔
4. Regras puras com testes (taxa, XP, peso) ✔
5. Partida com quadrados (Phaser) ✔ (partes 5a a 5e; a Fase 1 também trouxe os contratos na Guilda e o pentágono)
6. Mundo (zona segura, regiões, minimapa)
7. Telas do Reino com dados de exemplo
8. Supabase (login, tabelas, sessão única, salvamentos, convidado → conta)
9. Ranking, conquistas e som
10. Arte

Entrega do código e da versão beta: **03/12/2026**.
