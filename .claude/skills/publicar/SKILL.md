---
name: publicar
description: Regra de commits e publicação do Jogo RPG no endereço principal (https://jogo-rpg-six.vercel.app = branch main) - juntar o ramo local no main, push, conferir o site publicado e voltar atrás se quebrar. Use no fim de cada fase, ao "publicar", "subir", "mandar para o main", "fazer deploy".
---

# Publicar (regra do Pablo, 09/10/2026)

- O único endereço do jogo é `https://jogo-rpg-six.vercel.app` e ele mostra sempre o `main`. A Vercel só publica o `main` (`programacao/vercel.json`, `git.deploymentEnabled`): nada de prévia por ramo.
- O trabalho pode ser feito num ramo **local** (`fase-5`, `ajustes`...), saído do `main`, com um commit por parte (testes passando; mensagem clara terminando com a linha `Co-Authored-By` do lembrete do sistema). Ramos locais não vão para o GitHub.
- Fora do modo contínuo, não commitar sem o Pablo pedir.

## No fim de cada fase

1. Rodar tudo (skill `verify`, seção 3): `npm test`, lint, build, `testar:navegador`, `testar:floresta`, `testar:reino`, `testar:arte`.
2. **Nunca publicar com teste falhando.** Com tudo passando:

```bash
git checkout main
git merge --no-ff <ramo> -m "<Fase X: resumo>"
git push origin main
```

3. Esperar a Vercel publicar e conferir o endereço principal (rodar em `programacao/`):

```bash
npm run conferir:configuracao     # diz também se o último main já está no ar ("o endereço principal está com o último main")
npm run testar:contas:publicado   # TEST-007 no site; se disser "conta A já estava em uso", rode npm run conferir:site
```

   O `gh` não está instalado: use o `conferir:configuracao` para saber do deploy.
4. Mandar os dois relatórios (skill `relatorio-de-fase`), com o "Teste visual para o Pablo" no endereço principal.
5. Atualizar o "Onde parei" do PLANO.md e commitar no `main` (push).

## Se o site quebrar depois de publicar

Voltar o `main` na hora com `git revert <commit>` (nunca apagar histórico, nunca `push --force`), push, e avisar o Pablo.

## Segurança (sempre)

- A chave secreta (secret / service_role) nunca entra no jogo; a segurança vem das políticas RLS.
- `.env*` fora do git, menos o `.env.example` (só os nomes).
- O e-mail e a senha do Pablo nunca vão para código, documentação ou GitHub.
- SQL já rodado não se edita: mudança vira arquivo novo numerado em `programacao/supabase/`, rodado pelo Pablo no SQL Editor.
