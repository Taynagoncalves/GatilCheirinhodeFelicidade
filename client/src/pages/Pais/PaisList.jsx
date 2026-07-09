import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, PawPrint, Pencil, Trash2 } from 'lucide-react';

function alerteDose(proxima_dose_min, proxima_medicamento_nome) {
  if (!proxima_dose_min) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  const med = proxima_medicamento_nome ? ` · ${proxima_medicamento_nome}` : '';
  if (diff < 0) return { label: `Dose atrasada${med}`, cor: '#c0524a' };
  if (diff === 0) return { label: `Dose hoje!${med}`, cor: '#b8863a' };
  if (diff === 1) return { label: `Dose amanhã${med}`, cor: '#2f6690' };
  return { label: `Dose em dia${med}`, cor: '#3f8c5a' };
}
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';

const TOUR = [
  {
    selector: '[data-tour="pais-cadastrar"]',
    titulo: 'Novo Pai ou Mãe',
    texto: 'Toque aqui para cadastrar um novo reprodutor — informe nome, raça, cor, data de nascimento e foto.',
  },
  {
    selector: '[data-tour="pais-busca"]',
    titulo: 'Busca',
    texto: 'Pesquise pelo nome do pai ou mãe para encontrá-lo rapidamente na lista.',
  },
  {
    selector: '[data-tour="pais-tabs"]',
    titulo: 'Pais e Mães',
    texto: 'Alterne entre Pais (machos) e Mães (fêmeas) com um toque.',
  },
  {
    selector: '[data-tour="pais-lista"]',
    titulo: 'Cards de Reprodutores',
    texto: 'Toque em um card para ver o perfil completo. O badge colorido indica o status da dose — vermelho para atrasada, laranja para hoje e verde para em dia. Use Editar ou Excluir sem precisar abrir o perfil.',
  },
];

export default function PaisList() {
  const navigate = useNavigate();
  const [sexo, setSexo] = useState('macho');
  const [busca, setBusca] = useState('');
  const [pais, setPais] = useState([]);
  const toast = useToast();
  const [confirmId, setConfirmId] = useState(null);
  const { setSteps } = useTour();

  useEffect(() => { setSteps(TOUR, 'pais'); return () => setSteps([]); }, []);

  const load = () => {
    api.get('/pais', { params: { sexo, busca: busca || undefined } }).then((res) => setPais(res.data));
  };

  useEffect(() => {
    load();
  }, [sexo, busca]);

  const remove = async () => {
    await api.delete(`/pais/${confirmId}`);
    toast('Registro excluído!', 'error');
    setConfirmId(null);
    load();
  };

  return (
    <Layout title="Pais" showBack>
      <button className="btn btn-primary" data-tour="pais-cadastrar" onClick={() => navigate('/pais/novo')}>
        <Plus size={18} /> Novo Pai ou Mãe
      </button>

      <div className="search-input" data-tour="pais-busca">
        <Search size={18} />
        <input placeholder="Buscar Pais..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="tabs" data-tour="pais-tabs">
        <button className={`tab${sexo === 'macho' ? ' active' : ''}`} onClick={() => setSexo('macho')}>Pais</button>
        <button className={`tab${sexo === 'femea' ? ' active' : ''}`} onClick={() => setSexo('femea')}>Mães</button>
      </div>

      {pais.length === 0 && (
        <EmptyState icon={PawPrint} title="Nenhum registro encontrado" description="Cadastre o primeiro pai ou mãe do gatil." />
      )}

      <div data-tour="pais-lista">
      {pais.map((p) => {
        const alerta = alerteDose(p.proxima_dose_min, p.proxima_medicamento_nome);
        return (
        <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/pais/${p.id}`)}>
          <div className="card-row">
            {p.foto_url ? (
              <img src={p.foto_url} alt={p.nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><PawPrint size={26} /></span>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <p className="card-title" style={{ margin: 0 }}>{p.nome}</p>
                {alerta && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: alerta.cor, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                    {alerta.label}
                  </span>
                )}
              </div>
              <p className="card-meta">
                Raça: {p.raca || 'Não informado'}<br />
                Nascimento: {p.data_nascimento ? p.data_nascimento.split('-').reverse().join('/') : 'Não informado'}
              </p>
              <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" onClick={() => navigate(`/pais/${p.id}/editar`)}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="icon-btn danger" onClick={() => setConfirmId(p.id)}>
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })}
      </div>
      {confirmId && (
        <ConfirmModal
          message="Deseja remover este registro?"
          onConfirm={remove}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </Layout>
  );
}
