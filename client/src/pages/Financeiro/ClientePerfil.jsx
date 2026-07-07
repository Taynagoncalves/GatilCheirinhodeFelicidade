import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cat, Phone, MapPin, CalendarDays, Plus, Trash2, X, Pencil, ChevronRight, MessageCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

const STATUS_CLIENTE = {
  ativo:      { label: 'Cliente Ativo',  cor: '#16a34a', bg: '#dcfce7' },
  reserva:    { label: 'Reserva',        cor: '#d97706', bg: '#fef3c7' },
  finalizado: { label: 'Finalizado',     cor: '#2563eb', bg: '#dbeafe' },
  inativo:    { label: 'Inativo',        cor: '#64748b', bg: '#f1f5f9' },
};

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ClientePerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [cliente, setCliente] = useState(null);
  const [gatos, setGatos] = useState([]);
  const [showAddGato, setShowAddGato] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [addForm, setAddForm] = useState({ gato_id: '', valor: '' });
  const [editForm, setEditForm] = useState({});

  const carregar = () => api.get(`/clientes/${id}`).then(r => setCliente(r.data));

  useEffect(() => {
    carregar();
    api.get('/gatos').then(r => setGatos(r.data));
  }, [id]);

  const abrirEdit = () => {
    if (!cliente) return;
    setEditForm({
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      cidade: cliente.cidade || '',
      status: cliente.status || 'ativo',
      data_venda: cliente.data_venda || '',
      valor_venda: cliente.valor_venda || '',
    });
    setShowEdit(true);
  };

  const salvarEdit = async (e) => {
    e.preventDefault();
    await api.put(`/clientes/${id}`, editForm);
    setShowEdit(false);
    toast('Cliente atualizado!');
    carregar();
  };

  const adicionarGato = async (e) => {
    e.preventDefault();
    if (!addForm.gato_id) return;
    await api.post(`/clientes/${id}/gatos`, { gato_id: Number(addForm.gato_id), valor: addForm.valor || null });
    setShowAddGato(false);
    setAddForm({ gato_id: '', valor: '' });
    toast('Gato adicionado!');
    carregar();
  };

  const removerGato = async () => {
    await api.delete(`/clientes/${id}/gatos/${confirmRemove.id}`);
    setConfirmRemove(null);
    toast('Gato removido!');
    carregar();
  };

  const abrirWhatsApp = (tel) => {
    const num = tel.replace(/\D/g, '');
    window.open(`https://wa.me/${num.startsWith('55') ? num : '55' + num}`, '_blank');
  };

  if (!cliente) return null;

  const st = STATUS_CLIENTE[cliente.status] || STATUS_CLIENTE.ativo;
  const iniciais = cliente.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const gatosVinculados = cliente.gatos || [];
  const totalGasto = gatosVinculados.reduce((sum, g) => sum + (Number(g.valor) || 0), 0);
  // gatos disponíveis para adicionar (os que não estão vinculados ainda)
  const gatosDisponiveis = gatos.filter(g => !gatosVinculados.find(gv => gv.id === g.id));

  return (
    <Layout title="Perfil do Cliente" showBack>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', borderRadius: 20, padding: '20px 18px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {iniciais}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{cliente.nome}</p>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.cor, background: st.bg, borderRadius: 20, padding: '2px 10px', display: 'inline-block', marginTop: 4 }}>{st.label}</span>
          </div>
          <button onClick={abrirEdit} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#fff' }}>
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* Informações */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        {cliente.telefone && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#475569' }}>
              <Phone size={15} color="#7c3aed" /> {cliente.telefone}
            </span>
            <button onClick={() => abrirWhatsApp(cliente.telefone)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
              <MessageCircle size={13} /> WhatsApp
            </button>
          </div>
        )}
        {cliente.cidade && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#475569' }}>
            <MapPin size={15} color="#7c3aed" /> {cliente.cidade}
          </span>
        )}
        {cliente.criado_em && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
            <CalendarDays size={14} /> Cliente desde {cliente.criado_em.split('-').reverse().join('/')}
          </span>
        )}
      </div>

      {/* Gatos adquiridos */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cat size={16} color="#7c3aed" /> Gatos adquiridos
            <span style={{ background: '#f5f0ff', color: '#7c3aed', borderRadius: 20, padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700 }}>{gatosVinculados.length}</span>
          </p>
          <button onClick={() => setShowAddGato(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
            <Plus size={13} /> Adicionar
          </button>
        </div>

        {gatosVinculados.length === 0 && (
          <p style={{ margin: '0 16px 14px', fontSize: '0.82rem', color: '#94a3b8' }}>Nenhum gato vinculado ainda.</p>
        )}

        {gatosVinculados.map((g, i) => (
          <div key={g.id} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i === 0 ? '1px solid #f1f5f9' : '1px solid #f8fafc' }}>
            {g.foto
              ? <img src={g.foto} alt={g.nome} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Cat size={20} color="#7c3aed" /></div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>{g.nome || 'Sem nome'}</p>
              {g.valor && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>{fmt(g.valor)}</p>}
            </div>
            <button onClick={() => navigate(`/gatos/${g.id}`)} style={{ background: '#eff6ff', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: '#1d4ed8' }}>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setConfirmRemove(g)} style={{ background: '#fff5f5', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: '#dc2626' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Total */}
        {totalGasto > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total gasto</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#16a34a' }}>{fmt(totalGasto)}</span>
          </div>
        )}
      </div>

      {/* Modal: adicionar gato */}
      {showAddGato && (
        <div className="modal-overlay" onClick={() => setShowAddGato(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddGato(false)}><X size={20} /></button>
            <p className="modal-title">Adicionar Gato</p>
            <form onSubmit={adicionarGato} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Gato *</label>
                <select required value={addForm.gato_id} onChange={e => setAddForm({ ...addForm, gato_id: e.target.value })}>
                  <option value="">Selecionar gato</option>
                  {gatosDisponiveis.map(g => <option key={g.id} value={g.id}>{g.nome || 'Sem nome'}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Valor da venda (R$)</label>
                <input type="number" step="0.01" min="0" value={addForm.valor} onChange={e => setAddForm({ ...addForm, valor: e.target.value })} placeholder="0,00" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!addForm.gato_id}>
                <Plus size={16} /> Adicionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: editar cliente */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEdit(false)}><X size={20} /></button>
            <p className="modal-title">Editar Cliente</p>
            <form onSubmit={salvarEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label>Nome *</label><input required value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} /></div>
              <div className="field"><label>Telefone</label><input value={editForm.telefone} onChange={e => setEditForm({ ...editForm, telefone: e.target.value })} /></div>
              <div className="field"><label>Cidade</label><input value={editForm.cidade} onChange={e => setEditForm({ ...editForm, cidade: e.target.value })} /></div>
              <div className="field">
                <label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="ativo">Ativo</option>
                  <option value="reserva">Reserva</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="field"><label>Data da venda</label><input type="date" value={editForm.data_venda} onChange={e => setEditForm({ ...editForm, data_venda: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary"><Plus size={16} /> Salvar</button>
            </form>
          </div>
        </div>
      )}

      {confirmRemove && (
        <ConfirmModal
          message={`Remover ${confirmRemove.nome} deste cliente?`}
          onConfirm={removerGato}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </Layout>
  );
}
