# Todo List Notepad

Aplicação web de tarefas pessoais com autenticação, desenvolvida para a Prova de Suficiência da Fábrica de Software (UTFPR-DV).

## Funcionalidades

- Cadastro de usuário (nome, e-mail e senha), login e logout.
- CRUD de tarefas: criar, listar, ver detalhes, editar e excluir.
- Título obrigatório e descrição opcional.
- Tarefas listadas em ordem de criação.
- Cada usuário vê e altera somente as próprias tarefas.
- Senhas salvas apenas como hash (bcrypt).

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Banco de dados | SQLite (biblioteca `better-sqlite3`) |

O SQLite não precisa ser instalado. Ele é um banco embutido: o pacote `better-sqlite3`, instalado pelo `npm install`, já traz o SQLite, e o banco é um arquivo criado pelo próprio backend.

## Pré-requisitos

- [Node.js](https://nodejs.org) versão LTS (22.12 ou mais recente; testado com o Node 24). O npm já vem junto.
- [Visual Studio Code](https://code.visualstudio.com).
- [Git](https://git-scm.com), para clonar o repositório.

## Executar no Visual Studio Code

1. Clone o repositório:
   ```
   git clone https://github.com/joaopedroleaodedeus/Suficiencia-Fabrica-2.git
   ```
2. No VS Code, abra a pasta clonada em **File → Open Folder**.
3. Abra um terminal em **Terminal → New Terminal** e instale as dependências do backend:
   ```
   cd backend
   npm install
   ```
4. Rode os testes automatizados (opcional, mas recomendado):
   ```
   npm test
   ```
   O resultado esperado é `pass 16` e `fail 0`.
5. Inicie o backend:
   ```
   npm start
   ```
   Deve aparecer `Servidor rodando em http://localhost:3001`. Deixe esse terminal aberto.
6. Abra um **segundo terminal** (botão **+** no painel de terminais) e inicie o frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
7. Acesse **http://localhost:5173** no navegador.

Para parar, clique em cada terminal e pressione **Ctrl + C**.

### Problemas comuns

| Problema | Solução |
|---|---|
| `npm não é reconhecido` | O Node.js não está instalado, ou o VS Code foi aberto antes da instalação. Instale o Node.js, feche todas as janelas do VS Code e abra de novo. |
| `a execução de scripts foi desabilitada` (PowerShell) | Use `npm.cmd` no lugar de `npm` (ex.: `npm.cmd start`) ou rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| A tela mostra "Não foi possível conectar ao servidor." | O backend não está rodando. Inicie-o (passo 5) antes do frontend. |
| Porta 3001 ou 5173 em uso | Feche o terminal que já está executando a aplicação. |

## Validação manual

Com a aplicação rodando, confira os requisitos da prova:

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Criar uma conta | Mensagem "Conta criada com sucesso! Faça login." |
| 2 | Criar outra conta com o mesmo e-mail | Erro "E-mail já cadastrado." |
| 3 | Fazer login com senha errada | Erro "E-mail ou senha inválidos." |
| 4 | Fazer login correto | Abre a tela de tarefas |
| 5 | Criar tarefa com título vazio ou só com espaços | Erro "O título é obrigatório." |
| 6 | Criar duas ou três tarefas | Aparecem na ordem em que foram criadas |
| 7 | Usar **Ver**, **Editar** e **Excluir** | Detalhes exibidos, alteração salva e exclusão após confirmação |
| 8 | Isolamento: entrar com um segundo usuário em uma **janela anônima** | O segundo usuário não vê as tarefas do primeiro |
| 9 | Persistência: parar o backend (Ctrl + C), rodar `npm start` de novo e recarregar a página | As tarefas continuam lá |
| 10 | Clicar em **Sair** | Volta para o login; as tarefas não ficam acessíveis |
| 11 | Responsividade: F12 → modo dispositivo → largura de 375px | Layout sem rolagem horizontal |

## Testes automatizados

```
cd backend
npm test
```

Os 16 testes (`backend/tests/api.test.js`) usam um banco temporário e cobrem:
- registro, dados inválidos e e-mail duplicado;
- login válido e inválido;
- bloqueio de rotas sem login;
- criar, listar em ordem, consultar, editar e excluir tarefas;
- título vazio;
- isolamento entre usuários;
- persistência após reabrir o banco;
- logout invalidando a sessão.

## Banco de dados (SQLite)

- **Arquivo:** `backend/data/todo.db`, criado automaticamente na primeira vez que o backend inicia. Os arquivos `todo.db-wal` e `todo.db-shm` ao lado dele são normais no SQLite.
- **Tabelas:**
  - `users` (nome, e-mail único, hash da senha);
  - `tasks` (título, descrição, data de criação e `user_id` com chave estrangeira para `users`);
  - `sessions` (sessões de login).
- **Versionamento:** o arquivo do banco não vai para o GitHub (`.gitignore`).
- **Zerar os dados:** pare o backend e apague a pasta `backend/data`.
- **Inspecionar o banco (opcional):** instale uma extensão do VS Code como **SQLite Viewer** e abra o `todo.db`.

## Configuração (opcional)

Nenhuma configuração é obrigatória. Para mudar os padrões, copie `backend/.env.example` para `backend/.env`:

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3001` | Porta do backend |
| `DB_PATH` | `./data/todo.db` | Caminho do arquivo SQLite |
| `COOKIE_SECURE` | `false` | `true` em produção com HTTPS |

O projeto não usa senhas nem chaves secretas no código.

## API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Entrar (cria a sessão) |
| POST | `/api/auth/logout` | Sair (encerra a sessão) |
| GET | `/api/auth/me` | Usuário logado |
| GET | `/api/tasks` | Listar tarefas do usuário |
| POST | `/api/tasks` | Criar tarefa |
| GET | `/api/tasks/:id` | Ver tarefa |
| PUT | `/api/tasks/:id` | Editar tarefa |
| DELETE | `/api/tasks/:id` | Excluir tarefa |

As rotas de tarefas e `/api/auth/me` exigem login. A tarefa de outro usuário retorna 404.

## Estrutura

```
backend/
  server.js          inicia o servidor
  app.js             configuração do Express
  database/db.js     conexão e criação das tabelas SQLite
  middleware/auth.js verificação de login
  routes/            rotas de autenticação e de tarefas
  tests/             testes automatizados
frontend/
  src/pages/         telas de login, cadastro e tarefas
  src/components/    formulário e detalhes da tarefa
  src/services/api.js chamadas à API
```

## Deploy

A aplicação é executada localmente, o que a prova permite. Para publicar, use um serviço com **disco persistente**, por exemplo Render com Persistent Disk ou Railway com Volume, porque o SQLite grava em arquivo. Passos:
1. Rode `npm run build` em `frontend`.
2. Inicie com `npm start` em `backend`; o backend também serve o frontend compilado.
3. Defina `DB_PATH` apontando para o disco persistente e `COOKIE_SECURE=true`.

## Gestão do projeto

Board Kanban no Jira com duas Sprints de 6 horas: https://joaopedrofernandes.atlassian.net/jira/software/projects/TSF2/summary