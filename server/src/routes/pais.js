const express = require('express');
const pool = require('../db/pool');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { sexo, busca } = req.query;
  let sql = `SELECT id, nome, sexo, raca, cor, DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento, foto_url, observacoes FROM pais WHERE 1=1`;
  const params = [];
  if (sexo) {
    params.push(sexo);
    sql += ' AND sexo = ?';
  }
  if (busca) {
    params.push(`%${busca}%`);
    sql += ' AND nome LIKE ?';
  }
  sql += ' ORDER BY nome ASC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(`SELECT id, nome, sexo, raca, cor, DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento, foto_url, observacoes FROM pais WHERE id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
  res.json(rows[0]);
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes } = req.body;
  const foto_url = req.file ? req.file.path : null;
  const [result] = await pool.query(
    `INSERT INTO pais (nome, sexo, raca, cor, data_nascimento, foto_url, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, sexo, raca || null, cor || null, data_nascimento || null, foto_url, observacoes || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes } = req.body;
  const fields = [nome, sexo, raca || null, cor || null, data_nascimento || null, observacoes || null];
  let sql = 'UPDATE pais SET nome=?, sexo=?, raca=?, cor=?, data_nascimento=?, observacoes=?';
  if (req.file) {
    fields.push(req.file.path);
    sql += ', foto_url=?';
  }
  fields.push(req.params.id);
  sql += ' WHERE id=?';
  await pool.query(sql, fields);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM pais WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
