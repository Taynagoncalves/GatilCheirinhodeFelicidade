const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { tipo } = req.query;
  let sql = `
    SELECT a.*, g.nome AS gato_nome, g.foto_url AS gato_foto, med.nome AS medicamento_nome, med.categoria
    FROM aplicacoes a
    JOIN gatos g ON a.gato_id = g.id
    JOIN medicamentos med ON a.medicamento_id = med.id
    WHERE 1=1`;
  const params = [];
  if (tipo) {
    params.push(tipo);
    sql += ` AND a.tipo = $${params.length}`;
  }
  sql += ' ORDER BY a.data_aplicada DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { gato_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO aplicacoes (gato_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [gato_id, medicamento_id, tipo || 'medicamento', data_aplicada, proxima_dose || null, observacoes || null]
  );
  res.status(201).json({ id: rows[0].id });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM aplicacoes WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
