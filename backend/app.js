const express = require('express');
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');

// Cria o app Express (sem listen) para uso no servidor e nos testes.
function createApp({ db, secureCookies = false }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  const auth = requireAuth(db);
  app.use('/api/auth', authRoutes(db, { secureCookies, requireAuth: auth }));
  app.use('/api/tasks', tasksRoutes(db, { requireAuth: auth }));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

  // Tratamento de erros: JSON malformado, corpo grande e erros inesperados
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Corpo da requisição muito grande.' });
    console.error('Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { createApp };
