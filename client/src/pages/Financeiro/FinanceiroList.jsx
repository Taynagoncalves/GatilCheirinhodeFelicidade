import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, X } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

const CATEGORIAS_SAIDA = ['Veterinário', 'Ração', 'Vacina', 'Higiene', 'Transporte', 'Outros'];
const CATEGORIAS_ENTRADA = ['Venda de Filhote', 'Outros'];

function formatVal(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(d) {
  return d.split('-').reverse().join('/');
}

export default function FinanceiroList() {
  const [registros, setRegistros] = useState([]);
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [filtro, setFiltro] = useState('');
  const [confirmando, setConfirmando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: 'saida', categoria: 'Veterinário', descricao: '', valor: '', data_registro: new Date().toISOString().slice(0, 10) });
  const toast = useToast();

  const carregar = () => {
    api.get('/financeiro', { params: filtro ? { tipo: filtro } : {} }).then((r) => setRegistros(r.data));
    api.get('/financeiro/resumo').then((r) => setResumo(r.data));
  };

  useEffect(() => { carregar(); }, [filtro]);

  const abrirForm = (tipo) => {
    setForm({
      tipo,
      categoria: tipo === 'saida' ? 'Veterinário' : 'Venda de Filhote',
      descricao: '',
      valor: '',
      data_registro: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    await api.post('/financeiro', form);
    setShowForm(false);
    toast(form.tipo === 'entrada' ? 'Entrada registrada!' : 'Gasto registrado!');
    carregar();
  };

  const excluir = async () => {
    await api.delete(`/financeiro/${confirmando.id}`);
    setConfirmando(null);
    toast('Registro excluído!');
    carregar();
  };

  const categorias = form.tipo === 'saida' ? CATEGORIAS_SAIDA : CATEGORIAS_ENTRADA;

  return (
    <Layout title="Financeiro" showBack>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-primary), #7b5ea7)', color: '#fff', marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.85 }}>Saldo do mês</p>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{formatVal(resumo.saldo)}</p>
          </div>
          <Wallet size={36} style={{ opacity: 0.5 }} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8 }}>Entradas</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{formatVal(resumo.entradas)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8 }}>Saídas</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{formatVal(resumo.saidas)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => abrirForm('entrada')}>
          <TrendingUp size={16} /> Entrada
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => abrirForm('saida')}>
          <TrendingDown size={16} /> Gasto
        </button>
      </div>

      <div className="tabs">
        <button className={`tab${filtro === '' ? ' active' : ''}`} onClick={() => setFiltro('')}>Todos</button>
        <button className={`tab${filtro === 'entrada' ? ' active' : ''}`} onClick={() => setFiltro('entrada')}>Entradas</button>
        <button className={`tab${filtro === 'saida' ? ' active' : ''}`} onClick={() => setFiltro('saida')}>Gastos</button>
      </div>

      {registros.length === 0 && (
        <EmptyState icon={Wallet} title="Nenhum lançamento" description="Registre entradas e gastos para acompanhar o financeiro." />
      )}

      {registros.map((r) => (
        <div key={r.id} className="card">
          <div className="card-row" style={{ alignItems: 'center' }}>
            <span className="card-photo-placeholder" style={{ width: 40, height: 40, flexShrink: 0, background: r.tipo === 'entrada' ? '#e6f4ec' : '#fdecea', color: r.tipo === 'entrada' ? '#3f8c5a' : '#c0524a' }}>
              {r.tipo === 'entrada' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p className="card-title" style={{ margin: 0, fontSize: '0.95rem' }}>{r.categoria}</p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: r.tipo === 'entrada' ? '#3f8c5a' : '#c0524a' }}>
                  {r.tipo === 'entrada' ? '+' : '-'}{formatVal(r.valor)}
                </p>
              </div>
              <p className="card-meta" style={{ margin: '2px 0 0' }}>
                {r.descricao && <>{r.descricao} · </>}{formatData(r.data_registro)}
                {r.gato_nome && <> · {r.gato_nome}</>}
              </p>
            </div>
            <button className="icon-btn" style={{ color: 'var(--color-danger)', flexShrink: 0, marginLeft: 8 }} onClick={() => setConfirmando(r)}>
              <Trash2 size={16} />
            </button>
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
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            <p className="modal-title">{form.tipo === 'entrada' ? 'Nova Entrada' : 'Novo Gasto'}</p>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {categorias.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
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
                <Plus size={16} /> Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
