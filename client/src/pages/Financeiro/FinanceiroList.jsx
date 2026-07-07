import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, X,
  PawPrint, Pencil, ChevronLeft, ChevronRight,
  BarChart3, List, Clock, Share2, Cat, Users, Phone, MapPin, CalendarDays, Search, MessageCircle,
} from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CATEGORIAS_SAIDA = ['Veterinário','Ração','Vacina','Higiene','Transporte','Outros'];
const CATEGORIAS_ENTRADA = ['Venda de Filhote','Outros'];

function formatVal(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatData(d) {
  return d.split('-').reverse().join('/');
}
function mesLabel(mes) {
  const [y, m] = mes.split('-');
  return `${MESES[parseInt(m) - 1]} ${y}`;
}
function mesAtualStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function navMes(mes, delta) {
  const [y, m] = mes.split('-').map(Number);
  const d = new Date(y, m - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function SeletorMes({ mes, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 4 }}>
      <button className="icon-btn" onClick={() => onChange(navMes(mes, -1))}><ChevronLeft size={20} /></button>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', minWidth: 140, textAlign: 'center' }}>{mesLabel(mes)}</p>
      <button className="icon-btn" onClick={() => onChange(navMes(mes, 1))}><ChevronRight size={20} /></button>
    </div>
  );
}

function FormModal({ form, setForm, gatos, onSalvar, onClose, editando }) {
  const categorias = form.tipo === 'saida' ? CATEGORIAS_SAIDA : CATEGORIAS_ENTRADA;
  const showGato = form.categoria === 'Venda de Filhote';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <p className="modal-title">{editando ? 'Editar Lançamento' : form.tipo === 'entrada' ? 'Nova Entrada' : 'Novo Gasto'}</p>
        <form onSubmit={onSalvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!editando && (
            <div className="tabs" style={{ marginBottom: 0 }}>
              <button type="button" className={`tab${form.tipo === 'saida' ? ' active' : ''}`} onClick={() => setForm({ ...form, tipo: 'saida', categoria: 'Veterinário' })}>Gasto</button>
              <button type="button" className={`tab${form.tipo === 'entrada' ? ' active' : ''}`} onClick={() => setForm({ ...form, tipo: 'entrada', categoria: 'Venda de Filhote' })}>Entrada</button>
            </div>
          )}
          <div className="field">
            <label>Categoria</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value, gato_id: '' })}>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {showGato && (
            <div className="field">
              <label>Gato vendido (opcional)</label>
              <select value={form.gato_id || ''} onChange={(e) => setForm({ ...form, gato_id: e.target.value })}>
                <option value="">Selecionar gato</option>
                {gatos.map((g) => <option key={g.id} value={g.id}>{g.nome || 'Sem nome'}</option>)}
              </select>
            </div>
          )}
          <div className="field">
            <label>Descrição (opcional)</label>
            <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Consulta Dr. Paulo" />
          </div>
          <div className="field">
            <label>Valor (R$)</label>
            <input type="number" step="0.01" min="0" required value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
          </div>
          <div className="field">
            <label>Data</label>
            <input type="date" required value={form.data_registro} onChange={(e) => setForm({ ...form, data_registro: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!form.valor}>
            <Plus size={16} /> {editando ? 'Salvar alterações' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Aba Resumo ─────────────────────────────────────────────────────────────
function TabResumo({ mes, onMes }) {
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [cats, setCats] = useState([]);
  const toast = useToast();

  useEffect(() => {
    api.get('/financeiro/resumo', { params: { mes } }).then((r) => setResumo(r.data));
    api.get('/financeiro/categorias', { params: { mes } }).then((r) => setCats(r.data));
  }, [mes]);

  const compartilhar = async () => {
    const linhas = cats.map((c) => `  ${c.categoria}: ${c.tipo === 'entrada' ? '+' : '-'}${formatVal(c.total)}`).join('\n');
    const texto = `Financeiro · ${mesLabel(mes)}\n\nEntradas: ${formatVal(resumo.entradas)}\nSaídas: ${formatVal(resumo.saidas)}\nSaldo: ${formatVal(resumo.saldo)}\n\nPor categoria:\n${linhas || '  Sem lançamentos'}\n\n🐾 Cheirinho de Felicidade`;
    try {
      if (navigator.share) await navigator.share({ title: 'Financeiro', text: texto });
      else { await navigator.clipboard.writeText(texto); toast('Copiado para a área de transferência!'); }
    } catch {}
  };

  const entradas = cats.filter((c) => c.tipo === 'entrada');
  const saidas = cats.filter((c) => c.tipo === 'saida');

  return (
    <div>
      <SeletorMes mes={mes} onChange={onMes} />

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-primary), #7b5ea7)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.85 }}>Saldo do mês</p>
            <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800 }}>{formatVal(resumo.saldo)}</p>
          </div>
          <Wallet size={36} style={{ opacity: 0.45 }} />
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div><p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8 }}>Entradas</p><p style={{ margin: 0, fontWeight: 700 }}>{formatVal(resumo.entradas)}</p></div>
          <div><p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8 }}>Saídas</p><p style={{ margin: 0, fontWeight: 700 }}>{formatVal(resumo.saidas)}</p></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={compartilhar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '4px 0' }}>
          <Share2 size={14} /> Compartilhar resumo
        </button>
      </div>

      {cats.length > 0 && (
        <>
          {entradas.length > 0 && (
            <section>
              <h2 className="section-title">Entradas por categoria</h2>
              <div className="card" style={{ padding: '4px 0' }}>
                {entradas.map((c) => (
                  <div key={c.categoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3f8c5a', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{c.categoria}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.quantidade} {c.quantidade === 1 ? 'lançamento' : 'lançamentos'}</p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#3f8c5a' }}>+{formatVal(c.total)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {saidas.length > 0 && (
            <section>
              <h2 className="section-title">Gastos por categoria</h2>
              <div className="card" style={{ padding: '4px 0' }}>
                {saidas.map((c) => (
                  <div key={c.categoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c0524a', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{c.categoria}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.quantidade} {c.quantidade === 1 ? 'lançamento' : 'lançamentos'}</p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#c0524a' }}>-{formatVal(c.total)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {cats.length === 0 && <EmptyState icon={BarChart3} title="Nenhum lançamento neste mês" description="Adicione entradas e gastos na aba Lançamentos." />}
    </div>
  );
}

// ── Aba Lançamentos ────────────────────────────────────────────────────────
function TabLancamentos({ mes, onMes }) {
  const [registros, setRegistros] = useState([]);
  const [gatos, setGatos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [confirmando, setConfirmando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ tipo: 'saida', categoria: 'Veterinário', descricao: '', valor: '', gato_id: '', data_registro: new Date().toISOString().slice(0, 10) });
  const toast = useToast();

  const carregar = () => {
    api.get('/financeiro', { params: { mes, tipo: filtro || undefined } }).then((r) => setRegistros(r.data));
  };

  useEffect(() => { api.get('/gatos').then((r) => setGatos(r.data)); }, []);
  useEffect(() => { carregar(); }, [mes, filtro]);

  const abrirNovo = (tipo) => {
    setEditando(null);
    setForm({ tipo, categoria: tipo === 'saida' ? 'Veterinário' : 'Venda de Filhote', descricao: '', valor: '', gato_id: '', data_registro: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const abrirEditar = (r) => {
    setEditando(r);
    setForm({ tipo: r.tipo, categoria: r.categoria, descricao: r.descricao || '', valor: r.valor, gato_id: r.gato_id || '', data_registro: r.data_registro });
    setShowForm(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (editando) await api.put(`/financeiro/${editando.id}`, form);
    else await api.post('/financeiro', form);
    setShowForm(false);
    toast(editando ? 'Lançamento atualizado!' : form.tipo === 'entrada' ? 'Entrada registrada!' : 'Gasto registrado!');
    carregar();
  };

  const excluir = async () => {
    await api.delete(`/financeiro/${confirmando.id}`);
    setConfirmando(null);
    toast('Registro excluído!');
    carregar();
  };

  return (
    <div>
      <SeletorMes mes={mes} onChange={onMes} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => abrirNovo('entrada')}
          style={{ flex: 1, padding: '11px 8px', borderRadius: 'var(--radius-md)', border: '1.5px solid #3f8c5a', background: '#f0faf4', color: '#3f8c5a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <TrendingUp size={16} /> Registrar Entrada
        </button>
        <button
          onClick={() => abrirNovo('saida')}
          style={{ flex: 1, padding: '11px 8px', borderRadius: 'var(--radius-md)', border: '1.5px solid #c0524a', background: '#fdf2f2', color: '#c0524a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <TrendingDown size={16} /> Registrar Gasto
        </button>
      </div>

      <div className="tabs">
        <button className={`tab${filtro === '' ? ' active' : ''}`} onClick={() => setFiltro('')}>Todos {registros.length > 0 && `(${registros.length})`}</button>
        <button className={`tab${filtro === 'entrada' ? ' active' : ''}`} onClick={() => setFiltro('entrada')}>Entradas</button>
        <button className={`tab${filtro === 'saida' ? ' active' : ''}`} onClick={() => setFiltro('saida')}>Gastos</button>
      </div>

      {registros.length === 0 && <EmptyState icon={Wallet} title="Nenhum lançamento" description="Registre entradas e gastos neste mês." />}

      {registros.map((r) => (
        <div key={r.id} style={{ background: '#fff', borderRadius: 'var(--radius-md)', marginBottom: 8, overflow: 'hidden', boxShadow: 'var(--shadow-card)', borderLeft: `4px solid ${r.tipo === 'entrada' ? '#3f8c5a' : '#c0524a'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: r.tipo === 'entrada' ? '#e6f4ec' : '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.tipo === 'entrada' ? '#3f8c5a' : '#c0524a' }}>
              {r.tipo === 'entrada' ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text)' }}>{r.categoria}</p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: r.tipo === 'entrada' ? '#3f8c5a' : '#c0524a' }}>
                  {r.tipo === 'entrada' ? '+' : '-'}{formatVal(r.valor)}
                </p>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {formatData(r.data_registro)}{r.descricao && ` · ${r.descricao}`}{r.gato_nome && ` · 🐱 ${r.gato_nome}`}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
              <button className="icon-btn" style={{ color: 'var(--color-text-muted)' }} onClick={() => abrirEditar(r)}><Pencil size={14} /></button>
              <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => setConfirmando(r)}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}

      {confirmando && (
        <ConfirmModal
          message={`Excluir este lançamento de ${formatVal(confirmando.valor)}?`}
          onConfirm={excluir}
          onCancel={() => setConfirmando(null)}
        />
      )}

      {showForm && (
        <FormModal
          form={form} setForm={setForm} gatos={gatos}
          onSalvar={salvar} onClose={() => setShowForm(false)}
          editando={editando}
        />
      )}
    </div>
  );
}

// ── Aba Histórico ──────────────────────────────────────────────────────────
function TabHistorico({ onIrMes }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    api.get('/financeiro/historico').then((r) => setHistorico(r.data));
  }, []);

  return (
    <div>
      <h2 className="section-title" style={{ marginTop: 0 }}>Histórico por mês</h2>
      {historico.length === 0 && <EmptyState icon={Clock} title="Nenhum histórico ainda" description="Os meses com lançamentos aparecerão aqui." />}
      {historico.map((h) => (
        <div key={h.mes} className="card" style={{ cursor: 'pointer' }} onClick={() => onIrMes(h.mes)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{mesLabel(h.mes)}</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: h.saldo >= 0 ? '#3f8c5a' : '#c0524a' }}>{formatVal(h.saldo)}</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3f8c5a' }}>↑ {formatVal(h.entradas)}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#c0524a' }}>↓ {formatVal(h.saidas)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Aba Clientes ───────────────────────────────────────────────────────────
const STATUS_CLIENTE = {
  ativo:      { label: 'Cliente Ativo',    cor: '#16a34a', bg: '#dcfce7' },
  reserva:    { label: 'Reserva',          cor: '#d97706', bg: '#fef3c7' },
  finalizado: { label: 'Finalizado',       cor: '#2563eb', bg: '#dbeafe' },
  inativo:    { label: 'Inativo',          cor: '#64748b', bg: '#f1f5f9' },
};
const FILTROS_CLIENTE = [
  { v: '', l: 'Todos' }, { v: 'ativo', l: 'Ativos' }, { v: 'reserva', l: 'Reservas' },
  { v: 'finalizado', l: 'Finalizados' }, { v: 'inativo', l: 'Inativos' },
];

function TabClientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState(null);
  const [gatos, setGatos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '', cidade: '', gato_id: '', data_venda: '', status: 'ativo', valor_venda: '' });
  const toast = useToast();

  const carregar = () => {
    api.get('/clientes').then((r) => setClientes(r.data));
    api.get('/clientes/stats').then((r) => setStats(r.data));
  };
  useEffect(() => {
    carregar();
    api.get('/gatos').then((r) => setGatos(r.data));
  }, []);

  const filtrados = clientes.filter((c) => {
    const matchStatus = !filtroStatus || c.status === filtroStatus;
    const matchBusca = !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.cidade || '').toLowerCase().includes(busca.toLowerCase()) ||
      (c.gato_nome || '').toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const abrirWhatsApp = (tel) => {
    const num = tel.replace(/\D/g, '');
    window.open(`https://wa.me/${num.startsWith('55') ? num : '55' + num}`, '_blank');
  };

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: '', telefone: '', cidade: '', gato_id: '', data_venda: new Date().toISOString().slice(0, 10), status: 'ativo', valor_venda: '' });
    setShowForm(true);
  };
  const abrirEditar = (c) => {
    setEditando(c);
    setForm({ nome: c.nome, telefone: c.telefone || '', cidade: c.cidade || '', gato_id: c.gato_id || '', data_venda: c.data_venda || '', status: c.status || 'ativo', valor_venda: c.valor_venda || '' });
    setShowForm(true);
  };
  const salvar = async (e) => {
    e.preventDefault();
    if (editando) await api.put(`/clientes/${editando.id}`, form);
    else await api.post('/clientes', form);
    setShowForm(false);
    toast(editando ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    carregar();
  };
  const excluir = async () => {
    await api.delete(`/clientes/${confirmando.id}`);
    setConfirmando(null);
    toast('Cliente removido!');
    carregar();
  };

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 4 }}>
          {[
            { icon: <Users size={18} />, valor: stats.total_ativos, label: 'Clientes Ativos', sub: `+${stats.novos_mes} este mês`, cor: '#7c3aed', bg: '#f5f0ff' },
            { icon: <Cat size={18} />, valor: stats.total_vendidos, label: 'Gatos Vendidos', sub: `+${stats.novos_vendidos} este mês`, cor: '#16a34a', bg: '#dcfce7' },
            { icon: <Wallet size={18} />, valor: stats.total_reservas, label: 'Reservas', sub: 'pendentes', cor: '#d97706', bg: '#fef3c7' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '10px 8px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', textAlign: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.cor, margin: '0 auto 6px' }}>{s.icon}</div>
              <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: s.cor, lineHeight: 1 }}>{s.valor}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.62rem', fontWeight: 700, color: '#475569', lineHeight: 1.3 }}>{s.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.6rem', color: '#94a3b8' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={abrirNovo}>
        <Plus size={16} /> Cadastrar Cliente
      </button>

      {/* Busca + filtros */}
      <div className="search-input">
        <Search size={16} />
        <input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 4 }}>
        {FILTROS_CLIENTE.map((f) => {
          const ativo = filtroStatus === f.v;
          return (
            <button key={f.v} onClick={() => setFiltroStatus(f.v)} style={{
              flexShrink: 0, border: ativo ? 'none' : '1.5px solid #e2e8f0',
              borderRadius: 20, padding: '5px 14px', fontSize: '0.78rem',
              fontWeight: ativo ? 700 : 500, cursor: 'pointer',
              background: ativo ? 'var(--color-primary)' : '#fff',
              color: ativo ? '#fff' : '#64748b',
            }}>{f.l}</button>
          );
        })}
      </div>

      {clientes.length === 0 && <EmptyState icon={Users} title="Nenhum cliente cadastrado" description="Cadastre os compradores dos filhotes aqui." />}

      {filtrados.map((c) => {
        const iniciais = c.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const st = STATUS_CLIENTE[c.status] || STATUS_CLIENTE.ativo;
        return (
          <div key={c.id} style={{ background: '#fff', borderRadius: 16, marginBottom: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {/* Topo */}
            <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                {iniciais}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#1e293b' }}>{c.nome}</p>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: st.cor, background: st.bg, borderRadius: 20, padding: '2px 8px' }}>{st.label}</span>
                </div>
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {c.telefone && <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color="#7c3aed" /> {c.telefone}</span>}
                  {c.cidade && <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color="#7c3aed" /> {c.cidade}</span>}
                  {c.criado_em && <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={11} /> Cliente desde {c.criado_em.split('-').reverse().join('/')}</span>}
                </div>
              </div>
              <button className="icon-btn" style={{ color: '#94a3b8' }} onClick={() => abrirEditar(c)}><Pencil size={15} /></button>
            </div>

            {/* Gato + Total */}
            {(c.gato_nome || c.valor_venda) && (
              <div style={{ margin: '0 14px', borderRadius: 10, background: '#f8fafc', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {c.gato_nome && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cat size={14} color="#7c3aed" />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>1 gato adquirido</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{c.gato_nome}</p>
                    </div>
                  </div>
                )}
                {c.valor_venda && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>Total gasto</p>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#16a34a' }}>{Number(c.valor_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #f1f5f9', marginTop: 10 }}>
              {c.telefone && (
                <button onClick={() => abrirWhatsApp(c.telefone)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#16a34a', fontSize: '0.65rem', fontWeight: 700 }}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
              )}
              {c.gato_id && (
                <button onClick={() => navigate(`/gatos/${c.gato_id}`)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 700, borderLeft: '1px solid #f1f5f9' }}>
                  <Cat size={16} /> Ver Gato
                </button>
              )}
<button onClick={() => setConfirmando(c)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#dc2626', fontSize: '0.65rem', fontWeight: 700, borderLeft: '1px solid #f1f5f9' }}>
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        );
      })}

      {confirmando && <ConfirmModal message={`Remover o cliente "${confirmando.nome}"?`} onConfirm={excluir} onCancel={() => setConfirmando(null)} />}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            <p className="modal-title">{editando ? 'Editar Cliente' : 'Novo Cliente'}</p>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label>Nome *</label><input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Maria da Silva" /></div>
              <div className="field"><label>Telefone</label><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" /></div>
              <div className="field"><label>Cidade</label><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Ex: São Paulo" /></div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ativo">Ativo</option>
                  <option value="reserva">Reserva</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="field">
                <label>Gato comprado</label>
                <select value={form.gato_id} onChange={(e) => setForm({ ...form, gato_id: e.target.value })}>
                  <option value="">Selecionar gato</option>
                  {gatos.map((g) => <option key={g.id} value={g.id}>{g.nome || 'Sem nome'}</option>)}
                </select>
              </div>
              <div className="field"><label>Data da venda</label><input type="date" value={form.data_venda} onChange={(e) => setForm({ ...form, data_venda: e.target.value })} /></div>
              <div className="field"><label>Valor da venda (R$)</label><input type="number" step="0.01" min="0" value={form.valor_venda} onChange={(e) => setForm({ ...form, valor_venda: e.target.value })} placeholder="0,00" /></div>
              <button type="submit" className="btn btn-primary" disabled={!form.nome}><Plus size={16} /> {editando ? 'Salvar alterações' : 'Cadastrar'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Container principal ────────────────────────────────────────────────────
export default function FinanceiroList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aba, setAba] = useState(location.state?.tab ?? 0);
  const [mes, setMes] = useState(mesAtualStr());

  const irMes = (m) => { setMes(m); setAba(1); };

  const ABAS = [
    { icon: <BarChart3 size={20} />, label: 'Resumo' },
    { icon: <List size={20} />, label: 'Lançamentos' },
    { icon: <Clock size={20} />, label: 'Histórico' },
    { icon: <Users size={20} />, label: 'Clientes' },
  ];

  return (
    <Layout title={ABAS[aba].label} hideNav>
      {/* Atalho voltar ao gatil */}
      <button onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
        background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)',
        border: '1px solid #ddd6fe', borderRadius: 20,
        padding: '6px 14px', cursor: 'pointer',
        color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700,
      }}>
        <Cat size={14} /> Ir para o Gatil
      </button>

      {aba === 0 && <TabResumo mes={mes} onMes={setMes} />}
      {aba === 1 && <TabLancamentos mes={mes} onMes={setMes} />}
      {aba === 2 && <TabHistorico onIrMes={irMes} />}
      {aba === 3 && <TabClientes />}

      {/* Menu inferior interno */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff', borderTop: '1px solid var(--color-border)',
        display: 'flex', zIndex: 100,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
      }}>
        {ABAS.map((a, i) => (
          <button
            key={i}
            onClick={() => setAba(i)}
            style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              padding: '10px 0 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: aba === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: aba === i ? 700 : 400,
              fontSize: '0.72rem',
              borderTop: aba === i ? '2px solid var(--color-primary)' : '2px solid transparent',
            }}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </nav>

      <div style={{ height: 64 }} />
    </Layout>
  );
}
