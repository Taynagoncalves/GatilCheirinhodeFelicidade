import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';

export default function GatosList() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [gatos, setGatos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/gatos', { params: { busca: busca || undefined } }).then((res) => setGatos(res.data));
  }, [busca]);

  return (
    <Layout title="Gatos" showBack>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        <Plus size={18} /> Cadastrar Gato
      </button>

      <div className="search-input">
        <Search size={18} />
        <input placeholder="Buscar gato..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {gatos.length === 0 && (
        <EmptyState icon={Cat} title="Nenhum gato cadastrado" description="Cadastre o primeiro gato do gatil." />
      )}

      {gatos.map((g) => (
        <div key={g.id} className="card">
          <div className="card-row">
            {g.foto_url ? (
              <img src={g.foto_url} alt={g.nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><Cat size={26} /></span>
            )}
            <div style={{ flex: 1 }}>
              <p className="card-title">{g.nome || 'Sem nome'}</p>
              <p className="card-meta">
                Nascimento: {g.data_nascimento ? new Date(g.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={g.status} />
              </div>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => navigate(`/gatos/${g.id}`)}>Ver Perfil</button>
              </div>
            </div>
          </div>
        </div>
      ))}

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
