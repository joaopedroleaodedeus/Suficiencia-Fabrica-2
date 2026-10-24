const crypto = require('crypto');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Exige sessão válida (cookie sid) e define req.user.
function requireAuth(db) {
  const find = db.prepare(`
    SELECT u.id, u.name, u.email
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `);
  return (req, res, next) => {
    const token = req.cookies && req.cookies.sid;
    const user = typeof token === 'string' && token ? find.get(sha256(token), new Date().toISOString()) : null;
    if (!user) return res.status(401).json({ error: 'Não autenticado.' });
    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  };
}

module.exports = { requireAuth, sha256 };
