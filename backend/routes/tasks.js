const express = require('express');

// Valida título e descrição; retorna { error } ou { title, description }.
function parseTask(body) {
  const { title, description } = body || {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
    return { error: 'O título é obrigatório.' };
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string' || description.length > 2000) {
      return { error: 'A descrição deve ser um texto de até 2000 caracteres.' };
    }
  }
  return { title: title.trim(), description: description || '' };
}

function tasksRoutes(db, { requireAuth }) {
  const router = express.Router();
  router.use(requireAuth);

  const COLS = 'id, title, description, created_at';
  const notFound = (res) => res.status(404).json({ error: 'Tarefa não encontrada.' });

  // Valida :id antes dos handlers
  router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    req.taskId = Number(id);
    next();
  });

  router.get('/', (req, res) => {
    const tasks = db
      .prepare(`SELECT ${COLS} FROM tasks WHERE user_id = ? ORDER BY created_at ASC, id ASC`)
      .all(req.user.id);
    res.json({ tasks });
  });

  router.post('/', (req, res) => {
    const data = parseTask(req.body);
    if (data.error) return res.status(400).json({ error: data.error });
    const info = db
      .prepare('INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)')
      .run(data.title, data.description, req.user.id);
    const task = db
      .prepare(`SELECT ${COLS} FROM tasks WHERE id = ? AND user_id = ?`)
      .get(info.lastInsertRowid, req.user.id);
    res.status(201).json({ task });
  });

  router.get('/:id', (req, res) => {
    const task = db.prepare(`SELECT ${COLS} FROM tasks WHERE id = ? AND user_id = ?`).get(req.taskId, req.user.id);
    if (!task) return notFound(res);
    res.json({ task });
  });

  router.put('/:id', (req, res) => {
    const data = parseTask(req.body);
    if (data.error) return res.status(400).json({ error: data.error });
    const info = db
      .prepare('UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?')
      .run(data.title, data.description, req.taskId, req.user.id);
    if (info.changes === 0) return notFound(res);
    const task = db.prepare(`SELECT ${COLS} FROM tasks WHERE id = ? AND user_id = ?`).get(req.taskId, req.user.id);
    res.json({ task });
  });

  router.delete('/:id', (req, res) => {
    const info = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.taskId, req.user.id);
    if (info.changes === 0) return notFound(res);
    res.status(204).end();
  });

  return router;
}

module.exports = tasksRoutes;
