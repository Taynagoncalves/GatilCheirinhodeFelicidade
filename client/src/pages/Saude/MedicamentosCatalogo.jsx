import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pill, Syringe, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function MedicamentosCatalogo() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const toast = useToast();
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    api.get('/medicamentos', { params: { busca: busca || undefined } }).then((res) => setMedicamentos(res.data));
  };

  useEffect(() => {
    load();
  }, [busca]);

  const remove = async () => {
    await api.delete(`/medicamentos/${confirmId}`);
    toast('Medicamento excluído!', 'error');
    setConfirmId(null);
    load();
  };

  return (
    <Layout title="Medicamentos" showBack>
      <button className="btn btn-primary" onClick={() => navigate('/saude/medicamentos/novo')}>
        <Plus size={18} /> Novo Medicamento
      </button>

      <div className="search-input">
        <Search size={18} />
        <input placeholder="Buscar medicamento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <h2 className="section-title">Medicamentos Cadastrados</h2>

      {medicamentos.length === 0 && (
        <EmptyState icon={Pill} title="Nenhum medicamento cadastrado" description="Cadastre vacinas, vermífugos e outros medicamentos." />
      )}

      {medicamentos.map((m) => (
        <div key={m.id} className="list-row">
          <span className="card-photo-placeholder" style={{ width: 40, height: 40 }}>
            {m.categoria === 'vacina' ? <Syringe size={18} /> : <Pill size={18} />}
          </span>
          <p className="card-title" style={{ fontSize: '0.95rem', flex: 1 }}>{m.nome}</p>
          <button className="icon-btn danger" onClick={() => setConfirmId(m.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {confirmId && (
        <ConfirmModal
          message="Deseja remover este medicamento?"
          onConfirm={remove}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </Layout>
  );
}
