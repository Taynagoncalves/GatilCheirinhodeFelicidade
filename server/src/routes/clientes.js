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

async function getGatosByCliente(clienteIds) {
  if (!clienteIds.length) return {};
  const [links] = await pool.query(
    `SELECT cg.cliente_id, g.id AS gato_id, g.nome AS gato_nome, g.foto_url AS gato_foto, cg.valor, cg.valor_pago, g.status AS gato_status
     FROM cliente_gatos cg JOIN gatos g ON cg.gato_id = g.id
     WHERE cg.cliente_id IN (?)`, [clienteIds]
  );
  const map = {};
  links.forEach((l) => {
    if (!map[l.cliente_id]) map[l.cliente_id] = [];
    map[l.cliente_id].push({ id: l.gato_id, nome: l.gato_nome, foto: l.gato_foto, valor: l.valor, valor_pago: l.valor_pago, status: l.gato_status });
  });
  return map;
}

router.get('/', async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT c.id, c.nome, c.telefone, c.cidade, c.status, c.valor_venda,
             DATE_FORMAT(c.data_venda, '%Y-%m-%d') AS data_venda,
             DATE_FORMAT(c.criado_em, '%Y-%m-%d') AS criado_em
             FROM clientes c WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND c.status = ?'; params.push(status); }
  sql += ' ORDER BY c.criado_em DESC';
  const [clientes] = await pool.query(sql, params);
  const gatosByCliente = await getGatosByCliente(clientes.map(c => c.id));
  res.json(clientes.map(c => ({
    ...c,
    gatos: gatosByCliente[c.id] || [],
    gato_id: (gatosByCliente[c.id] || [])[0]?.id || null,
    gato_nome: (gatosByCliente[c.id] || [])[0]?.nome || null,
  })));
});

router.get('/:id', async (req, res) => {
  const [[c]] = await pool.query(
    `SELECT c.id, c.nome, c.telefone, c.cidade, c.status, c.valor_venda,
            DATE_FORMAT(c.data_venda, '%Y-%m-%d') AS data_venda,
            DATE_FORMAT(c.criado_em, '%Y-%m-%d') AS criado_em
     FROM clientes c WHERE c.id = ?`, [req.params.id]
  );
  if (!c) return res.status(404).json({ error: 'Cliente não encontrado' });
  const gatosByCliente = await getGatosByCliente([c.id]);
  res.json({ ...c, gatos: gatosByCliente[c.id] || [] });
});

router.post('/', async (req, res) => {
  const { nome, telefone, cidade, data_venda, status, valor_venda } = req.body;
  const [result] = await pool.query(
    `INSERT INTO clientes (nome, telefone, cidade, data_venda, status, valor_venda) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, telefone || null, cidade || null, data_venda || null, status || 'ativo', valor_venda || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const { nome, telefone, cidade, data_venda, status, valor_venda } = req.body;
  await pool.query(
    `UPDATE clientes SET nome=?, telefone=?, cidade=?, data_venda=?, status=?, valor_venda=? WHERE id=?`,
    [nome, telefone || null, cidade || null, data_venda || null, status || 'ativo', valor_venda || null, req.params.id]
  );
  res.json({ ok: true });
});

// Adicionar gato ao cliente (status inicial = reservado, muda para vendido só quando pago)
router.post('/:id/gatos', async (req, res) => {
  const { gato_id, valor } = req.body;
  await pool.query(
    `INSERT INTO cliente_gatos (cliente_id, gato_id, valor, valor_pago) VALUES (?, ?, ?, 0) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
    [req.params.id, gato_id, valor || null]
  );
  await pool.query(`UPDATE gatos SET status = 'reservado' WHERE id = ?`, [gato_id]);
  res.json({ ok: true });
});

// Registrar pagamento de um gato do cliente
router.patch('/:id/gatos/:gato_id/pagamento', async (req, res) => {
  const { valor_pago } = req.body;
  const pago = Number(valor_pago) || 0;

  await pool.query(
    `UPDATE cliente_gatos SET valor_pago = ? WHERE cliente_id = ? AND gato_id = ?`,
    [pago, req.params.id, req.params.gato_id]
  );

  // Determina novo status do gato baseado no pagamento
  const [[link]] = await pool.query(
    `SELECT valor, valor_pago FROM cliente_gatos WHERE cliente_id = ? AND gato_id = ?`,
    [req.params.id, req.params.gato_id]
  );

  let novoStatus = 'reservado';
  if (pago > 0 && link.valor && pago >= Number(link.valor)) {
    novoStatus = 'vendido';
  } else if (pago > 0) {
    novoStatus = 'reservado';
  }

  await pool.query(`UPDATE gatos SET status = ? WHERE id = ?`, [novoStatus, req.params.gato_id]);
  res.json({ ok: true, status: novoStatus });
});

// Remover gato do cliente
router.delete('/:id/gatos/:gato_id', async (req, res) => {
  await pool.query(`DELETE FROM cliente_gatos WHERE cliente_id = ? AND gato_id = ?`, [req.params.id, req.params.gato_id]);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM cliente_gatos WHERE cliente_id = ?', [req.params.id]);
  await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
