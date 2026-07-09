const express = require('express');
const pool = require('../db/pool');
const { upload, uploadDoc } = require('../config/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { sexo, busca } = req.query;
  let sql = `
    SELECT p.id, p.nome, p.sexo, p.raca, p.cor,
           DATE_FORMAT(p.data_nascimento, '%Y-%m-%d') AS data_nascimento,
           p.foto_url, p.observacoes, p.peso,
           (SELECT DATE_FORMAT(a.proxima_dose, '%Y-%m-%d')
            FROM aplicacoes a
            WHERE a.pai_id = p.id AND a.proxima_dose IS NOT NULL
            ORDER BY a.id DESC LIMIT 1) AS proxima_dose_min,
           (SELECT med.nome
            FROM aplicacoes a
            JOIN medicamentos med ON a.medicamento_id = med.id
            WHERE a.pai_id = p.id AND a.proxima_dose IS NOT NULL
            ORDER BY a.id DESC LIMIT 1) AS proxima_medicamento_nome
    FROM pais p WHERE 1=1`;
  const params = [];
  if (sexo) { sql += ' AND p.sexo = ?'; params.push(sexo); }
  if (busca) { sql += ' AND p.nome LIKE ?'; params.push(`%${busca}%`); }
  sql += ' ORDER BY p.nome ASC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.nome, p.sexo, p.raca, p.cor,
            DATE_FORMAT(p.data_nascimento, '%Y-%m-%d') AS data_nascimento,
            p.foto_url, p.observacoes, p.peso, p.pkd, p.pkd_arquivo_url, p.pkd_arquivo_tipo,
            p.pai_id, pai_rec.nome AS pai_nome, pai_rec.foto_url AS pai_foto,
            p.mae_id, mae_rec.nome AS mae_nome, mae_rec.foto_url AS mae_foto
     FROM pais p
     LEFT JOIN pais pai_rec ON pai_rec.id = p.pai_id
     LEFT JOIN pais mae_rec ON mae_rec.id = p.mae_id
     WHERE p.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });

  const [historico_peso] = await pool.query(
    `SELECT id, peso, DATE_FORMAT(data_registro, '%Y-%m-%d') AS data_registro
     FROM historico_peso
     WHERE tipo = 'pai' AND entidade_id = ?
     ORDER BY data_registro DESC, criado_em DESC`,
    [req.params.id]
  );

  const [historico] = await pool.query(
    `SELECT a.id, a.tipo, a.observacoes,
            DATE_FORMAT(a.data_aplicada, '%Y-%m-%d') AS data_aplicada,
            DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose,
            med.nome AS medicamento_nome, med.categoria
     FROM aplicacoes a
     JOIN medicamentos med ON a.medicamento_id = med.id
     WHERE a.pai_id = ?
     ORDER BY a.data_aplicada DESC`,
    [req.params.id]
  );

  res.json({ ...rows[0], historico_peso, historico });
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes, peso, pai_id, mae_id, pkd } = req.body;
  const foto_url = req.file ? req.file.path : null;
  const [result] = await pool.query(
    `INSERT INTO pais (nome, sexo, raca, cor, data_nascimento, foto_url, observacoes, peso, pai_id, mae_id, pkd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, sexo, raca || null, cor || null, data_nascimento || null, foto_url, observacoes || null, peso || null, pai_id || null, mae_id || null, pkd || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nome, sexo, raca, cor, data_nascimento, observacoes, peso, pai_id, mae_id, pkd } = req.body;
  const fields = [nome, sexo, raca || null, cor || null, data_nascimento || null, observacoes || null, peso || null, pai_id || null, mae_id || null, pkd || null];
  let sql = 'UPDATE pais SET nome=?, sexo=?, raca=?, cor=?, data_nascimento=?, observacoes=?, peso=?, pai_id=?, mae_id=?, pkd=?';
  if (req.file) {
    fields.push(req.file.path);
    sql += ', foto_url=?';
  }
  fields.push(req.params.id);
  sql += ' WHERE id=?';
  await pool.query(sql, fields);
  res.json({ ok: true });
});

router.post('/:id/pkd-arquivo', uploadDoc.single('arquivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
  const tipo = req.file.mimetype === 'application/pdf' ? 'pdf' : 'imagem';
  await pool.query('UPDATE pais SET pkd_arquivo_url = ?, pkd_arquivo_tipo = ? WHERE id = ?', [req.file.path, tipo, req.params.id]);
  res.json({ url: req.file.path, tipo });
});

router.patch('/:id/peso', async (req, res) => {
  const { peso } = req.body;
  await pool.query('UPDATE pais SET peso=? WHERE id=?', [peso, req.params.id]);
  await pool.query(
    `INSERT INTO historico_peso (tipo, entidade_id, peso, data_registro) VALUES ('pai', ?, ?, CURDATE())`,
    [req.params.id, peso]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM aplicacoes WHERE pai_id = ?', [req.params.id]);
  await pool.query('DELETE FROM pais WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
