const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { openDatabase } = require('../database/db');
const { createApp } = require('../app');

let dir, dbFile, db, app;
const userA = { name: 'Ana', email: 'ana@example.com', password: 'senha12345' };
const userB = { name: 'Beto', email: 'beto@example.com', password: 'outra12345' };

before(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
  dbFile = path.join(dir, 'test.db');
  db = openDatabase(dbFile);
  app = createApp({ db, secureCookies: false });
});

after(() => {
  try { db.close(); } catch {}
  fs.rmSync(dir, { recursive: true, force: true });
});

// Registra e loga um usuário, devolvendo um agente com o cookie
async function loggedAgent(user, appInstance = app) {
  const agent = request.agent(appInstance);
  await agent.post('/api/auth/login').send({ email: user.email, password: user.password }).expect(200);
  return agent;
}

test('1. registro cria usuário sem logar e sem password_hash', async () => {
  const res = await request(app).post('/api/auth/register').send(userA);
  assert.equal(res.status, 201);
  assert.equal(res.body.user.email, userA.email);
  assert.equal(res.body.user.name, 'Ana');
  assert.ok(res.body.user.id);
  assert.ok(!JSON.stringify(res.body).includes('password'));
  assert.equal(res.headers['set-cookie'], undefined);
  await request(app).post('/api/auth/register').send(userB).expect(201);
});

test('2. registro com dados inválidos retorna 400', async () => {
  const r1 = await request(app).post('/api/auth/register').send({ ...userA, email: 'x1@example.com', name: '  ' });
  assert.equal(r1.status, 400);
  assert.equal(r1.body.error, 'Nome é obrigatório.');
  const r2 = await request(app).post('/api/auth/register').send({ ...userA, email: 'invalido' });
  assert.equal(r2.status, 400);
  assert.equal(r2.body.error, 'E-mail inválido.');
  const r3 = await request(app).post('/api/auth/register').send({ ...userA, email: 'x2@example.com', password: '123' });
  assert.equal(r3.status, 400);
  assert.equal(r3.body.error, 'A senha deve ter entre 8 e 72 caracteres.');
  const r4 = await request(app).post('/api/auth/register').send({ name: 123, email: 'x3@example.com', password: 'senha12345' });
  assert.equal(r4.status, 400);
});

test('3. e-mail duplicado com caixa diferente retorna 409', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...userA, email: '  ANA@Example.COM ' });
  assert.equal(res.status, 409);
  assert.equal(res.body.error, 'E-mail já cadastrado.');
});

test('4. login válido define cookie e /me retorna o usuário', async () => {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email: 'ANA@example.com', password: userA.password });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, userA.email);
  assert.ok(!JSON.stringify(res.body).includes('password'));
  const cookie = res.headers['set-cookie'][0];
  assert.match(cookie, /sid=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  const me = await agent.get('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, 'Ana');
});

test('5. senha errada e e-mail inexistente retornam 401', async () => {
  const r1 = await request(app).post('/api/auth/login').send({ email: userA.email, password: 'errada12345' });
  assert.equal(r1.status, 401);
  assert.equal(r1.body.error, 'E-mail ou senha inválidos.');
  const r2 = await request(app).post('/api/auth/login').send({ email: 'naoexiste@example.com', password: 'qualquer123' });
  assert.equal(r2.status, 401);
  assert.equal(r2.body.error, 'E-mail ou senha inválidos.');
  await request(app).post('/api/auth/login').send({ email: userA.email }).expect(400);
});

test('6. rotas protegidas sem cookie retornam 401', async () => {
  await request(app).get('/api/auth/me').expect(401);
  await request(app).get('/api/tasks').expect(401);
  await request(app).post('/api/tasks').send({ title: 'x' }).expect(401);
  await request(app).get('/api/tasks/1').expect(401);
  await request(app).put('/api/tasks/1').send({ title: 'x' }).expect(401);
  await request(app).delete('/api/tasks/1').expect(401);
});

test('7. criar tarefa', async () => {
  const agent = await loggedAgent(userA);
  const res = await agent.post('/api/tasks').send({ title: '  Comprar pão  ', description: 'Integral' });
  assert.equal(res.status, 201);
  assert.equal(res.body.task.title, 'Comprar pão');
  assert.equal(res.body.task.description, 'Integral');
  assert.ok(res.body.task.id && res.body.task.created_at);
  assert.equal(res.body.task.user_id, undefined);
  const semDesc = await agent.post('/api/tasks').send({ title: 'Sem descrição' });
  assert.equal(semDesc.status, 201);
  assert.equal(semDesc.body.task.description, '');
});

test('8. listar tarefas em ordem de criação', async () => {
  const agent = await loggedAgent(userB);
  for (const t of ['Primeira', 'Segunda', 'Terceira']) {
    await agent.post('/api/tasks').send({ title: t }).expect(201);
  }
  const res = await agent.get('/api/tasks');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.tasks.map((t) => t.title), ['Primeira', 'Segunda', 'Terceira']);
});

test('9. consultar uma tarefa e id inválido', async () => {
  const agent = await loggedAgent(userA);
  const created = await agent.post('/api/tasks').send({ title: 'Ler', description: 'Livro' });
  const res = await agent.get(`/api/tasks/${created.body.task.id}`);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.task, created.body.task);
  const bad = await agent.get('/api/tasks/abc');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error, 'ID inválido.');
  await agent.get('/api/tasks/0').expect(400);
});

test('10. editar tarefa', async () => {
  const agent = await loggedAgent(userA);
  const created = await agent.post('/api/tasks').send({ title: 'Antigo', description: 'a' });
  const res = await agent.put(`/api/tasks/${created.body.task.id}`).send({ title: ' Novo ', description: 'b' });
  assert.equal(res.status, 200);
  assert.equal(res.body.task.title, 'Novo');
  assert.equal(res.body.task.description, 'b');
  const again = await agent.get(`/api/tasks/${created.body.task.id}`);
  assert.equal(again.body.task.title, 'Novo');
  await agent.put('/api/tasks/999999').send({ title: 'x' }).expect(404);
});

test('11. excluir tarefa e 404 depois', async () => {
  const agent = await loggedAgent(userA);
  const created = await agent.post('/api/tasks').send({ title: 'Apagar' });
  const id = created.body.task.id;
  await agent.delete(`/api/tasks/${id}`).expect(204);
  const res = await agent.get(`/api/tasks/${id}`);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Tarefa não encontrada.');
  await agent.delete(`/api/tasks/${id}`).expect(404);
});

test('12. título vazio ou só espaços retorna 400 (criação e edição)', async () => {
  const agent = await loggedAgent(userA);
  for (const title of ['', '   ', undefined, 5]) {
    const res = await agent.post('/api/tasks').send({ title });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'O título é obrigatório.');
  }
  const created = await agent.post('/api/tasks').send({ title: 'Válida' });
  const id = created.body.task.id;
  await agent.put(`/api/tasks/${id}`).send({ title: '   ' }).expect(400);
  await agent.put(`/api/tasks/${id}`).send({ title: '' }).expect(400);
  await agent.post('/api/tasks').send({ title: 'ok', description: 123 }).expect(400);
  const still = await agent.get(`/api/tasks/${id}`);
  assert.equal(still.body.task.title, 'Válida');
});

test('13. isolamento: usuário B não acessa tarefas de A', async () => {
  const a = await loggedAgent(userA);
  const b = await loggedAgent(userB);
  const created = await a.post('/api/tasks').send({ title: 'Segredo de A', description: 'privado' });
  const id = created.body.task.id;

  await b.get(`/api/tasks/${id}`).expect(404);
  await b.put(`/api/tasks/${id}`).send({ title: 'Invadida' }).expect(404);
  await b.delete(`/api/tasks/${id}`).expect(404);

  const listB = await b.get('/api/tasks');
  assert.ok(!listB.body.tasks.some((t) => t.id === id));

  const intact = await a.get(`/api/tasks/${id}`);
  assert.equal(intact.status, 200);
  assert.equal(intact.body.task.title, 'Segredo de A');
  assert.equal(intact.body.task.description, 'privado');
});

test('14. persistência: reabrir o banco mantém usuários e tarefas', async () => {
  const file = path.join(dir, 'persist.db');
  let db1 = openDatabase(file);
  const app1 = createApp({ db: db1, secureCookies: false });
  await request(app1).post('/api/auth/register').send(userA).expect(201);
  const a1 = await loggedAgent(userA, app1);
  await a1.post('/api/tasks').send({ title: 'Persistente 1' }).expect(201);
  await a1.post('/api/tasks').send({ title: 'Persistente 2' }).expect(201);
  db1.close();

  const db2 = openDatabase(file);
  const app2 = createApp({ db: db2, secureCookies: false });
  const a2 = await loggedAgent(userA, app2);
  const res = await a2.get('/api/tasks');
  assert.deepEqual(res.body.tasks.map((t) => t.title), ['Persistente 1', 'Persistente 2']);
  db2.close();
});

test('15. logout invalida a sessão, inclusive com cookie antigo reenviado', async () => {
  const agent = request.agent(app);
  const login = await agent.post('/api/auth/login').send({ email: userA.email, password: userA.password });
  const oldCookie = login.headers['set-cookie'][0].split(';')[0];
  await agent.get('/api/tasks').expect(200);

  await agent.post('/api/auth/logout').expect(204);
  await agent.get('/api/tasks').expect(401);
  await request(app).get('/api/tasks').set('Cookie', oldCookie).expect(401);
  // idempotente
  await request(app).post('/api/auth/logout').expect(204);
});

test('extras: JSON inválido, rota inexistente e sem password_hash', async () => {
  const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{oops');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error, 'JSON inválido.');
  const nf = await request(app).get('/api/nada');
  assert.equal(nf.status, 404);
  assert.equal(nf.body.error, 'Rota não encontrada.');
});
