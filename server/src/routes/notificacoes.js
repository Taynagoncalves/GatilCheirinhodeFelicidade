const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, titulo, corpo, criado_em FROM notificacoes ORDER BY criado_em DESC LIMIT 50'
  );
  res.json(rows);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM notificacoes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  await pool.query('DELETE FROM notificacoes');
  res.json({ ok: true });
});

module.exports = router;
