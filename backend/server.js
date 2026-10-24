require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { openDatabase } = require('./database/db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;
const secureCookies = process.env.COOKIE_SECURE === 'true';
const db = openDatabase(path.resolve(__dirname, process.env.DB_PATH || './data/todo.db'));
const app = createApp({ db, secureCookies });

if (secureCookies) app.set('trust proxy', 1);

// Serve o frontend compilado, se existir (deploy em serviço único)
const dist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
