# Vercel: passo a passo para o Pablo

A Vercel publica o jogo na internet a partir do GitHub (decidido pelo Pablo em 08/10/2026; adianta a TASK-130). Cada vez que o `main` do GitHub recebe commits novos, a Vercel monta o jogo de novo sozinha; os outros ramos não são publicados (desde 09/10, um endereço só). Escrito em 08/10/2026; os nomes dos menus do site podem mudar um pouco.

**Endereço do jogo:** `https://jogo-rpg-six.vercel.app` (criado pelo Pablo em 09/10; o `-six` veio da Vercel porque `jogo-rpg.vercel.app` já era de outra pessoa). Para conferir a Vercel e o Supabase de uma vez: `npm run conferir:configuracao`, dentro de `programacao`.

## Como o projeto está preparado

- O jogo fica na pasta `programacao` do repositório (é a **Root Directory**).
- É um projeto **Vite**: a Vercel instala com `npm install`, monta com `npm run build` e publica a pasta `dist`.
- O jogo é uma página só (as telas mudam sem trocar de endereço). O `programacao/vercel.json` só diz à Vercel para publicar apenas o `main` (`git.deploymentEnabled`: `main` sim, todos os outros ramos não).
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

## 3. Um endereço só (desde 09/10)

O jogo tem um endereço só: `https://jogo-rpg-six.vercel.app`, que mostra sempre o `main` e é aberto para todos. A Vercel não monta mais prévias de outros ramos (o `vercel.json` desliga), então não é preciso mexer em nada no painel.

- **Deployment Protection:** pode ficar como está. Ela só protegia as prévias; o endereço principal continua aberto.
- **Prévias antigas** (dos ramos `fase-2` e `fase-3`): continuam na lista de **Deployments**, protegidas pelo login da Vercel. Não atrapalham; se quiser limpar, clique nos três pontinhos de cada uma e em **Delete**.

## 4. Avisar o Supabase dos endereços da Vercel

Sem isso, os links de confirmação e de senha nova que saem do jogo publicado não voltam para ele.

1. No Supabase: **Authentication → URL Configuration**.
2. **Site URL:** troque para o endereço principal da Vercel, `https://jogo-rpg-six.vercel.app`, e clique em **Save**.
3. Em **Redirect URLs**, deixe estes (clique em **Add URL** para cada um que faltar) e clique em **Save URLs**:
   - `http://localhost:5173/**` (o jogo no seu computador);
   - `https://jogo-rpg-six.vercel.app/**` (o endereço principal).
4. Se ainda estiver na lista `https://jogo-rpg-*.vercel.app/**` (das prévias antigas), apague: um padrão com `*` no `vercel.app` aceita o endereço de qualquer projeto da Vercel com esse começo de nome, de qualquer pessoa.

## 5. Como cada fase é publicada (desde 09/10)

1. O Claude roda todos os testes (`npm test`, lint, build e os roteiros do navegador). Com algum falhando, nada é publicado.
2. Com tudo passando, a fase junta no `main` e vai para o GitHub.
3. A Vercel monta e publica sozinha (1 ou 2 minutos). O `npm run conferir:configuracao` diz se o último `main` já está no ar, e o `npm run testar:contas:publicado` joga as contas e a Floresta no endereço principal.
4. Você testa no endereço principal.
5. Se algo quebrar no site, o Claude volta o `main` para a versão anterior na hora (`git revert`, sem apagar histórico) e avisa.

## 6. Se der errado

- **"Build failed" na Vercel:** abra o deployment, clique em **Building** e copie as últimas linhas vermelhas para mim.
- **O jogo abre, mas o Login diz "As contas estão indisponíveis agora":** faltam as variáveis do passo 2.5 (ou estão com o nome errado). Corrija em **Settings → Environment Variables** e depois, em **Deployments**, clique nos três pontinhos do último deployment e em **Redeploy**.
- **O link do e-mail abre o localhost em vez da Vercel (ou dá erro):** confira o passo 4.
