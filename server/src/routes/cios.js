const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca } = req.query;
  let sql = `
    SELECT c.id, c.gata_id, c.macho_id, DATE_FORMAT(c.data_registro, '%Y-%m-%d') AS data_registro,
           c.observacoes,
           g.nome AS gata_nome, g.foto_url AS gata_foto, m.nome AS macho_nome, m.foto_url AS macho_foto
    FROM cios c
    LEFT JOIN pais g ON c.gata_id = g.id
    LEFT JOIN pais m ON c.macho_id = m.id
    WHERE 1=1`;
  const params = [];
  if (busca) {
    params.push(`%${busca}%`, `%${busca}%`);
    sql += ' AND (g.nome LIKE ? OR m.nome LIKE ?)';
  }
  sql += ' ORDER BY c.data_registro DESC, c.id DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.gata_id, c.macho_id, DATE_FORMAT(c.data_registro, '%Y-%m-%d') AS data_registro,
            c.observacoes,
            g.nome AS gata_nome, g.foto_url AS gata_foto, m.nome AS macho_nome, m.foto_url AS macho_foto
     FROM cios c
     LEFT JOIN pais g ON c.gata_id = g.id
     LEFT JOIN pais m ON c.macho_id = m.id
     WHERE c.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { gata_id, macho_id, data_registro, observacoes } = req.body;
  if (!gata_id || !data_registro) return res.status(400).json({ error: 'Gata e data são obrigatórios' });
  const [result] = await pool.query(
    `INSERT INTO cios (gata_id, macho_id, data_registro, observacoes) VALUES (?, ?, ?, ?)`,
    [gata_id, macho_id || null, data_registro, observacoes || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { gata_id, macho_id, data_registro, observacoes } = req.body;
  if (!gata_id || !data_registro) return res.status(400).json({ error: 'Gata e data são obrigatórios' });
  await pool.query(
    `UPDATE cios SET gata_id=?, macho_id=?, data_registro=?, observacoes=? WHERE id=?`,
    [gata_id, macho_id || null, data_registro, observacoes || null, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM cios WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
