import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, PawPrint, Pencil, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function PaisList() {
  const navigate = useNavigate();
  const [sexo, setSexo] = useState('macho');
  const [busca, setBusca] = useState('');
  const [pais, setPais] = useState([]);
  const toast = useToast();

  const load = () => {
    api.get('/pais', { params: { sexo, busca: busca || undefined } }).then((res) => setPais(res.data));
  };

  useEffect(() => {
    load();
  }, [sexo, busca]);

  const remove = async (id) => {
    if (!confirm('Deseja remover este registro?')) return;
    await api.delete(`/pais/${id}`);
    toast('Registro excluído!', 'error');
    load();
  };

  return (
    <Layout title="Pais" showBack>
      <button className="btn btn-primary" onClick={() => navigate('/pais/novo')}>
        <Plus size={18} /> Novo Pai ou Mãe
      </button>

      <div className="search-input">
        <Search size={18} />
        <input placeholder="Buscar Pais..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="tabs">
        <button className={`tab${sexo === 'macho' ? ' active' : ''}`} onClick={() => setSexo('macho')}>Pais</button>
        <button className={`tab${sexo === 'femea' ? ' active' : ''}`} onClick={() => setSexo('femea')}>Mães</button>
      </div>

      {pais.length === 0 && (
        <EmptyState icon={PawPrint} title="Nenhum registro encontrado" description="Cadastre o primeiro pai ou mãe do gatil." />
      )}

      {pais.map((p) => (
        <div key={p.id} className="card">
          <div className="card-row">
            {p.foto_url ? (
              <img src={p.foto_url} alt={p.nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><PawPrint size={26} /></span>
            )}
            <div style={{ flex: 1 }}>
              <p className="card-title">{p.nome}</p>
              <p className="card-meta">
                Raça: {p.raca || 'Não informado'}<br />
                Nascimento: {p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => navigate(`/pais/${p.id}/editar`)}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="icon-btn danger" onClick={() => remove(p.id)}>
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
