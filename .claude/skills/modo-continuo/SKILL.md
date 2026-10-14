---
name: modo-continuo
description: Como o Claude trabalha no modo contínuo do Jogo RPG (pedido do Pablo em 08/10/2026) - plano no PLANO.md sem esperar ok, uma parte por vez com commit local, testes, documentação, publicação no fim da fase e quando parar para o Pablo. Use quando o Pablo disser "continue o modo contínuo", "siga o modo contínuo" ou mandar uma lista de partes para fazer.
---

# Modo contínuo

O Claude programa o resto do jogo até a entrega (03/12/2026) sem esperar o ok de cada parte nem o teste do Pablo
entre as fases. Se a sessão acabar no meio, o Pablo manda "Continue o modo contínuo de onde parou": ler o
**"Onde parei"** no topo do `PLANO.md` e seguir.

## Cada parte

1. Plano curto escrito no `PLANO.md` (arquivos, abordagem, valores provisórios). Não esperar o ok.
2. Ler só os arquivos da parte; reaproveitar componentes que já existem (`componentes/ui/`, janelas, HUD).
3. Programar. Regra pura nova em `src/regras/` com teste ao lado; números em `balanceamento.js` (skill `balanceamento`).
4. Testes rápidos a cada parte (`npm test`, lint); roteiros do navegador no fim de grupos de partes (skill `verify`).
5. Commit local da parte (ramo local saído do `main`).
6. Atualizar no mesmo trabalho: `PLANO.md` ("Onde parei"), `CLAUDE.md` (se mudou um fato), o documento afetado (com a linha em "Alterações do projeto"; no Conceito, a seção 21), o `Balanceamento.md` e a pasta `testes/` (Registro e Roteiros).

## Fim de cada fase

Skill `publicar` → skill `relatorio-de-fase` → seguir direto para a próxima fase.
O Pablo testa no site em paralelo. Se ele mandar um problema: parar, corrigir, publicar a correção e continuar.

## Parar e esperar o Pablo só quando

- precisar de algo que só ele faz (painel do Supabase ou da Vercel, arte, som): dizer exatamente o que fazer, passo a passo, e **adiantar o que não depender disso**;
- precisar de uma decisão do grupo que mude regra do jogo (adiantando o resto);
- algo quebrar e não der para resolver.

## Perguntar antes de

Instalar biblioteca (aprovadas: Vitest, Phaser, `@supabase/supabase-js`); apagar arquivo; mudar o formato do save (campo novo entra pelo `normalizarProgresso`; mudar nome ou lugar pede formato novo com migração); contrariar a documentação (vale o pedido mais recente, avisando); cortar escopo (propor cortes na ordem da seção 12 da "Auditoria e Backlog").
Plugins e skills do marketplace oficial da Anthropic (`claude-plugins-official`) estão liberados (Pablo, 14/10); de fora dele, recomendar e esperar o ok.

## Conteúdo que o grupo ainda não entregou (TASK-010, 012 a 016)

Não esperar: criar conteúdo provisório coerente com o Conceito, em arquivos de dados, marcado
**"PROVISÓRIO – substituir pelo do grupo"** (no arquivo e no PLANO.md). Quando chegar o de verdade, trocar e rodar todos os testes.

## O que depende do Pablo (avisar na hora certa)

- Arte: gerar no PixelLab pela `documentacao/Lista_de_Arte_e_Som.md` (o sistema já recebe sem mexer no código).
- Som: os arquivos da lista (o sistema já recebe; sem arquivo, bipe).
- Decisões do grupo: nome do jogo, cor do Guerreiro, tema padrão (usar valor provisório até lá).
- Fase 6: lembrar de apagar as contas TesteA e TesteB do ranking, explicando como.

## Regras que não mudam

- Nada pode travar o jogo (personagem preso, tela que não abre, save estragado). Testar esses casos em cada fase.
- Tudo o que é de teste (barra de teste, painel DEV, Subir nível, +300 de ouro) existe só no `npm run dev`.
- Congelamento em 22/11: depois disso, só correção, testes e documentação.
- Na Fase 5: prints de todas as telas em `documentacao/` como protótipos atualizados (TASK-121 a TASK-123).
