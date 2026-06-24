const webpush = require('web-push');
const pool = require('../db/pool');

async function notificar(titulo, corpo) {
  await pool.query(
    'INSERT INTO notificacoes (titulo, corpo) VALUES (?, ?)',
    [titulo, corpo]
  );

  const [rows] = await pool.query('SELECT subscription FROM push_subscriptions');
  if (!rows.length) return;
  const subs = rows.map((r) => (typeof r.subscription === 'string' ? JSON.parse(r.subscription) : r.subscription));
  await Promise.allSettled(subs.map((sub) => webpush.sendNotification(sub, JSON.stringify({ title: titulo, body: corpo }))));
}

module.exports = { notificar };
