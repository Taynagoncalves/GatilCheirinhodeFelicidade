const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/resumo', async (req, res) => {
  const [[resumo]] = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor ELSE 0 END), 0) AS saidas
    FROM financeiro
    WHERE MONTH(data_registro) = MONTH(CURRENT_DATE)
      AND YEAR(data_registro)  = YEAR(CURRENT_DATE)
  `);
  res.json({
    entradas: Number(resumo.entradas),
    saidas: Number(resumo.saidas),
    saldo: Number(resumo.entradas) - Number(resumo.saidas),
  });
});

router.get('/', async (req, res) => {
  const { tipo } = req.query;
  let sql = `
    SELECT f.id, f.tipo, f.categoria, f.descricao, f.valor,
           DATE_FORMAT(f.data_registro, '%Y-%m-%d') AS data_registro,
           g.nome AS gato_nome
    FROM financeiro f
    LEFT JOIN gatos g ON f.gato_id = g.id
    WHERE 1=1`;
  const params = [];
  if (tipo) { sql += ' AND f.tipo = ?'; params.push(tipo); }
  sql += ' ORDER BY f.data_registro DESC, f.criado_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { tipo, categoria, descricao, valor, gato_id, data_registro } = req.body;
  const [result] = await pool.query(
    `INSERT INTO financeiro (tipo, categoria, descricao, valor, gato_id, data_registro)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, categoria, descricao || null, valor, gato_id || null, data_registro]
  );
  res.status(201).json({ id: result.insertId });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM financeiro WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
