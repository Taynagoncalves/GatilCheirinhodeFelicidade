const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/pool');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      endpoint VARCHAR(500) NOT NULL UNIQUE,
      subscription JSON NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notificacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      corpo TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
initDb().catch((e) => console.error('initDb error:', e));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/pais', require('./routes/pais'));
app.use('/api/ninhadas', require('./routes/ninhadas'));
app.use('/api/gatos', require('./routes/gatos'));
app.use('/api/medicamentos', require('./routes/medicamentos'));
app.use('/api/aplicacoes', require('./routes/aplicacoes'));
app.use('/api/push', require('./routes/push'));
app.use('/api/notificacoes', require('./routes/notificacoes'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
