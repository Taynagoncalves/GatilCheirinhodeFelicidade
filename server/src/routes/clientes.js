const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/stats', async (req, res) => {
  const [[{ total_ativos }]] = await pool.query("SELECT COUNT(*) AS total_ativos FROM clientes WHERE status = 'ativo'");
  const [[{ novos_mes }]] = await pool.query("SELECT COUNT(*) AS novos_mes FROM clientes WHERE MONTH(criado_em) = MONTH(CURRENT_DATE) AND YEAR(criado_em) = YEAR(CURRENT_DATE)");
  const [[{ total_vendidos }]] = await pool.query("SELECT COUNT(*) AS total_vendidos FROM gatos WHERE status = 'vendido'");
  const [[{ novos_vendidos }]] = await pool.query("SELECT COUNT(*) AS novos_vendidos FROM gatos WHERE status = 'vendido' AND MONTH(criado_em) = MONTH(CURRENT_DATE) AND YEAR(criado_em) = YEAR(CURRENT_DATE)");
  const [[{ total_reservas }]] = await pool.query("SELECT COUNT(*) AS total_reservas FROM gatos WHERE status = 'reservado'");
  res.json({ total_ativos, novos_mes: Number(novos_mes), total_vendidos: Number(total_vendidos), novos_vendidos: Number(novos_vendidos), total_reservas: Number(total_reservas) });
});

router.get('/', async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT c.id, c.nome, c.telefone, c.cidade, c.status, c.valor_venda,
           DATE_FORMAT(c.data_venda, '%Y-%m-%d') AS data_venda,
           DATE_FORMAT(c.criado_em, '%Y-%m-%d') AS criado_em
    FROM clientes c WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND c.status = ?'; params.push(status); }
  sql += ' ORDER BY c.criado_em DESC';
  const [clientes] = await pool.query(sql, params);

  const [gatoLinks] = await pool.query(`
    SELECT cg.cliente_id, g.id AS gato_id, g.nome AS gato_nome
    FROM cliente_gatos cg
    JOIN gatos g ON cg.gato_id = g.id
  `);

  const gatosByCliente = {};
  gatoLinks.forEach((link) => {
    if (!gatosByCliente[link.cliente_id]) gatosByCliente[link.cliente_id] = [];
    gatosByCliente[link.cliente_id].push({ id: link.gato_id, nome: link.gato_nome });
  });

  const result = clientes.map((c) => ({
    ...c,
    gatos: gatosByCliente[c.id] || [],
    gato_id: (gatosByCliente[c.id] || [])[0]?.id || null,
    gato_nome: (gatosByCliente[c.id] || [])[0]?.nome || null,
  }));

  res.json(result);
});

router.post('/', async (req, res) => {
  const { nome, telefone, cidade, gato_ids, data_venda, status, valor_venda } = req.body;
  const [result] = await pool.query(
    `INSERT INTO clientes (nome, telefone, cidade, data_venda, status, valor_venda) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, telefone || null, cidade || null, data_venda || null, status || 'ativo', valor_venda || null]
  );
  const clienteId = result.insertId;
  if (gato_ids && gato_ids.length > 0) {
    for (const gid of gato_ids) {
      await pool.query(`INSERT IGNORE INTO cliente_gatos (cliente_id, gato_id) VALUES (?, ?)`, [clienteId, gid]);
      await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gid]);
    }
  }
  res.status(201).json({ id: clienteId });
});

router.put('/:id', async (req, res) => {
  const { nome, telefone, cidade, gato_ids, data_venda, status, valor_venda } = req.body;
  await pool.query(
    `UPDATE clientes SET nome=?, telefone=?, cidade=?, data_venda=?, status=?, valor_venda=? WHERE id=?`,
    [nome, telefone || null, cidade || null, data_venda || null, status || 'ativo', valor_venda || null, req.params.id]
  );
  await pool.query(`DELETE FROM cliente_gatos WHERE cliente_id = ?`, [req.params.id]);
  if (gato_ids && gato_ids.length > 0) {
    for (const gid of gato_ids) {
      await pool.query(`INSERT IGNORE INTO cliente_gatos (cliente_id, gato_id) VALUES (?, ?)`, [req.params.id, gid]);
      await pool.query(`UPDATE gatos SET status = 'vendido' WHERE id = ?`, [gid]);
    }
  }
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM cliente_gatos WHERE cliente_id = ?', [req.params.id]);
  await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
