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
