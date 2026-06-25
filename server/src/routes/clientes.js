const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT c.id, c.nome, c.telefone, c.cidade, c.gato_id,
           DATE_FORMAT(c.data_venda, '%Y-%m-%d') AS data_venda,
           g.nome AS gato_nome
    FROM clientes c
    LEFT JOIN gatos g ON c.gato_id = g.id
    ORDER BY c.criado_em DESC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, telefone, cidade, gato_id, data_venda } = req.body;
  const [result] = await pool.query(
    `INSERT INTO clientes (nome, telefone, cidade, gato_id, data_venda) VALUES (?, ?, ?, ?, ?)`,
    [nome, telefone || null, cidade || null, gato_id || null, data_venda || null]
  );
  if (gato_id) {
    await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gato_id]);
  }
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { nome, telefone, cidade, gato_id, data_venda } = req.body;
  await pool.query(
    `UPDATE clientes SET nome=?, telefone=?, cidade=?, gato_id=?, data_venda=? WHERE id=?`,
    [nome, telefone || null, cidade || null, gato_id || null, data_venda || null, req.params.id]
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
