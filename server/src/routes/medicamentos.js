const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca } = req.query;
  let sql = 'SELECT * FROM medicamentos WHERE 1=1';
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ' AND nome LIKE ?';
  }
  sql += ' ORDER BY nome ASC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, categoria } = req.body;
  const [result] = await pool.query(
    'INSERT INTO medicamentos (nome, categoria) VALUES (?, ?)',
    [nome, categoria || 'outro']
  );
  res.status(201).json({ id: result.insertId });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM aplicacoes WHERE medicamento_id = ?', [req.params.id]);
  await pool.query('DELETE FROM medicamentos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
