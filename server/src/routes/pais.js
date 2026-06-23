const express = require('express');
const pool = require('../db/pool');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { sexo, busca } = req.query;
  let sql = 'SELECT * FROM pais WHERE 1=1';
  const params = [];
  if (sexo) {
    params.push(sexo);
    sql += ` AND sexo = $${params.length}`;
  }
  if (busca) {
    params.push(`%${busca}%`);
    sql += ` AND nome ILIKE $${params.length}`;
  }
  sql += ' ORDER BY nome ASC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pais WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
  res.json(rows[0]);
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes } = req.body;
  const foto_url = req.file ? req.file.path : null;
  const { rows } = await pool.query(
    `INSERT INTO pais (nome, sexo, raca, cor, data_nascimento, foto_url, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [nome, sexo, raca || null, cor || null, data_nascimento || null, foto_url, observacoes || null]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes } = req.body;
  const fields = [nome, sexo, raca || null, cor || null, data_nascimento || null, observacoes || null];
  let sql = `UPDATE pais SET nome=$1, sexo=$2, raca=$3, cor=$4, data_nascimento=$5, observacoes=$6`;
  if (req.file) {
    fields.push(req.file.path);
    sql += `, foto_url=$${fields.length}`;
  }
  fields.push(req.params.id);
  sql += ` WHERE id=$${fields.length}`;
  await pool.query(sql, fields);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM pais WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
