# Supabase: passo a passo para o Pablo

As contas (cadastro, login, sessão única, save na nuvem, ranking e histórico) da Fase 2 usam o Supabase. Algumas coisas só dá para fazer no painel do Supabase, com a conta do Pablo; este arquivo diz exatamente onde clicar. Os nomes dos menus do site podem mudar um pouco.

- **Parte 1 (TASK-090): FEITA em 08/10/2026.** Projeto criado, confirmação de e-mail ligada e e-mails chegando. A URL e a chave publicável estão no `programacao/.env.local` (fora do GitHub).
- **Parte 2 (Fase 2): feita (09/10).** SQL rodado, tabelas protegidas, confirmação de e-mail ligada, Site URL na Vercel, localhost nas Redirect URLs e as duas contas de teste no `.env.local` (o `npm run conferir:configuracao` confere tudo). Desde 09/10 o jogo tem um endereço só: o padrão das prévias (`https://jogo-rpg-*.vercel.app/**`) deve sair das Redirect URLs.

**Para conferir tudo de uma vez** (só lê, não muda nada): dentro de `programacao`, rode `npm run conferir:configuracao`. Ele diz o que está certo e, para o que faltar, o que fazer.

---

## Parte 1 (feita): criar o projeto e testar o e-mail

1. Em https://supabase.com, **New project**: nome `jogo-rpg`, região South America (São Paulo), plano Free, com a senha do banco guardada fora do projeto.
2. **Authentication → Sign In / Providers**: **Email** ligado e **Confirm email** ligado (RF02).
3. Teste do e-mail: convite e recuperação de senha pelo painel. Os dois chegaram.
4. No `programacao/.env.local` (o `.gitignore` não deixa ele ir para o GitHub):

   ```
   VITE_SUPABASE_URL=https://<id-do-projeto>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   O jogo usa só a chave **publicável**. A chave secreta (secret / service_role) e a senha do banco **nunca** entram no projeto: quem protege os dados são as regras de segurança (RLS) do SQL.

---

## Parte 2 (Fase 2): o que o Pablo faz agora

São uns 20 minutos. No fim, me mande uma frase como "SQL rodado, URLs configuradas e contas de teste no .env.local".

### Passo A · Rodar o SQL (cria as tabelas e as regras de segurança)

1. Abra o painel do Supabase e entre no projeto **jogo-rpg**.
2. No menu da esquerda, clique em **SQL Editor** (ícone `>_`).
3. Clique em **New query** (ou no **+** no alto da lista).
4. No VS Code, abra o arquivo `programacao/supabase/001_contas.sql`, aperte **Ctrl+A** e depois **Ctrl+C**.
5. Volte ao SQL Editor, clique dentro da área de texto, aperte **Ctrl+V** e depois clique em **Run** (ou **Ctrl+Enter**).
6. Se aparecer um aviso de "operação destrutiva" (por causa das linhas `drop policy if exists` e `drop trigger if exists`), clique em **Run this query**: essas linhas só apagam uma regra antiga com o mesmo nome antes de criar de novo. Nenhum dado é apagado.
7. Deve aparecer **Success. No rows returned**.
8. Para conferir: no menu da esquerda, abra **Table Editor**. Devem aparecer as tabelas `perfis`, `sessoes`, `saves` e `partidas`, cada uma **sem** o aviso vermelho "RLS disabled".

Se aparecer um erro vermelho, copie a mensagem e me mande; não tente consertar no painel.

### Passo B · Endereços dos links de e-mail (confirmação e senha nova)

Os links dos e-mails voltam para o endereço de onde o jogo foi aberto (o localhost no seu computador; a Vercel na internet). O Supabase só aceita voltar para os endereços desta lista.

1. No menu da esquerda, abra **Authentication → URL Configuration**.
2. **Site URL:** o endereço principal da Vercel, `https://jogo-rpg-six.vercel.app` (antes da Vercel, era `http://localhost:5173`). Clique em **Save**.
3. Em **Redirect URLs**, clique em **Add URL** para cada um que faltar. A lista tem que ter os três:
   - `http://localhost:5173/**` (o jogo no seu computador, `npm run dev`);
   - `https://jogo-rpg-six.vercel.app/**` (o endereço principal da Vercel);
   - ~~`https://jogo-rpg-*.vercel.app/**`~~ **não use mais** (era das prévias por ramo, que acabaram em 09/10). Um padrão com `*` no `vercel.app` aceita o endereço de qualquer projeto da Vercel com esse começo de nome, de qualquer pessoa: um link de "esqueci minha senha" poderia voltar para o site de outra pessoa. Se ele estiver na lista, apague (o `conferir:configuracao` avisa).
4. Clique em **Save URLs**.

### Passo C · Tamanho mínimo da senha (para bater com o jogo)

1. **Authentication → Sign In / Providers → Email**.
2. Em **Minimum password length**, coloque **8** (o jogo já pede 8). Clique em **Save**.

### Passo D · Duas contas de teste (para o roteiro automático das contas)

O roteiro `npm run testar:contas` entra com duas contas de verdade para conferir a sessão única, o save antigo recusado, a conta A tentando mexer na B, a queda de internet e o ranking (TEST-007).

1. **Authentication → Users → Add user → Create new user**.
2. **Email:** um e-mail seu com um apelido no endereço. No Gmail, colocar `+testea` antes do `@` cria um endereço novo que chega na mesma caixa (por exemplo, `seunome+testea@gmail.com`).
3. **Password:** uma senha com pelo menos 8 caracteres, só para teste.
4. Marque **Auto Confirm User** e clique em **Create user**.
5. Repita com `+testeb` para a conta B.
6. Abra `programacao/.env.local` no VS Code e acrescente, com os seus valores:

   ```
   TESTE_CONTA_A_EMAIL=seunome+testea@gmail.com
   TESTE_CONTA_A_SENHA=senha-da-conta-a
   TESTE_CONTA_B_EMAIL=seunome+testeb@gmail.com
   TESTE_CONTA_B_SENHA=senha-da-conta-b
   ```

7. Salve. Esse arquivo não vai para o GitHub.

No primeiro login, o jogo pede um apelido para essas contas (elas foram criadas pelo painel, sem apelido); o roteiro escolhe `TesteA` e `TesteB` sozinho. Elas aparecem no ranking. Antes da entrega, dá para apagá-las em **Authentication → Users** (os dados delas somem junto).

### Passo E · E-mail próprio (SMTP): só se o e-mail não chegar para outras pessoas

O envio padrão do Supabase serve para testar, mas tem um limite baixo de e-mails por hora e pode só entregar para quem é membro do projeto. **Teste:** peça para o Uener ou o Lucas criar uma conta no jogo. Se o e-mail de confirmação não chegar em uns 5 minutos (veja o spam), configure um e-mail próprio. O mais simples é um Gmail com "senha de app":

1. Na conta Google que vai enviar os e-mails (pode ser uma conta nova só para o jogo), ligue a **Verificação em duas etapas** (https://myaccount.google.com/security).
2. Abra https://myaccount.google.com/apppasswords, dê o nome `Supabase` e clique em **Criar**. Copie a senha de 16 letras que aparece.
3. No Supabase: **Authentication → Emails → SMTP Settings** (ou **Project Settings → Authentication → SMTP**), ligue **Enable Custom SMTP** e preencha:
   - **Sender email:** o Gmail que vai enviar;
   - **Sender name:** o nome do jogo (por enquanto, `Jogo RPG`);
   - **Host:** `smtp.gmail.com`;
   - **Port:** `465`;
   - **Username:** o mesmo Gmail;
   - **Password:** a senha de app de 16 letras.
4. Clique em **Save**. Depois, em **Authentication → Rate Limits**, confira o limite de e-mails por hora (30 já basta para os testes).
5. Peça para a pessoa tentar de novo (no Login, o botão **Reenviar e-mail de confirmação** aparece quando a conta ainda não foi confirmada).

### Passo F (opcional) · E-mails em português

Os e-mails padrão vêm em inglês. Para traduzir: **Authentication → Emails → Templates**.

- **Confirm signup**, assunto `Confirme seu e-mail`, corpo:

  ```html
  <h2>Bem-vindo ao jogo!</h2>
  <p>Clique no link abaixo para confirmar o seu e-mail e começar a jogar com a sua conta:</p>
  <p><a href="{{ .ConfirmationURL }}">Confirmar meu e-mail</a></p>
  <p>Se você não criou uma conta, ignore este e-mail.</p>
  ```

- **Reset password**, assunto `Crie uma senha nova`, corpo:

  ```html
  <h2>Senha nova</h2>
  <p>Clique no link abaixo para criar uma senha nova para a sua conta:</p>
  <p><a href="{{ .ConfirmationURL }}">Criar senha nova</a></p>
  <p>Se você não pediu, ignore este e-mail: a senha continua a mesma.</p>
  ```

Não mude o `{{ .ConfirmationURL }}`: é ele que leva de volta ao jogo.

---

## Como fica a segurança (resumo)

- Cada conta só lê o próprio perfil, o próprio save e as próprias partidas (RLS).
- Ninguém escreve direto no save nem na sessão: só as funções do SQL, que conferem quem está logado, a sessão ativa e a versão do save (uma versão antiga nunca passa por cima de uma mais nova).
- O ranking é público (até sem login), mas mostra só apelido e números.
- O jogo publicado só tem a chave publicável. A chave secreta não está em lugar nenhum do projeto.

Detalhes de cada tabela e função: `programacao/supabase/README.md`.
