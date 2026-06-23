const express = require('express');
const pool = require('../db/pool');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca, status } = req.query;
  let sql = 'SELECT * FROM gatos WHERE 1=1';
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ` AND nome ILIKE $${params.length}`;
  }
  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY criado_em DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT g.*, m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome, p.foto_url AS pai_foto, n.nome AS ninhada_nome
     FROM gatos g
     LEFT JOIN pais m ON g.mae_id = m.id
     LEFT JOIN pais p ON g.pai_id = p.id
     LEFT JOIN ninhadas n ON g.ninhada_id = n.id
     WHERE g.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });

  const { rows: historico } = await pool.query(
    `SELECT a.*, med.nome AS medicamento_nome, med.categoria
     FROM aplicacoes a
     JOIN medicamentos med ON a.medicamento_id = med.id
     WHERE a.gato_id = $1
     ORDER BY a.data_aplicada DESC`,
    [req.params.id]
  );

  res.json({ ...rows[0], historico });
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, observacoes } = req.body;
  const foto_url = req.file ? req.file.path : null;
  const { rows } = await pool.query(
    `INSERT INTO gatos (nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, foto_url, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      nome || null,
      cor || null,
      sexo,
      data_nascimento || null,
      ninhada_id || null,
      mae_id || null,
      pai_id || null,
      status || 'disponivel',
      foto_url,
      observacoes || null,
    ]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, observacoes } = req.body;
  const fields = [
    nome || null,
    cor || null,
    sexo,
    data_nascimento || null,
    ninhada_id || null,
    mae_id || null,
    pai_id || null,
    status || 'disponivel',
    observacoes || null,
  ];
  let sql = `UPDATE gatos SET nome=$1, cor=$2, sexo=$3, data_nascimento=$4, ninhada_id=$5, mae_id=$6, pai_id=$7, status=$8, observacoes=$9`;
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
  await pool.query('DELETE FROM gatos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
