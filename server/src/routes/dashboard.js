const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows: g } = await pool.query('SELECT COUNT(*) AS total_gatos FROM gatos');
  const { rows: n } = await pool.query('SELECT COUNT(*) AS total_ninhadas FROM ninhadas');

  const { rows: proximas_doses } = await pool.query(
    `SELECT a.id, a.proxima_dose, g.nome AS gato_nome, g.foto_url AS gato_foto, med.nome AS medicamento_nome
     FROM aplicacoes a
     JOIN gatos g ON a.gato_id = g.id
     JOIN medicamentos med ON a.medicamento_id = med.id
     WHERE a.proxima_dose IS NOT NULL AND a.proxima_dose >= CURRENT_DATE
     ORDER BY a.proxima_dose ASC
     LIMIT 5`
  );

  const { rows: ultimos_registros } = await pool.query(
    `SELECT a.id, a.data_aplicada, a.tipo, g.nome AS gato_nome, g.foto_url AS gato_foto, med.nome AS medicamento_nome
     FROM aplicacoes a
     JOIN gatos g ON a.gato_id = g.id
     JOIN medicamentos med ON a.medicamento_id = med.id
     ORDER BY a.criado_em DESC
     LIMIT 5`
  );

  res.json({
    total_gatos: Number(g[0].total_gatos),
    total_ninhadas: Number(n[0].total_ninhadas),
    proximas_doses,
    ultimos_registros,
  });
});

module.exports = router;
