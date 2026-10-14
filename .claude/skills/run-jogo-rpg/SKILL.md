---
name: run-jogo-rpg
description: Rodar, abrir, jogar, clicar pelas telas ou tirar print do Jogo RPG localmente (npm run dev + Edge escondido). Use para "run the game", "abrir o jogo", "screenshot", "ver a tela X", "testar no navegador" ou conferir uma mudança visual antes de commitar.
---

# Rodar o Jogo RPG

O app fica em `programacao/` (React + Vite + Phaser 4). Os caminhos abaixo partem de `programacao/`.
O agente dirige o jogo com o **driver** desta skill: ele liga o Vite numa porta livre, abre um Edge escondido de
1366×768 pelo protocolo de depuração (as mesmas ferramentas dos roteiros, `scripts/ferramentasDoNavegador.mjs`),
faz os passos pedidos e tira prints. Nada para instalar além do `npm install`: usa o Edge do Windows.

## Preparar (uma vez)

```bash
cd programacao
npm install
ls .env.local   # URL e chave publicável do Supabase; sem ele o jogo roda, só sem contas
```

## Rodar (caminho do agente)

```bash
cd programacao
node ../.claude/skills/run-jogo-rpg/driver.mjs entrar print:reino clicar:Mercado print:mercado
node ../.claude/skills/run-jogo-rpg/driver.mjs entrar clicar:Jogar clicar:Floresta clicar:"Começar partida" esperar:4000 segurar:d:800 print:partida eval:"!!window.__jogoDaPartida"
```

- Prints em `programacao/testes-do-navegador/driver/<nome>.png` (fora do git). Abra o PNG para olhar.
- Passos: `entrar` (convidado novo → Arqueiro → Reino), `clicar:<começo do texto do botão>`, `tecla:<w|a|s|d|e|f|q|r|m|tab|espaco|esc|um>`,
  `segurar:<tecla>:<ms>`, `mouse:<x>:<y>`, `esperar:<ms>`, `tela:<título>`, `eval:<js>`, `print:<nome>`.
- No fim, ele diz a tela atual e os erros do console (`window.__erros`). Sai com código 1 se um passo falhar.
- Na partida, `window.__jogoDaPartida` é o jogo do Phaser (só no dev); a barra de teste e o painel `</> DEV` aparecem.

## Roteiros completos (já prontos)

`npm run testar:navegador` (arena), `testar:floresta`, `testar:reino`, `testar:arte`, `prints -- <pasta> [escuro]`.
Demoram de 1 a 6 minutos: rode com `run_in_background`.

## Rodar (caminho do humano)

`npm run dev` e abrir o endereço que o Vite mostra (http://localhost:5173). Ctrl+C para parar.

## Cuidados

- **Não edite `programacao/src` nem o `vite.config.js` enquanto um roteiro ou o driver roda:** o Vite recarrega a página e a partida volta do começo, e as conferências falham sem motivo.
- A Floresta no Edge escondido usa a placa de vídeo; com `NAVEGADOR_GPU=0` desenha no processador e cai para uns 25 FPS.
- Convidado novo a cada execução (perfil temporário do Edge): o save começa vazio. Para itens e ouro, use o painel DEV (`clicar:Itens de teste`).
- Floresta abre direto na Preparação (o ponto de partida é escolhido lá).
- `clicar:` só acha botões habilitados; o texto é comparado pelo começo (`Voltar ao Reino`, `Começar partida`).

## Problemas que já aconteceram

- "cansou de esperar a tela Reino": o convidado já tinha save no perfil; o driver usa perfil novo, então isso indica erro na tela (veja o print `erro` ou rode `eval:document.body.innerText`).
- Heredoc longo no Bash do Windows falha: escreva o script num arquivo e rode com `node`.
