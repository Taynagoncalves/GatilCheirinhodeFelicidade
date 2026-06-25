const express = require('express');
const pool = require('../db/pool');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { busca, status, sexo } = req.query;
  let sql = `
    SELECT g.id, g.nome, g.cor, g.sexo, DATE_FORMAT(g.data_nascimento, '%Y-%m-%d') AS data_nascimento,
           g.ninhada_id, g.mae_id, g.pai_id, g.status, g.foto_url, g.observacoes, g.peso,
           m.nome AS mae_nome, p.nome AS pai_nome, n.nome AS ninhada_nome,
           (SELECT DATE_FORMAT(a.proxima_dose, '%Y-%m-%d')
            FROM aplicacoes a
            WHERE a.gato_id = g.id AND a.proxima_dose IS NOT NULL
            ORDER BY a.id DESC LIMIT 1) AS proxima_dose_min,
           (SELECT med.nome
            FROM aplicacoes a
            JOIN medicamentos med ON a.medicamento_id = med.id
            WHERE a.gato_id = g.id AND a.proxima_dose IS NOT NULL
            ORDER BY a.id DESC LIMIT 1) AS proxima_medicamento_nome
    FROM gatos g
    LEFT JOIN pais m ON g.mae_id = m.id
    LEFT JOIN pais p ON g.pai_id = p.id
    LEFT JOIN ninhadas n ON g.ninhada_id = n.id
    WHERE 1=1`;
  const params = [];
  if (busca) {
    params.push(`%${busca}%`);
    sql += ' AND g.nome LIKE ?';
  }
  if (status) {
    params.push(status);
    sql += ' AND g.status = ?';
  }
  if (sexo) {
    params.push(sexo);
    sql += ' AND g.sexo = ?';
  }
  sql += ' ORDER BY g.criado_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT g.id, g.nome, g.cor, g.sexo, DATE_FORMAT(g.data_nascimento, '%Y-%m-%d') AS data_nascimento,
            g.ninhada_id, g.mae_id, g.pai_id, g.status, g.foto_url, g.observacoes, g.peso,
            m.nome AS mae_nome, m.foto_url AS mae_foto, p.nome AS pai_nome, p.foto_url AS pai_foto, n.nome AS ninhada_nome
     FROM gatos g
     LEFT JOIN pais m ON g.mae_id = m.id
     LEFT JOIN pais p ON g.pai_id = p.id
     LEFT JOIN ninhadas n ON g.ninhada_id = n.id
     WHERE g.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });

  const [historico] = await pool.query(
    `SELECT a.id, a.tipo, a.observacoes,
            DATE_FORMAT(a.data_aplicada, '%Y-%m-%d') AS data_aplicada,
            DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose,
            med.nome AS medicamento_nome, med.categoria
     FROM aplicacoes a
     JOIN medicamentos med ON a.medicamento_id = med.id
     WHERE a.gato_id = ?
     ORDER BY a.data_aplicada DESC`,
    [req.params.id]
  );

  const [historico_peso] = await pool.query(
    `SELECT id, peso, DATE_FORMAT(data_registro, '%Y-%m-%d') AS data_registro
     FROM historico_peso
     WHERE tipo = 'gato' AND entidade_id = ?
     ORDER BY data_registro DESC, criado_em DESC`,
    [req.params.id]
  );

  res.json({ ...rows[0], historico, historico_peso });
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, observacoes, peso } = req.body;
  const foto_url = req.file ? req.file.path : null;
  const [result] = await pool.query(
    `INSERT INTO gatos (nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, foto_url, observacoes, peso)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome || null, cor || null, sexo,
      data_nascimento || null, ninhada_id || null, mae_id || null, pai_id || null,
      status || 'disponivel', foto_url, observacoes || null, peso || null,
    ]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nome, cor, sexo, data_nascimento, ninhada_id, mae_id, pai_id, status, observacoes, peso } = req.body;
  const fields = [
    nome || null, cor || null, sexo,
    data_nascimento || null, ninhada_id || null, mae_id || null, pai_id || null,
    status || 'disponivel', observacoes || null, peso || null,
  ];
  let sql = 'UPDATE gatos SET nome=?, cor=?, sexo=?, data_nascimento=?, ninhada_id=?, mae_id=?, pai_id=?, status=?, observacoes=?, peso=?';
  if (req.file) {
    fields.push(req.file.path);
    sql += ', foto_url=?';
  }
  fields.push(req.params.id);
  sql += ' WHERE id=?';
  await pool.query(sql, fields);
  res.json({ ok: true });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE gatos SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
});

router.patch('/:id/peso', async (req, res) => {
  const { peso } = req.body;
  await pool.query('UPDATE gatos SET peso=? WHERE id=?', [peso, req.params.id]);
  await pool.query(
    `INSERT INTO historico_peso (tipo, entidade_id, peso, data_registro) VALUES ('gato', ?, ?, CURDATE())`,
    [req.params.id, peso]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM gatos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
