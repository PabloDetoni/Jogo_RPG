# Supabase: passo a passo para o Pablo (TASK-090)

As contas (login, cadastro, ranking, histórico) da Fase 2 usam o Supabase. Criar o projeto e testar o e-mail é algo que só uma pessoa da equipe consegue fazer, com a própria conta. Escrito em 08/10/2026; os nomes dos menus do site podem mudar um pouco.

## 1. Criar o projeto (uns 10 minutos)

1. Entre em https://supabase.com e clique em **Start your project**. Dá para entrar com a conta do GitHub.
2. Clique em **New project**:
   - **Name:** `jogo-rpg` (ou o nome do jogo, quando o grupo decidir);
   - **Database Password:** clique em **Generate a password** e **guarde essa senha** num lugar seguro (ela não vai para o código);
   - **Region:** South America (São Paulo);
   - **Plano:** Free.
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Ligar a confirmação de e-mail

1. No menu da esquerda, abra **Authentication → Sign In / Providers** (ou **Providers**) e confira que **Email** está ligado.
2. Confira que **Confirm email** está ligado (a confirmação de e-mail é obrigatória, RF02).
3. Em **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:5173`;
   - em **Redirect URLs**, acrescente `http://localhost:5173/**`.

## 3. Testar se o e-mail chega (o teste da TASK-090)

1. Em **Authentication → Users**, clique em **Add user → Send invitation** e mande para o seu e-mail.
2. Anote:
   - se o e-mail chegou;
   - quanto tempo levou;
   - se caiu no spam.
3. Clique nos três pontinhos do usuário e use **Send password recovery** (recuperação de senha). Anote o mesmo.
4. Repita com um segundo e-mail (de outra pessoa do grupo ou de outro provedor, Gmail e Outlook, por exemplo).

O envio padrão do Supabase tem um limite baixo de e-mails por hora no plano grátis. Se os e-mails não chegarem, demorarem muito ou o limite atrapalhar os testes, o próximo passo é configurar um serviço de e-mail próprio (SMTP), e eu passo outro passo a passo para isso.

## 4. Me passar o endereço e a chave (sem colocar no GitHub)

1. Abra **Project Settings → API** (ou **Data API**) e copie:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`);
   - a chave **anon** / **public** (uma linha comprida).
2. Dentro da pasta `programacao`, crie um arquivo chamado `.env.local` com estas duas linhas, trocando pelos seus valores:

   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=cole-aqui-a-chave-anon
   ```

3. Esse arquivo **não vai para o GitHub**: o `.gitignore` já o ignora. **Nunca** coloque a chave **service_role** nem a senha do banco no projeto.
4. Me avise com uma frase como "Supabase pronto, o e-mail chegou em X minutos" ou "Supabase pronto, o e-mail não chegou".

## 5. O que eu faço depois

1. Pergunto antes de instalar a biblioteca do Supabase (`@supabase/supabase-js`), como manda o protocolo.
2. Crio as tabelas (perfis com apelido único, progresso com versão, partidas para o ranking e o histórico), com as regras de segurança: cada um só mexe nos próprios dados.
3. Ligo o cadastro, o login, a confirmação de e-mail, o "esqueci minha senha", a sessão única e a passagem do progresso do convidado para a conta.

Enquanto isso não estiver pronto, eu adianto a Fase 3 (mundo da Floresta) e volto às contas depois.
