const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');
const pool = require('../db/pool');

const router = express.Router();

webpush.setVapidDetails(
  'mailto:taynagon7302@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function getSubscriptions() {
  const [rows] = await pool.query('SELECT subscription FROM push_subscriptions');
  return rows.map((r) => (typeof r.subscription === 'string' ? JSON.parse(r.subscription) : r.subscription));
}

async function sendToAll(payload) {
  const subs = await getSubscriptions();
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const results = await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub, JSON.stringify(payload)))
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  return { sent: subs.length - failed, failed };
}

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
  const result = await sendToAll({
    title: 'Cheirinho de Felicidade',
    body: 'Notificacao de teste funcionando!',
  });
  res.json(result);
});

// Cron: todo dia as 8h verifica doses do dia e do dia seguinte
cron.schedule('0 8 * * *', async () => {
  try {
    const [doses] = await pool.query(
      `SELECT a.proxima_dose, g.nome AS gato_nome, med.nome AS medicamento_nome
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

      const body = ehHoje
        ? `Hoje e dia de dar ${dose.medicamento_nome} para ${dose.gato_nome}!`
        : `Amanha e dia de dar ${dose.medicamento_nome} para ${dose.gato_nome}.`;

      await sendToAll({
        title: 'Lembrete de medicamento',
        body,
      });
    }

    console.log(`[cron] Notificacoes de doses enviadas: ${doses.length} doses verificadas`);
  } catch (e) {
    console.error('[cron] Erro ao enviar notificacoes de doses:', e);
  }
}, { timezone: 'America/Sao_Paulo' });

module.exports = router;
