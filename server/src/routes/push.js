const express = require('express');
const webpush = require('web-push');

const router = express.Router();

webpush.setVapidDetails(
  'mailto:taynagon7302@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = [];

router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', (req, res) => {
  const sub = req.body;
  const exists = subscriptions.find((s) => s.endpoint === sub.endpoint);
  if (!exists) subscriptions.push(sub);
  res.json({ ok: true });
});

router.post('/test', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Cheirinho de Felicidade 🐱',
    body: 'Notificação de teste funcionando!',
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) => webpush.sendNotification(sub, payload))
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  res.json({ sent: subscriptions.length - failed, failed });
});

module.exports = router;
