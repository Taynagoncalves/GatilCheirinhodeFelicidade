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
  for (const sql of [
    `ALTER TABLE gatos ADD COLUMN peso DECIMAL(7,1) NULL`,
    `ALTER TABLE pais  ADD COLUMN peso DECIMAL(7,1) NULL`,
    `ALTER TABLE aplicacoes ADD COLUMN pai_id INT NULL`,
    `ALTER TABLE aplicacoes MODIFY COLUMN gato_id INT NULL`,
  ]) {
    try { await pool.query(sql); } catch (e) { if (e.errno !== 1060 && e.errno !== 1054) throw e; }
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS financeiro (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo ENUM('entrada','saida') NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      descricao VARCHAR(300),
      valor DECIMAL(10,2) NOT NULL,
      gato_id INT NULL,
      data_registro DATE NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS historico_peso (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo ENUM('gato','pai') NOT NULL,
      entidade_id INT NOT NULL,
      peso DECIMAL(7,1) NOT NULL,
      data_registro DATE NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(200) NOT NULL,
      telefone VARCHAR(30),
      cidade VARCHAR(100),
      gato_id INT NULL,
      data_venda DATE,
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
app.use('/api/financeiro', require('./routes/financeiro'));
app.use('/api/clientes', require('./routes/clientes'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
