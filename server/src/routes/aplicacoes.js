const express = require('express');
const pool = require('../db/pool');
const { notificar } = require('../services/notificacoes');

const router = express.Router();

function diasAte(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataStr + 'T00:00:00');
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}

router.get('/', async (req, res) => {
  const { tipo } = req.query;
  let sql = `
    SELECT a.id, a.tipo, a.observacoes, a.criado_em,
           DATE_FORMAT(a.data_aplicada, '%Y-%m-%d') AS data_aplicada,
           DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose,
           COALESCE(g.nome, p.nome) AS gato_nome,
           COALESCE(g.foto_url, p.foto_url) AS gato_foto,
           med.nome AS medicamento_nome, med.categoria
    FROM aplicacoes a
    LEFT JOIN gatos g ON a.gato_id = g.id
    LEFT JOIN pais p ON a.pai_id = p.id
    JOIN medicamentos med ON a.medicamento_id = med.id
    WHERE 1=1`;
  const params = [];
  if (tipo) { sql += ' AND a.tipo = ?'; params.push(tipo); }
  sql += ' ORDER BY a.data_aplicada DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/agenda', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.gato_id, a.pai_id,
           COALESCE(g.nome, p.nome) AS gato_nome,
           COALESCE(g.foto_url, p.foto_url) AS gato_foto,
           med.nome AS medicamento_nome, a.tipo,
           DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose
    FROM aplicacoes a
    INNER JOIN (
      SELECT COALESCE(gato_id, pai_id) AS entidade_id,
             CASE WHEN gato_id IS NOT NULL THEN 'gato' ELSE 'pai' END AS entidade_tipo,
             medicamento_id, MAX(data_aplicada) AS ultima_data
      FROM aplicacoes
      GROUP BY gato_id, pai_id, medicamento_id
    ) ult ON a.medicamento_id = ult.medicamento_id
          AND a.data_aplicada = ult.ultima_data
          AND (
            (a.gato_id IS NOT NULL AND a.gato_id = ult.entidade_id AND ult.entidade_tipo = 'gato') OR
            (a.pai_id  IS NOT NULL AND a.pai_id  = ult.entidade_id AND ult.entidade_tipo = 'pai')
          )
    LEFT JOIN gatos g ON a.gato_id = g.id
    LEFT JOIN pais p ON a.pai_id = p.id
    JOIN medicamentos med ON a.medicamento_id = med.id
    WHERE a.proxima_dose IS NOT NULL
    ORDER BY a.proxima_dose ASC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { gato_id, pai_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO aplicacoes (gato_id, pai_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [gato_id || null, pai_id || null, medicamento_id, tipo || 'medicamento', data_aplicada, proxima_dose || null, observacoes || null]
  );

  try {
    let nome;
    if (gato_id) {
      const [[row]] = await pool.query('SELECT nome FROM gatos WHERE id = ?', [gato_id]);
      nome = row.nome;
    } else if (pai_id) {
      const [[row]] = await pool.query('SELECT nome FROM pais WHERE id = ?', [pai_id]);
      nome = row.nome;
    }
    const [[{ med_nome }]] = await pool.query('SELECT nome AS med_nome FROM medicamentos WHERE id = ?', [medicamento_id]);
    const tipoLabel = (tipo === 'vacina') ? 'Vacina' : 'Medicamento';

    let corpo = `${tipoLabel} ${med_nome} registrado para ${nome}.`;
    if (proxima_dose) {
      const dias = diasAte(proxima_dose);
      if (dias === 0) corpo += ' Próxima dose é hoje!';
      else if (dias === 1) corpo += ' Falta 1 dia para a próxima dose.';
      else corpo += ` Faltam ${dias} dias para a próxima dose.`;
    }

    await notificar(`${tipoLabel} registrado`, corpo);
  } catch (e) {
    console.error('Erro ao enviar notificacao de registro:', e);
  }

  res.status(201).json({ id: result.insertId });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM aplicacoes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
