# Vercel: passo a passo para o Pablo

A Vercel publica o jogo na internet a partir do GitHub (decidido pelo Pablo em 08/10/2026; adianta a TASK-130). Cada vez que um ramo do GitHub recebe commits novos, a Vercel monta o jogo de novo sozinha. Escrito em 08/10/2026; os nomes dos menus do site podem mudar um pouco.

## Como o projeto está preparado

- O jogo fica na pasta `programacao` do repositório (é a **Root Directory**).
- É um projeto **Vite**: a Vercel instala com `npm install`, monta com `npm run build` e publica a pasta `dist`.
- O jogo é uma página só (as telas mudam sem trocar de endereço), então não precisa de `vercel.json`.
- O endereço e a chave publicável do Supabase entram como **variáveis de ambiente** da Vercel (as mesmas do `.env.local`, que não vai para o GitHub).
- A barra de teste, o painel `</> DEV`, "Subir nível" e "+300 de ouro" não existem no jogo publicado: só no `npm run dev`. Na partida publicada, a faixa de baixo mostra só as teclas.

## 1. Criar a conta e importar o repositório (uns 10 minutos)

1. Entre em https://vercel.com e clique em **Sign Up**. Escolha o plano **Hobby** (grátis) e **Continue with GitHub**.
2. Na página inicial, clique em **Add New… → Project**.
3. Em **Import Git Repository**, ache o repositório do jogo e clique em **Import**.
   - Se ele não aparecer, clique em **Adjust GitHub App Permissions** e dê acesso a esse repositório.

## 2. Configurar o projeto (a tela "Configure Project")

1. **Project Name:** `jogo-rpg` (vira parte do endereço, por exemplo `jogo-rpg.vercel.app`).
2. **Root Directory:** clique em **Edit**, escolha a pasta **`programacao`** e clique em **Continue**.
3. **Framework Preset:** deve aparecer **Vite** sozinho. Se não, escolha Vite na lista.
4. **Build and Output Settings** (deixe como está, só confira):
   - **Build Command:** `npm run build`;
   - **Output Directory:** `dist`;
   - **Install Command:** `npm install`.
5. **Environment Variables:** acrescente as duas, copiando os valores do seu `programacao/.env.local`:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | o endereço do Supabase (começa com `https://` e termina com `.supabase.co`) |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | a chave publicável (começa com `sb_publishable_`) |

   **Nunca** coloque aqui a chave secreta (secret / service_role). As variáveis `TESTE_CONTA_...` também não vão para a Vercel: são só do roteiro de testes no seu computador.
6. Clique em **Deploy** e espere 1 ou 2 minutos.
7. Quando aparecer **Congratulations**, clique em **Continue to Dashboard**. O endereço do jogo aparece em **Domains** (por exemplo, `https://jogo-rpg.vercel.app`). Me mande esse endereço.

## 3. Deixar as prévias abertas para o teste em outra máquina

A Vercel publica dois tipos de endereço:

- **Produção:** o ramo `main` do GitHub, no endereço principal (`jogo-rpg.vercel.app`). É aberto para todos.
- **Prévia:** qualquer outro ramo (por exemplo, `fase-2`), num endereço próprio, como `jogo-rpg-git-fase-2-....vercel.app`. Por padrão, só quem está logado na Vercel consegue abrir.

Para o grupo e outra máquina conseguirem abrir a prévia:

1. No projeto, abra **Settings → Deployment Protection**.
2. Em **Vercel Authentication**, escolha **Disabled** e clique em **Save**.

## 4. Avisar o Supabase dos endereços da Vercel

Sem isso, os links de confirmação e de senha nova que saem do jogo publicado não voltam para ele.

1. No Supabase: **Authentication → URL Configuration**.
2. **Site URL:** troque para o endereço principal da Vercel (por exemplo, `https://jogo-rpg.vercel.app`) e clique em **Save**.
3. Em **Redirect URLs**, deixe estes (clique em **Add URL** para cada um que faltar) e clique em **Save URLs**:
   - `http://localhost:5173/**` (o jogo no seu computador);
   - `https://jogo-rpg.vercel.app/**` (troque pelo seu endereço);
   - `https://jogo-rpg-*.vercel.app/**` (as prévias de teste).

## 5. A publicação de teste da Fase 2

O código da Fase 2 fica nos commits do seu computador até o seu teste visual. Para a Vercel montar a Fase 2 sem mexer no `main`, o caminho é publicar um **ramo de teste**:

1. Com o seu ok, eu mando os commits para um ramo novo no GitHub chamado `fase-2` (o `main` continua como está).
2. A Vercel monta a prévia sozinha. Em **Deployments**, aparece uma linha com o ramo `fase-2`; clique nela e depois em **Visit** para abrir.
3. Use esse endereço nos testes (inclusive em outra máquina).
4. Depois da sua aprovação, os commits vão para o `main`, e o endereço principal passa a ter a Fase 2.

## 6. Se der errado

- **"Build failed" na Vercel:** abra o deployment, clique em **Building** e copie as últimas linhas vermelhas para mim.
- **O jogo abre, mas o Login diz "As contas estão indisponíveis agora":** faltam as variáveis do passo 2.5 (ou estão com o nome errado). Corrija em **Settings → Environment Variables** e depois, em **Deployments**, clique nos três pontinhos do último deployment e em **Redeploy**.
- **O link do e-mail abre o localhost em vez da Vercel (ou dá erro):** confira o passo 4.
