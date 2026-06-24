const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca } = req.query;
  let sql = `
    SELECT n.id, n.nome, n.mae_id, n.pai_id, DATE_FORMAT(n.data_nascimento, '%Y-%m-%d') AS data_nascimento,
           n.quantidade_filhotes, n.observacoes,
           m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome
    FROM ninhadas n
    LEFT JOIN pais m ON n.mae_id = m.id
    LEFT JOIN pais p ON n.pai_id = p.id
    WHERE 1=1`;
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ' AND n.nome LIKE ?';
  }
  sql += ' ORDER BY n.data_nascimento DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT n.id, n.nome, n.mae_id, n.pai_id, DATE_FORMAT(n.data_nascimento, '%Y-%m-%d') AS data_nascimento,
            n.quantidade_filhotes, n.observacoes,
            m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome, p.foto_url AS pai_foto
     FROM ninhadas n
     LEFT JOIN pais m ON n.mae_id = m.id
     LEFT JOIN pais p ON n.pai_id = p.id
     WHERE n.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrada' });
  const [filhotes] = await pool.query('SELECT id, nome, foto_url FROM gatos WHERE ninhada_id = ?', [req.params.id]);
  res.json({ ...rows[0], filhotes });
});

router.post('/', async (req, res) => {
  const { nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO ninhadas (nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, mae_id || null, pai_id || null, data_nascimento || null, quantidade_filhotes || 0, observacoes || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { nome, mae_id, pai_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;
  await pool.query(
    'UPDATE ninhadas SET nome=?, mae_id=?, pai_id=?, data_nascimento=?, quantidade_filhotes=?, observacoes=? WHERE id=?',
    [nome, mae_id || null, pai_id || null, data_nascimento || null, quantidade_filhotes || 0, observacoes || null, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM ninhadas WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
