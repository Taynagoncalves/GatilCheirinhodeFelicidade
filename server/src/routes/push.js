const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');
const pool = require('../db/pool');
const { notificar } = require('../services/notificacoes');

const router = express.Router();

webpush.setVapidDetails(
  'mailto:taynagon7302@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', async (req, res) => {
  const sub = req.body;
  try {
    await pool.query(
      'INSERT INTO push_subscriptions (endpoint, subscription) VALUES (?, ?) ON DUPLICATE KEY UPDATE subscription = VALUES(subscription)',
      [sub.endpoint, JSON.stringify(sub)]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao salvar subscription:', e);
    res.status(500).json({ error: 'Erro ao salvar subscription' });
  }
});

router.post('/test', async (req, res) => {
  try {
    await notificar('Cheirinho de Felicidade', 'Notificação de teste funcionando!');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cron: todo dia as 8h verifica doses do dia e do dia seguinte
cron.schedule('0 8 * * *', async () => {
  try {
    const [doses] = await pool.query(
      `SELECT a.proxima_dose, g.nome AS gato_nome, med.nome AS medicamento_nome, a.tipo
       FROM aplicacoes a
       JOIN gatos g ON a.gato_id = g.id
       JOIN medicamentos med ON a.medicamento_id = med.id
       WHERE a.proxima_dose = CURDATE() OR a.proxima_dose = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       ORDER BY a.proxima_dose ASC`
    );

    for (const dose of doses) {
      const data = new Date(dose.proxima_dose);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const ehHoje = data.getTime() === hoje.getTime();
      const tipoLabel = dose.tipo === 'vacina' ? 'vacina' : 'medicamento';

      const corpo = ehHoje
        ? `Hoje é dia de dar ${tipoLabel} ${dose.medicamento_nome} para ${dose.gato_nome}!`
        : `Amanhã é dia de dar ${tipoLabel} ${dose.medicamento_nome} para ${dose.gato_nome}.`;

      await notificar('Lembrete de dose', corpo);
    }

    console.log(`[cron] ${doses.length} doses verificadas`);
  } catch (e) {
    console.error('[cron] Erro:', e);
  }
}, { timezone: 'America/Sao_Paulo' });

module.exports = router;
