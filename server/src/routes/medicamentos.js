const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca } = req.query;
  let sql = 'SELECT * FROM medicamentos WHERE 1=1';
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ` AND nome ILIKE $${params.length}`;
  }
  sql += ' ORDER BY nome ASC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, categoria } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO medicamentos (nome, categoria) VALUES ($1, $2) RETURNING id',
    [nome, categoria || 'outro']
  );
  res.status(201).json({ id: rows[0].id });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM medicamentos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
