const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca } = req.query;
  let sql = `
    SELECT n.*, m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome
    FROM ninhadas n
    LEFT JOIN pais m ON n.mae_id = m.id
    LEFT JOIN pais p ON n.pai_id = p.id
    WHERE 1=1`;
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ` AND n.nome ILIKE $${params.length}`;
  }
  sql += ' ORDER BY n.data_nascimento DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT n.*, m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome, p.foto_url AS pai_foto
     FROM ninhadas n
     LEFT JOIN pais m ON n.mae_id = m.id
     LEFT JOIN pais p ON n.pai_id = p.id
     WHERE n.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrada' });
  const { rows: filhotes } = await pool.query('SELECT id, nome, foto_url FROM gatos WHERE ninhada_id = $1', [req.params.id]);
  res.json({ ...rows[0], filhotes });
});

router.post('/', async (req, res) => {
  const { nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO ninhadas (nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [nome, mae_id || null, pai_id || null, data_nascimento || null, quantidade_filhotes || 0, observacoes || null]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', async (req, res) => {
  const { nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;
  await pool.query(
    `UPDATE ninhadas SET nome=$1, mae_id=$2, pai_id=$3, data_nascimento=$4, quantidade_filhotes=$5, observacoes=$6 WHERE id=$7`,
    [nome, mae_id || null, pai_id || null, data_nascimento || null, quantidade_filhotes || 0, observacoes || null, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM ninhadas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
