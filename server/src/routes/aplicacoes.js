const express = require('express');
const webpush = require('web-push');
const pool = require('../db/pool');

const router = express.Router();

async function sendToAll(payload) {
  const [rows] = await pool.query('SELECT subscription FROM push_subscriptions');
  if (!rows.length) return;
  const subs = rows.map((r) => (typeof r.subscription === 'string' ? JSON.parse(r.subscription) : r.subscription));
  await Promise.allSettled(subs.map((sub) => webpush.sendNotification(sub, JSON.stringify(payload))));
}

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
           g.nome AS gato_nome, g.foto_url AS gato_foto,
           med.nome AS medicamento_nome, med.categoria
    FROM aplicacoes a
    JOIN gatos g ON a.gato_id = g.id
    JOIN medicamentos med ON a.medicamento_id = med.id
    WHERE 1=1`;
  const params = [];
  if (tipo) {
    params.push(tipo);
    sql += ' AND a.tipo = ?';
  }
  sql += ' ORDER BY a.data_aplicada DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { gato_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO aplicacoes (gato_id, medicamento_id, tipo, data_aplicada, proxima_dose, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gato_id, medicamento_id, tipo || 'medicamento', data_aplicada, proxima_dose || null, observacoes || null]
  );

  try {
    const [[{ gato_nome }]] = await pool.query('SELECT nome AS gato_nome FROM gatos WHERE id = ?', [gato_id]);
    const [[{ med_nome }]] = await pool.query('SELECT nome AS med_nome FROM medicamentos WHERE id = ?', [medicamento_id]);
    const tipoLabel = (tipo === 'vacina') ? 'Vacina' : 'Medicamento';

    let body = `${tipoLabel} ${med_nome} registrado para ${gato_nome}.`;
    if (proxima_dose) {
      const dias = diasAte(proxima_dose);
      if (dias === 0) body += ' Próxima dose é hoje!';
      else if (dias === 1) body += ' Falta 1 dia para a próxima dose.';
      else body += ` Faltam ${dias} dias para a próxima dose.`;
    }

    await sendToAll({ title: `${tipoLabel} registrado`, body });
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
