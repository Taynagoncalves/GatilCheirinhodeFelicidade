const express = require('express');
const cors = require('cors');
const path = require('path');
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
    `ALTER TABLE ninhadas ADD COLUMN foto_url VARCHAR(500) NULL`,
    `ALTER TABLE clientes ADD COLUMN status ENUM('ativo','reserva','finalizado','inativo') NOT NULL DEFAULT 'ativo'`,
    `ALTER TABLE clientes ADD COLUMN valor_venda DECIMAL(10,2) NULL`,
    `ALTER TABLE pais ADD COLUMN pai_id INT NULL`,
    `ALTER TABLE pais ADD COLUMN mae_id INT NULL`,
    `ALTER TABLE pais ADD COLUMN pkd ENUM('positivo','negativo') NULL`,
    `ALTER TABLE pais ADD COLUMN pkd_arquivo_url VARCHAR(500) NULL`,
    `ALTER TABLE pais ADD COLUMN pkd_arquivo_tipo VARCHAR(10) NULL`,
  ]) {
    try { await pool.query(sql); } catch (e) { if (e.errno !== 1060 && e.errno !== 1054) throw e; }
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cliente_gatos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      gato_id INT NOT NULL,
      valor DECIMAL(10,2) NULL,
      UNIQUE KEY uk_cliente_gato (cliente_id, gato_id)
    )
  `);
  try { await pool.query(`ALTER TABLE cliente_gatos ADD COLUMN valor DECIMAL(10,2) NULL`); } catch (e) { if (e.errno !== 1060) throw e; }
  try { await pool.query(`ALTER TABLE cliente_gatos ADD COLUMN valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0`); } catch (e) { if (e.errno !== 1060) throw e; }
  // migra gato_id existente para a tabela de relacionamento
  await pool.query(`INSERT IGNORE INTO cliente_gatos (cliente_id, gato_id) SELECT id, gato_id FROM clientes WHERE gato_id IS NOT NULL`);
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
  // limpa aplicacoes órfãs (gato ou pai deletados sem cascade)
  await pool.query(`DELETE FROM aplicacoes WHERE gato_id IS NOT NULL AND gato_id NOT IN (SELECT id FROM gatos)`);
  await pool.query(`DELETE FROM aplicacoes WHERE pai_id IS NOT NULL AND pai_id NOT IN (SELECT id FROM pais)`);
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

// Página pública do gato — renderizada pelo servidor, sem precisar do React
app.get('/g/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT nome, foto_url, sexo, DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento, peso FROM gatos WHERE id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).send('<p>Gato não encontrado.</p>');
  const g = rows[0];

  function calcIdade(nasc) {
    if (!nasc) return null;
    const hoje = new Date(); const d = new Date(nasc + 'T00:00:00');
    const meses = (hoje.getFullYear() - d.getFullYear()) * 12 + (hoje.getMonth() - d.getMonth());
    if (meses < 1) return 'Menos de 1 mês';
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    const anos = Math.floor(meses / 12); const m = meses % 12;
    return m > 0 ? `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}` : `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  function formatPeso(p) {
    if (!p) return null;
    return p >= 1000 ? `${(p / 1000).toFixed(2).replace('.', ',')} kg` : `${p} g`;
  }
  function formatData(d) { return d ? d.split('-').reverse().join('/') : null; }

  const nome = g.nome || 'Sem nome';
  const sexo = g.sexo === 'macho' ? 'Macho' : 'Fêmea';
  const nasc = formatData(g.data_nascimento);
  const idade = calcIdade(g.data_nascimento);
  const peso = formatPeso(g.peso);

  function chip(emoji, label, valor, sub) {
    return `<div style="background:rgba(255,255,255,0.09);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.4rem;flex-shrink:0">${emoji}</span>
      <div>
        <p style="margin:0;font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em">${label}</p>
        <p style="margin:2px 0 0;font-size:1rem;font-weight:800;color:#fff;line-height:1.2">${valor}</p>
        ${sub ? `<p style="margin:2px 0 0;font-size:0.72rem;color:rgba(255,255,255,0.5)">${sub}</p>` : ''}
      </div>
    </div>`;
  }

  res.send(`<!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${nome} — Cheirinho de Felicidade</title>
    <meta property="og:title" content="${nome}">
    <meta property="og:image" content="${g.foto_url || ''}">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{min-height:100dvh;background:linear-gradient(160deg,#1a0533 0%,#3b1260 45%,#0f1f3d 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;font-family:'Segoe UI',system-ui,sans-serif}</style>
  </head><body>
    <div style="width:100%;max-width:380px">
      <div style="background:rgba(255,255,255,0.07);backdrop-filter:blur(20px);border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.08)">
        <div style="position:relative">
          ${g.foto_url
            ? `<img src="${g.foto_url}" alt="${nome}" style="width:100%;height:320px;object-fit:cover;display:block">`
            : `<div style="width:100%;height:320px;background:linear-gradient(135deg,#2d1065,#5b21b6);display:flex;align-items:center;justify-content:center;font-size:5rem">🐱</div>`}
          <div style="position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to top,rgba(15,5,30,0.95) 0%,transparent 100%)"></div>
          <p style="position:absolute;bottom:16px;left:20px;font-size:1.7rem;font-weight:900;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.5)">${nome}</p>
        </div>
        <div style="padding:20px 22px 24px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${chip('⚤', 'Sexo', sexo, null)}
            ${chip('🎂', 'Nascimento', nasc || '—', idade)}
            <div style="grid-column:span 2">${chip('⚖️', 'Peso', peso || '—', null)}</div>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:28px">
        <p style="font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);font-weight:600">apresentado por</p>
        <p style="margin:6px 0 0;font-size:1.1rem;font-weight:800;color:rgba(255,255,255,0.75)">🐾 Cheirinho de Felicidade</p>
      </div>
    </div>
  </body></html>`);
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('/{*path}', (req, res) => {
  const idx = path.join(clientDist, 'index.html');
  if (require('fs').existsSync(idx)) return res.sendFile(idx);
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
