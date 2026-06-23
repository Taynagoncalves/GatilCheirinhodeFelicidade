import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, PawPrint, Trash2, ChevronRight, Calendar, Cat } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function NinhadasList() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [ninhadas, setNinhadas] = useState([]);

  const load = () => {
    api.get('/ninhadas', { params: { busca: busca || undefined } }).then((res) => setNinhadas(res.data));
  };

  useEffect(() => {
    load();
  }, [busca]);

  const remove = async (id) => {
    if (!confirm('Deseja remover esta ninhada?')) return;
    await api.delete(`/ninhadas/${id}`);
    load();
  };

  return (
    <Layout title="Ninhadas" showBack>
      <button className="btn btn-primary" onClick={() => navigate('/ninhadas/nova')}>
        <Plus size={18} /> Nova Ninhada
      </button>

      <div className="search-input">
        <Search size={18} />
        <input placeholder="Buscar ninhada..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {ninhadas.length === 0 && (
        <EmptyState icon={PawPrint} title="Nenhuma ninhada cadastrada" description="Cadastre a primeira ninhada do gatil." />
      )}

      {ninhadas.map((n) => (
        <div key={n.id} className="card">
          <div className="card-row">
            {n.mae_foto ? (
              <img src={n.mae_foto} alt={n.mae_nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><Cat size={26} /></span>
            )}
            <div style={{ flex: 1 }}>
              <p className="card-title">{n.nome}</p>
              <p className="card-meta">
                Mãe: {n.mae_nome || 'Não informado'}<br />
                Pai: {n.pai_nome || 'Não informado'}
              </p>
              <p className="card-meta" style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> {n.data_nascimento ? new Date(n.data_nascimento).toLocaleDateString('pt-BR') : '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PawPrint size={14} /> {n.quantidade_filhotes} filhotes
                </span>
              </p>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => navigate(`/ninhadas/${n.id}`)}>
                  Ver Detalhes <ChevronRight size={15} />
                </button>
                <button className="icon-btn danger" onClick={() => remove(n.id)}>
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Layout>
  );
}
