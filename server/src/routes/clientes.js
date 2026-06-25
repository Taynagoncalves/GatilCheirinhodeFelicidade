const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/stats', async (req, res) => {
  const [[{ total_ativos }]] = await pool.query("SELECT COUNT(*) AS total_ativos FROM clientes WHERE status = 'ativo'");
  const [[{ novos_mes }]] = await pool.query("SELECT COUNT(*) AS novos_mes FROM clientes WHERE MONTH(criado_em) = MONTH(CURRENT_DATE) AND YEAR(criado_em) = YEAR(CURRENT_DATE)");
  const [[{ total_vendidos }]] = await pool.query("SELECT COUNT(*) AS total_vendidos FROM gatos WHERE status = 'vendido'");
  const [[{ novos_vendidos }]] = await pool.query("SELECT COUNT(*) AS novos_vendidos FROM gatos WHERE status = 'vendido' AND MONTH(criado_em) = MONTH(CURRENT_DATE) AND YEAR(criado_em) = YEAR(CURRENT_DATE)");
  const [[{ total_reservas }]] = await pool.query("SELECT COUNT(*) AS total_reservas FROM gatos WHERE status = 'reservado'");
  res.json({ total_ativos, novos_mes: Number(novos_mes), total_vendidos: Number(total_vendidos), novos_vendidos: Number(novos_vendidos), total_reservas: Number(total_reservas) });
});

router.get('/', async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT c.id, c.nome, c.telefone, c.cidade, c.gato_id, c.status, c.valor_venda,
           DATE_FORMAT(c.data_venda, '%Y-%m-%d') AS data_venda,
           DATE_FORMAT(c.criado_em, '%Y-%m-%d') AS criado_em,
           g.nome AS gato_nome, g.id AS gato_id_ref
    FROM clientes c
    LEFT JOIN gatos g ON c.gato_id = g.id
    WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND c.status = ?'; params.push(status); }
  sql += ' ORDER BY c.criado_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, telefone, cidade, gato_id, data_venda, status, valor_venda } = req.body;
  const [result] = await pool.query(
    `INSERT INTO clientes (nome, telefone, cidade, gato_id, data_venda, status, valor_venda) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, telefone || null, cidade || null, gato_id || null, data_venda || null, status || 'ativo', valor_venda || null]
  );
  if (gato_id) {
    await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gato_id]);
  }
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { nome, telefone, cidade, gato_id, data_venda, status, valor_venda } = req.body;
  await pool.query(
    `UPDATE clientes SET nome=?, telefone=?, cidade=?, gato_id=?, data_venda=?, status=?, valor_venda=? WHERE id=?`,
    [nome, telefone || null, cidade || null, gato_id || null, data_venda || null, status || 'ativo', valor_venda || null, req.params.id]
  );
  if (gato_id) {
    await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gato_id]);
  }
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
