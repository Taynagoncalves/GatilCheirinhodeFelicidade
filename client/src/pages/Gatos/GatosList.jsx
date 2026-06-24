import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível', cls: 'status-disponivel' },
  { value: 'reservado', label: 'Reservado', cls: 'status-reservado' },
  { value: 'vendido', label: 'Vendido', cls: 'status-vendido' },
  { value: 'mantido', label: 'Mantido no gatil', cls: 'status-mantido' },
];

export default function GatosList() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [sexo, setSexo] = useState('');
  const [gatos, setGatos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusOpen, setStatusOpen] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const toast = useToast();

  const excluir = async (id) => {
    await api.delete(`/gatos/${id}`);
    setGatos((prev) => prev.filter((g) => g.id !== id));
    setConfirmando(null);
    toast('Gato excluído com sucesso!');
  };

  const load = () => {
    api.get('/gatos', { params: { busca: busca || undefined, sexo: sexo || undefined } }).then((res) => setGatos(res.data));
  };

  useEffect(() => { load(); }, [busca, sexo]);

  const changeStatus = async (id, status) => {
    await api.patch(`/gatos/${id}/status`, { status });
    setGatos((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    setStatusOpen(null);
    toast('Status atualizado!');
  };

  return (
    <Layout title="Gatos" showBack>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        <Plus size={18} /> Cadastrar Gato
      </button>

      <div className="tabs">
        <button className={`tab${sexo === '' ? ' active' : ''}`} onClick={() => setSexo('')}>Todos</button>
        <button className={`tab${sexo === 'macho' ? ' active' : ''}`} onClick={() => setSexo('macho')}>Machos</button>
        <button className={`tab${sexo === 'femea' ? ' active' : ''}`} onClick={() => setSexo('femea')}>Fêmeas</button>
      </div>

      <div className="search-input">
        <Search size={18} />
        <input placeholder="Buscar gato..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {gatos.length === 0 && (
        <EmptyState icon={Cat} title="Nenhum gato cadastrado" description="Cadastre o primeiro gato do gatil." />
      )}

      {gatos.map((g) => (
        <div key={g.id} className="card" onClick={() => navigate(`/gatos/${g.id}`)} style={{ cursor: 'pointer' }}>
          <div className="card-row">
            {g.foto_url ? (
              <img src={g.foto_url} alt={g.nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><Cat size={26} /></span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="card-title">{g.nome || 'Sem nome'}</p>
              <p className="card-meta">
                {g.data_nascimento ? `Nasc: ${g.data_nascimento.split('-').reverse().join('/')}` : ''}
                {g.mae_nome && <><br />Mãe: {g.mae_nome}</>}
                {g.pai_nome && <><br />Pai: {g.pai_nome}</>}
                {g.ninhada_nome && <><br />Ninhada: {g.ninhada_nome}</>}
              </p>

              <div style={{ marginTop: 8, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <span
                  className={`status-badge status-${g.status}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setStatusOpen(statusOpen === g.id ? null : g.id)}
                >
                  {STATUS_OPTIONS.find((s) => s.value === g.status)?.label || g.status} ▾
                </span>

                {statusOpen === g.id && (
                  <div style={{
                    position: 'absolute', top: '110%', left: 0, zIndex: 30,
                    background: '#fff', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-elevated)',
                    minWidth: 160, overflow: 'hidden',
                  }}>
                    {STATUS_OPTIONS.map((s) => (
                      <div
                        key={s.value}
                        onClick={() => changeStatus(g.id, s.value)}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', fontSize: '0.9rem',
                          fontWeight: g.status === s.value ? 700 : 400,
                          background: g.status === s.value ? 'var(--color-primary-light)' : 'transparent',
                        }}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <button
              className="icon-btn"
              style={{ color: 'var(--color-danger)', alignSelf: 'center', flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); setConfirmando(g); }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      {confirmando && (
        <ConfirmModal
          message={`Excluir ${confirmando.nome || 'este gato'}? Todo o histórico de saúde será removido.`}
          onConfirm={() => excluir(confirmando.id)}
          onCancel={() => setConfirmando(null)}
        />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            <p className="modal-title">O que deseja fazer?</p>
            <button className="btn btn-primary" onClick={() => navigate('/gatos/novo')}>
              <PawPrint size={18} /> Cadastrar Filhote
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/pais')}>
              <Users size={18} /> Ver Pais
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
