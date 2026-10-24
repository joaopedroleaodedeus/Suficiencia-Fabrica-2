# Todo List Notepad

Aplicação web de tarefas pessoais com autenticação (Prova de Suficiência — Fábrica de Software UTFPR-DV).

## Funcionalidades

- Cadastro, login e logout de usuários.
- CRUD de tarefas: criar, listar, ver detalhes, editar e excluir. O título é obrigatório; a descrição é opcional.
- Listagem das tarefas em ordem de criação.
- Cada usuário acessa somente as próprias tarefas.
- Senhas armazenadas somente como hash bcrypt.
- Sessão em cookie `httpOnly`, armazenada no SQLite com validade de 24 horas. O logout invalida a sessão no servidor.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco de dados: SQLite via better-sqlite3

## Estrutura do projeto

```
todo-list-notepad/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── database/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   └── tests/
│       └── api.test.js
├── docs/
│   ├── JIRA.md
│   └── jira-import.csv
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles.css
│       ├── services/
│       │   └── api.js
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── TasksPage.jsx
│       └── components/
│           ├── TaskForm.jsx
│           └── TaskDetails.jsx
├── .gitignore
└── README.md
```

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (versão LTS recomendada) e npm
- Git (para publicação no GitHub)

## Instalação

A partir da raiz do projeto:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Configuração

Copie o arquivo de exemplo para `backend/.env`.

No Windows:

```cmd
copy backend\.env.example backend\.env
```

No Linux ou macOS:

```bash
cp backend/.env.example backend/.env
```

As variáveis são opcionais. Sem o arquivo `.env`, os valores padrão são usados.

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3001` | Porta em que o backend é executado. |
| `DB_PATH` | `./data/todo.db` | Caminho do arquivo SQLite, relativo à pasta `backend`. |
| `COOKIE_SECURE` | `false` | Use `true` em produção com HTTPS. |

O projeto não possui segredos. A autenticação usa tokens aleatórios guardados no próprio banco SQLite, então nenhuma chave precisa ser configurada.

## Executar o backend

```bash
cd backend && npm start
```

O servidor sobe em http://localhost:3001. Para recarregar automaticamente ao salvar arquivos, use:

```bash
cd backend && npm run dev
```

## Executar o frontend

Em outro terminal, com o backend já em execução:

```bash
cd frontend && npm run dev
```

Acesse http://localhost:5173. O Vite encaminha as requisições `/api` para o backend em http://localhost:3001.

## Banco de dados

O arquivo `backend/data/todo.db` é criado automaticamente na primeira inicialização do backend, junto com as tabelas:

- `users`: usuários cadastrados, com o hash da senha.
- `tasks`: tarefas, vinculadas ao usuário dono.
- `sessions`: sessões ativas, identificadas pelo hash do token.

As chaves estrangeiras são ativadas (`PRAGMA foreign_keys = ON`). Os dados persistem entre reinícios do servidor. A pasta `backend/data` é ignorada pelo Git.

Para zerar o banco, pare o servidor e apague a pasta `backend/data`.

## Testes

```bash
cd backend && npm test
```

Os testes usam `node:test` e `supertest`, com um arquivo SQLite temporário criado a cada execução. Eles cobrem:

1. Registro de usuário, sem retornar `password_hash`.
2. Dados inválidos no registro: nome vazio, e-mail inválido e senha curta.
3. E-mail duplicado, inclusive com caixa diferente.
4. Login válido e consulta em `/api/auth/me`.
5. Senha errada e e-mail inexistente retornando 401.
6. Rotas de tarefas e `/api/auth/me` sem cookie retornando 401.
7. Criação de tarefa.
8. Listagem de três tarefas em ordem de criação.
9. Consulta de uma tarefa.
10. Edição de tarefa.
11. Exclusão de tarefa, seguida de 404 ao consultá-la.
12. Título vazio ou somente com espaços retornando 400, na criação e na edição.
13. Isolamento entre usuários: outro usuário recebe 404 em GET, PUT e DELETE, a lista não contém tarefas alheias e a tarefa original permanece intacta.
14. Persistência: após fechar e reabrir o banco, o login mostra as tarefas.
15. Logout com 204; depois, a rota de tarefas retorna 401, inclusive ao reenviar o cookie antigo.

## API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastra um usuário. Não realiza login. |
| POST | `/api/auth/login` | Autentica o usuário e grava o cookie de sessão. |
| POST | `/api/auth/logout` | Encerra a sessão e limpa o cookie. |
| GET | `/api/auth/me` | Retorna o usuário da sessão atual. |
| GET | `/api/tasks` | Lista as tarefas do usuário, em ordem de criação. |
| POST | `/api/tasks` | Cria uma tarefa. |
| GET | `/api/tasks/:id` | Retorna uma tarefa do usuário. |
| PUT | `/api/tasks/:id` | Atualiza o título e a descrição de uma tarefa. |
| DELETE | `/api/tasks/:id` | Exclui uma tarefa do usuário. |

Todas as rotas de tarefas e `/api/auth/me` exigem sessão válida.

## Build de produção (serviço único)

Gere o frontend compilado e, em seguida, inicie o backend:

```bash
cd frontend && npm run build
cd ../backend && npm start
```

Quando `frontend/dist/index.html` existe, o backend serve o frontend compilado. Acesse http://localhost:3001.

## Deploy

O SQLite grava o banco em um arquivo local, por isso o serviço de hospedagem precisa de disco persistente. Em serviços com sistema de arquivos efêmero, os dados são perdidos quando o serviço é reiniciado ou reimplantado.

Exemplo de configuração no Render:

1. Crie um Web Service conectado ao repositório no GitHub.
2. Deixe o campo Root Directory vazio.
3. Em Build Command, informe: `cd frontend && npm install && npm run build && cd ../backend && npm install`
4. Em Start Command, informe: `cd backend && npm start`
5. Adicione um Persistent Disk montado em `/var/data`.
6. Defina as variáveis de ambiente `DB_PATH=/var/data/todo.db` e `COOKIE_SECURE=true`.

No Render, disco persistente exige plano pago. Alternativas com o mesmo princípio são o Railway, com Volume, e o Fly.io, com volume: aponte `DB_PATH` para o volume e use `COOKIE_SECURE=true`.

Este README descreve a configuração de deploy; não indica que a aplicação esteja publicada.

## Publicação no GitHub

Crie um repositório público em https://github.com/new com o nome `todo-list-notepad`, sem README, `.gitignore` ou licença, pois esses arquivos já existem no projeto. Depois, na raiz do projeto, execute:

```bash
git init
git add .
git commit -m "Versão inicial do Todo List Notepad"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/todo-list-notepad.git
git push -u origin main
```

O `.gitignore` impede o envio de `.env`, `node_modules`, `frontend/dist` e do banco local.

## Gestão do projeto

- Planejamento no Jira: [docs/JIRA.md](docs/JIRA.md)
- Arquivo para importação no Jira: [docs/jira-import.csv](docs/jira-import.csv)

O planejamento está dividido em duas Sprints de 6 horas cada, totalizando 12 horas.
