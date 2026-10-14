---
name: relatorio-de-fase
description: Formato dos dois relatórios do fim de cada tarefa ou fase do Jogo RPG (o técnico para o Pablo, em 10 seções com o "Teste visual para o Pablo", e o do grupo para Uener e Lucas). Use ao terminar uma parte, uma fase ou um pedido do Pablo.
---

# Relatórios do fim de tarefa ou fase

Comece a mensagem com uma linha "Escrito para: ..." (o Pablo no técnico; o grupo, Uener e Lucas, no outro).
O Pablo escreve por voz e quer explicações simples, em português, sem jargão.

## 1. Relatório técnico (para o Pablo), nesta ordem

1. **Resumo** em 2 ou 3 frases.
2. **Onde o projeto está:** tabela das etapas (as 10 do CLAUDE.md) e das fases do PLANO.md, com ✔ ou o que falta.
3. **O que mudou:** arquivos e para que servem (links `[nome](caminho)` relativos à raiz).
4. **Testes rodados e resultado:** quantos, quais novos, o que falhou (com a saída). Tabela: unitários, lint, build, arena, Floresta, Reino, arte, contas no site.
5. **Teste visual para o Pablo:** obrigatório quando algo se vê. Um roteiro curto por item: o que abrir (de preferência o endereço principal `https://jogo-rpg-six.vercel.app`), o que clicar e apertar, e **o que deve aparecer**. Se o item só dá para ver no `npm run dev` (barra de teste, painel DEV), dizer isso.
6. **Decisões tomadas por conta própria** (e por quê).
7. **Pendências:** comigo, com o Pablo (o que só ele faz, passo a passo) e com o grupo.
8. **Problemas conhecidos e riscos.**
9. **Próximo passo.**
10. **Mensagem de commit** (ou os commits feitos, no modo contínuo).

## 2. Relatório para o grupo (Uener e Lucas)

- O que já aconteceu e o que está acontecendo, em linguagem simples, sem depender de ter lido a conversa nem o código.
- Sem nomes de arquivos ou funções; diga o que o jogador vê e o que mudou nas regras.
- O que o grupo precisa decidir ou entregar (conteúdo TASK-010, 012 a 016; nome do jogo, cor do Guerreiro, tema padrão).
- Quando houver prints de antes e depois, publique uma página (Artifact) com eles e mande o link; lembre o Pablo de que ela é privada e que ele compartilha pelo botão Share.

## Onde registrar

- `testes/Registro.md`: os testes rodados; `testes/Roteiros.md`: os roteiros manuais novos (com código, ex.: UI-17).
- `PLANO.md`: "Onde parei" com o link do relatório do grupo.
