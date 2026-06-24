const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/resumo', async (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  const [[resumo]] = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor ELSE 0 END), 0) AS saidas
    FROM financeiro
    WHERE DATE_FORMAT(data_registro, '%Y-%m') = ?
  `, [mes]);
  res.json({
    entradas: Number(resumo.entradas),
    saidas: Number(resumo.saidas),
    saldo: Number(resumo.entradas) - Number(resumo.saidas),
  });
});

router.get('/categorias', async (req, res) => {
  const mes = req.query.mes || new Date().toISOString().slice(0, 7);
  const [rows] = await pool.query(`
    SELECT tipo, categoria, SUM(valor) AS total, COUNT(*) AS quantidade
    FROM financeiro
    WHERE DATE_FORMAT(data_registro, '%Y-%m') = ?
    GROUP BY tipo, categoria
    ORDER BY total DESC
  `, [mes]);
  res.json(rows.map(r => ({ ...r, total: Number(r.total) })));
});

router.get('/historico', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT DATE_FORMAT(data_registro, '%Y-%m') AS mes,
           COALESCE(SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END), 0) AS entradas,
           COALESCE(SUM(CASE WHEN tipo='saida'   THEN valor ELSE 0 END), 0) AS saidas
    FROM financeiro
    GROUP BY DATE_FORMAT(data_registro, '%Y-%m')
    ORDER BY mes DESC
    LIMIT 24
  `);
  res.json(rows.map(r => ({ ...r, entradas: Number(r.entradas), saidas: Number(r.saidas), saldo: Number(r.entradas) - Number(r.saidas) })));
});

router.get('/', async (req, res) => {
  const { tipo, mes } = req.query;
  const mesAtual = mes || new Date().toISOString().slice(0, 7);
  let sql = `
    SELECT f.id, f.tipo, f.categoria, f.descricao, f.valor, f.gato_id,
           DATE_FORMAT(f.data_registro, '%Y-%m-%d') AS data_registro,
           g.nome AS gato_nome
    FROM financeiro f
    LEFT JOIN gatos g ON f.gato_id = g.id
    WHERE DATE_FORMAT(f.data_registro, '%Y-%m') = ?`;
  const params = [mesAtual];
  if (tipo) { sql += ' AND f.tipo = ?'; params.push(tipo); }
  sql += ' ORDER BY f.data_registro DESC, f.criado_em DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { tipo, categoria, descricao, valor, gato_id, data_registro } = req.body;
  const [result] = await pool.query(
    `INSERT INTO financeiro (tipo, categoria, descricao, valor, gato_id, data_registro)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, categoria, descricao || null, valor, gato_id || null, data_registro]
  );
  if (gato_id && categoria === 'Venda de Filhote') {
    await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gato_id]);
  }
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { tipo, categoria, descricao, valor, gato_id, data_registro } = req.body;
  await pool.query(
    `UPDATE financeiro SET tipo=?, categoria=?, descricao=?, valor=?, gato_id=?, data_registro=? WHERE id=?`,
    [tipo, categoria, descricao || null, valor, gato_id || null, data_registro, req.params.id]
  );
  if (gato_id && categoria === 'Venda de Filhote') {
    await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gato_id]);
  }
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM financeiro WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
