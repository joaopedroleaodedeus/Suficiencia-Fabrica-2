# Planejamento no Jira — Todo List Notepad

Board: **Kanban** (colunas: A fazer → Em andamento → Concluído).
Duas Sprints de **6 horas** cada (total: **12 horas**).

> As tarefas abaixo estão prontas para cadastro manual no Jira. O arquivo
> [`jira-import.csv`](jira-import.csv) contém os mesmos dados no formato de importação CSV do Jira.
> Os identificadores reais (ex.: `TLN-1`) são gerados pelo Jira no momento do cadastro.

## Sprint 1 — Fundação e API (6h)

| # | Título | Estimativa |
|---|---|---|
| 1 | Planejamento e definição do escopo | 0,5h |
| 2 | Configuração do ambiente (React/Vite, Node/Express, SQLite) | 1h |
| 3 | Modelagem do banco SQLite | 0,5h |
| 4 | API de registro de usuários | 1h |
| 5 | API de login, logout e sessão | 1h |
| 6 | API CRUD de tarefas com isolamento por usuário | 1,5h |
| 7 | Testes iniciais da API de autenticação | 0,5h |
| | **Total** | **6h** |

### 1. Planejamento e definição do escopo — 0,5h
**Descrição:** Ler a prova, definir requisitos obrigatórios, stack e estrutura do projeto; criar o board e as Sprints.
**Critérios de conclusão:**
- Requisitos obrigatórios listados (autenticação, CRUD, isolamento, frontend, banco, GitHub, Jira).
- Stack definida: React + Vite, Node.js + Express, SQLite.
- Board Kanban com as duas Sprints criadas.

### 2. Configuração do ambiente — 1h
**Descrição:** Criar as pastas `frontend` (Vite + React) e `backend` (Express), instalar dependências e configurar o proxy `/api`.
**Critérios de conclusão:**
- `npm run dev` inicia o frontend em `http://localhost:5173`.
- `npm start` inicia o backend em `http://localhost:3001`.
- Requisições a `/api` feitas pelo frontend chegam ao backend.
- `package-lock.json` gerado nos dois projetos.

### 3. Modelagem do banco SQLite — 0,5h
**Descrição:** Criar as tabelas `users`, `tasks` e `sessions` automaticamente na inicialização.
**Critérios de conclusão:**
- Chaves primárias, chave estrangeira `tasks.user_id → users.id` e `PRAGMA foreign_keys = ON`.
- E-mail único (sem diferenciar maiúsculas/minúsculas) e título obrigatório.
- Arquivo do banco criado em `backend/data/todo.db` e mantido após reiniciar.

### 4. API de registro de usuários — 1h
**Descrição:** Implementar `POST /api/auth/register` com validação e hash de senha.
**Critérios de conclusão:**
- Senha armazenada somente como hash bcrypt.
- Nome, e-mail e senha validados (400 quando inválidos).
- E-mail duplicado retorna 409.
- Resposta não contém o hash da senha.

### 5. API de login, logout e sessão — 1h
**Descrição:** Implementar login, logout e `GET /api/auth/me` com sessão em cookie `httpOnly`.
**Critérios de conclusão:**
- Credenciais válidas → 200 e cookie de sessão; inválidas → 401.
- Middleware bloqueia rotas protegidas sem sessão (401).
- Após logout a sessão é invalidada no servidor.

### 6. API CRUD de tarefas com isolamento — 1,5h
**Descrição:** Implementar `GET/POST /api/tasks` e `GET/PUT/DELETE /api/tasks/:id` restritos ao dono.
**Critérios de conclusão:**
- Título vazio ou só com espaços → 400.
- Listagem ordenada por data de criação (mais antiga primeiro), desempate por id.
- Todas as consultas filtram pelo usuário da sessão; tarefa de outro usuário → 404.
- Consultas SQL parametrizadas.

### 7. Testes iniciais da API de autenticação — 0,5h
**Descrição:** Testes automatizados de registro, login e bloqueio sem autenticação.
**Critérios de conclusão:**
- `npm test` executa e passa os testes de registro, e-mail duplicado, login válido/inválido e acesso sem sessão.

## Sprint 2 — Interface, testes e entrega (6h)

| # | Título | Estimativa |
|---|---|---|
| 8 | Telas de login e registro | 1h |
| 9 | Interface de gerenciamento de tarefas | 1,5h |
| 10 | Identidade visual e responsividade | 0,5h |
| 11 | Integração frontend, backend e banco | 0,5h |
| 12 | Testes funcionais e de isolamento dos dados | 1h |
| 13 | Correções | 0,5h |
| 14 | Deploy | 0,5h |
| 15 | Documentação final e publicação no GitHub | 0,5h |
| | **Total** | **6h** |

### 8. Telas de login e registro — 1h
**Descrição:** Formulários de login (e-mail, senha) e registro (nome, e-mail, senha) com navegação entre eles.
**Critérios de conclusão:**
- Mensagens claras de erro (credenciais inválidas, e-mail duplicado, dados inválidos).
- Após o cadastro, exibe "Conta criada com sucesso! Faça login."
- Login leva à tela de tarefas.

### 9. Interface de gerenciamento de tarefas — 1,5h
**Descrição:** Lista de tarefas, detalhes, formulário reutilizado para criar/editar, exclusão e logout.
**Critérios de conclusão:**
- Criar, ver detalhes, editar e excluir funcionam pela interface.
- Exclusão pede confirmação.
- Mensagem "Nenhuma tarefa cadastrada." quando a lista está vazia.
- Botão "Sair" encerra a sessão.

### 10. Identidade visual e responsividade — 0,5h
**Descrição:** Aplicar o tema laranja claro (#FFB366), preto (#222222) e branco (#FFFFFF) com aparência de bloco de notas.
**Critérios de conclusão:**
- Cores aplicadas com contraste legível.
- Layout utilizável em 375px (celular), tablet e desktop sem rolagem horizontal.

### 11. Integração frontend, backend e banco — 0,5h
**Descrição:** Conectar a interface à API com cookies de sessão e tratar sessão expirada.
**Critérios de conclusão:**
- A sessão é restaurada ao recarregar a página (`/api/auth/me`).
- Resposta 401 em qualquer operação leva de volta ao login.
- Erros de rede exibem mensagem ao usuário.

### 12. Testes funcionais e de isolamento dos dados — 1h
**Descrição:** Completar a suíte automatizada da API e testar os fluxos principais da interface.
**Critérios de conclusão:**
- Testes cobrem CRUD, título inválido, isolamento entre dois usuários, persistência após reinício e logout.
- Fluxo da interface (registro → login → CRUD → logout) verificado no navegador.
- Todos os testes passando.

### 13. Correções — 0,5h
**Descrição:** Corrigir os problemas encontrados nos testes.
**Critérios de conclusão:**
- Nenhum teste falhando.
- Nenhum erro no console do navegador nos fluxos principais.

### 14. Deploy — 0,5h
**Descrição:** Publicar a aplicação em um serviço com disco persistente para o arquivo SQLite (backend servindo o build do frontend).
**Critérios de conclusão:**
- Aplicação acessível por URL pública com `COOKIE_SECURE=true`.
- Banco em volume persistente (dados mantidos após reinício do serviço).
- Ou, se inviável, limitações documentadas no README.

### 15. Documentação final e publicação no GitHub — 0,5h
**Descrição:** README completo e código em repositório público.
**Critérios de conclusão:**
- README com pré-requisitos, instalação, configuração, execução, banco e testes.
- `.gitignore` exclui `node_modules`, `.env`, `dist` e o banco local.
- Repositório público acessível no GitHub.
