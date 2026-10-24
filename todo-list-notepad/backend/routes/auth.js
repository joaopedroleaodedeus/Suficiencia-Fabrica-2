const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const { sha256 } = require('../middleware/auth');

const DAY_MS = 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Hash fictício para manter o tempo de resposta similar quando o e-mail não existe.
const DUMMY_HASH = bcrypt.hashSync('senha-ficticia', 10);

function authRoutes(db, { secureCookies, requireAuth }) {
  const router = express.Router();
  const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: secureCookies, path: '/' };

  router.post('/register', (req, res) => {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'A senha deve ter entre 8 e 72 caracteres.' });
    }
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(cleanEmail)) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }
    const hash = bcrypt.hashSync(password, 10);
    try {
      const info = db
        .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
        .run(name.trim(), cleanEmail, hash);
      res.status(201).json({ user: { id: Number(info.lastInsertRowid), name: name.trim(), email: cleanEmail } });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
      }
      throw err;
    }
  });

  router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    const user = db
      .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
      .get(email.trim().toLowerCase());
    const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    // Limpa sessões expiradas e cria a nova
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
      sha256(token),
      user.id,
      new Date(Date.now() + DAY_MS).toISOString()
    );
    res.cookie('sid', token, { ...cookieOpts, maxAge: DAY_MS });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });

  router.post('/logout', (req, res) => {
    const token = req.cookies && req.cookies.sid;
    if (typeof token === 'string' && token) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    }
    res.clearCookie('sid', cookieOpts);
    res.status(204).end();
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}

module.exports = authRoutes;
