const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const [[{ total_gatos }]] = await pool.query('SELECT COUNT(*) AS total_gatos FROM gatos');
  const [[{ total_ninhadas }]] = await pool.query('SELECT COUNT(*) AS total_ninhadas FROM ninhadas');
  const [[{ total_reservados }]] = await pool.query("SELECT COUNT(*) AS total_reservados FROM gatos WHERE status = 'reservado'");
  const [[{ total_vendidos }]] = await pool.query("SELECT COUNT(*) AS total_vendidos FROM gatos WHERE status = 'vendido'");

  const [proximas_doses] = await pool.query(
    `SELECT id, gato_id, pai_id, proxima_dose, gato_nome, gato_foto, medicamento_nome FROM (
       SELECT a.id, a.gato_id, NULL AS pai_id,
              DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose,
              g.nome AS gato_nome, g.foto_url AS gato_foto, med.nome AS medicamento_nome
       FROM aplicacoes a
       JOIN gatos g ON a.gato_id = g.id
       JOIN medicamentos med ON a.medicamento_id = med.id
       WHERE a.proxima_dose IS NOT NULL AND a.gato_id IS NOT NULL
       UNION ALL
       SELECT a.id, NULL AS gato_id, a.pai_id,
              DATE_FORMAT(a.proxima_dose, '%Y-%m-%d') AS proxima_dose,
              p.nome AS gato_nome, p.foto_url AS gato_foto, med.nome AS medicamento_nome
       FROM aplicacoes a
       JOIN pais p ON a.pai_id = p.id
       JOIN medicamentos med ON a.medicamento_id = med.id
       WHERE a.proxima_dose IS NOT NULL AND a.pai_id IS NOT NULL
     ) t
     ORDER BY proxima_dose ASC
     LIMIT 8`
  );

  const [ultimos_registros] = await pool.query(
    `SELECT a.id, a.data_aplicada, a.tipo, g.nome AS gato_nome, g.foto_url AS gato_foto, med.nome AS medicamento_nome
     FROM aplicacoes a
     JOIN gatos g ON a.gato_id = g.id
     JOIN medicamentos med ON a.medicamento_id = med.id
     WHERE a.data_aplicada <= CURRENT_DATE
     ORDER BY a.data_aplicada DESC
     LIMIT 5`
  );

  const [[fin]] = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor ELSE 0 END), 0) AS saidas
    FROM financeiro
    WHERE MONTH(data_registro) = MONTH(CURRENT_DATE)
      AND YEAR(data_registro)  = YEAR(CURRENT_DATE)
  `);

  res.json({
    total_gatos: Number(total_gatos),
    total_ninhadas: Number(total_ninhadas),
    total_reservados: Number(total_reservados),
    total_vendidos: Number(total_vendidos),
    proximas_doses,
    ultimos_registros,
    fin_entradas: Number(fin.entradas),
    fin_saidas: Number(fin.saidas),
    fin_saldo: Number(fin.entradas) - Number(fin.saidas),
  });
});

module.exports = router;
