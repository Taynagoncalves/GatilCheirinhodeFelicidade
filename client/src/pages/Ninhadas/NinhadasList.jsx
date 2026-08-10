import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, PawPrint, Trash2, Calendar, Cat, Heart } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';

const diasAtras = (dataStr) => {
  if (!dataStr) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(`${dataStr}T00:00:00`);
  const dias = Math.round((hoje - data) / 86400000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias > 1) return `Há ${dias} dias`;
  return dataStr.split('-').reverse().join('/');
};

const TOUR = [
  {
    selector: '[data-tour="ninhadas-nova"]',
    titulo: 'Nova Ninhada',
    texto: 'Toque para registrar uma nova ninhada: informe o pai, a mãe, a data de nascimento e os filhotes.',
  },
  {
    selector: '[data-tour="ninhadas-busca"]',
    titulo: 'Busca',
    texto: 'Pesquise pelo nome da ninhada para encontrá-la rapidamente.',
  },
  {
    selector: '[data-tour="ninhadas-lista"]',
    titulo: 'Cards de Ninhadas',
    texto: 'Toque em um card para abrir os detalhes completos da ninhada, incluindo todos os filhotes registrados.',
  },
  {
    titulo: 'Editar Ninhada',
    texto: 'Dentro dos detalhes de uma ninhada, você encontra o botão "Editar Ninhada" para alterar qualquer informação.',
  },
];

export default function NinhadasList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'cios' ? 'cios' : 'ninhadas';
  const [busca, setBusca] = useState('');
  const [ninhadas, setNinhadas] = useState([]);
  const [cios, setCios] = useState([]);
  const toast = useToast();
  const [confirmId, setConfirmId] = useState(null);
  const [confirmCioId, setConfirmCioId] = useState(null);
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR, 'ninhadas');
    return () => setSteps([]);
  }, []);

  const setTab = (t) => setSearchParams(t === 'cios' ? { tab: 'cios' } : {});

  const load = () => {
    api.get('/ninhadas', { params: { busca: busca || undefined } }).then((res) => setNinhadas(res.data));
  };

  const loadCios = () => {
    api.get('/cios', { params: { busca: busca || undefined } }).then((res) => setCios(res.data));
  };

  useEffect(() => {
    if (tab === 'cios') loadCios();
    else load();
  }, [busca, tab]);

  const remove = async () => {
    await api.delete(`/ninhadas/${confirmId}`);
    toast('Ninhada excluída!', 'error');
    setConfirmId(null);
    load();
  };

  const removeCio = async () => {
    await api.delete(`/cios/${confirmCioId}`);
    toast('Registro de cio excluído!', 'error');
    setConfirmCioId(null);
    loadCios();
  };

  return (
    <Layout title="Ninhadas" showBack>
      <div className="tabs" data-tour="ninhadas-tabs">
        <button className={`tab${tab === 'ninhadas' ? ' active' : ''}`} onClick={() => setTab('ninhadas')}>Ninhadas</button>
        <button className={`tab${tab === 'cios' ? ' active' : ''}`} onClick={() => setTab('cios')}>Registros de Cio</button>
      </div>

      {tab === 'ninhadas' ? (
        <button className="btn btn-primary" data-tour="ninhadas-nova" onClick={() => navigate('/ninhadas/nova')}>
          <Plus size={18} /> Nova Ninhada
        </button>
      ) : (
        <button className="btn btn-primary" onClick={() => navigate('/ninhadas/cios/novo')}>
          <Plus size={18} /> Registrar Cio
        </button>
      )}

      <div className="search-input" data-tour="ninhadas-busca">
        <Search size={18} />
        <input placeholder={tab === 'ninhadas' ? 'Buscar ninhada...' : 'Buscar por gata ou macho...'} value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {tab === 'ninhadas' ? (
        <>
          {ninhadas.length === 0 && (
            <EmptyState icon={PawPrint} title="Nenhuma ninhada cadastrada" description="Cadastre a primeira ninhada do gatil." />
          )}

          <div data-tour="ninhadas-lista" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ninhadas.map((n) => (
            <div key={n.id} className="card ninhada-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/ninhadas/${n.id}`)}>
              <div className="card-row">
                {n.foto_url ? (
                  <img src={n.foto_url} alt={n.nome} className="card-photo" />
                ) : (
                  <span className="card-photo-placeholder"><Cat size={26} /></span>
                )}
                <div style={{ flex: 1 }}>
                  <p className="card-title">{n.nome}</p>
                  <p className="card-meta">
                    Mãe: {n.mae_nome || 'Não informado'}<br />
                    Pai: {n.pai_nome || 'Não informado'}
                  </p>
                  <p className="card-meta" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} /> {n.data_nascimento ? n.data_nascimento.split('-').reverse().join('/') : '—'}
                    </span>
                    <span className="pill-count">
                      <PawPrint size={12} /> {n.quantidade_filhotes} filhotes
                    </span>
                  </p>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn danger" onClick={() => setConfirmId(n.id)}>
                      <Trash2 size={15} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <>
          {cios.length === 0 && (
            <EmptyState icon={Heart} title="Nenhum cio registrado" description="Registre o cio de uma gata reprodutora e o macho utilizado no cruzamento." />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cios.map((c) => (
            <div key={c.id} className="card cio-card">
              <div className="card-row">
                <div className="cio-duo">
                  {c.gata_foto ? (
                    <img src={c.gata_foto} alt={c.gata_nome} className="cio-photo" />
                  ) : (
                    <span className="cio-photo-placeholder"><Cat size={22} /></span>
                  )}
                  <span className="cio-heart"><Heart size={12} fill="currentColor" /></span>
                  {c.macho_foto ? (
                    <img src={c.macho_foto} alt={c.macho_nome} className="cio-photo" />
                  ) : (
                    <span className="cio-photo-placeholder"><Cat size={22} /></span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="card-title">{c.gata_nome || 'Gata não informada'}</p>
                  <p className="card-meta">
                    Macho: {c.macho_nome || 'Não informado'}
                  </p>
                  <span className="cio-date-pill">
                    <Calendar size={12} /> {diasAtras(c.data_registro)}
                  </span>
                  <div className="card-actions">
                    <button className="icon-btn danger" onClick={() => setConfirmCioId(c.id)}>
                      <Trash2 size={15} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      {confirmId && (
        <ConfirmModal
          message="Deseja remover esta ninhada?"
          onConfirm={remove}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {confirmCioId && (
        <ConfirmModal
          message="Deseja remover este registro de cio?"
          onConfirm={removeCio}
          onCancel={() => setConfirmCioId(null)}
        />
      )}
    </Layout>
  );
}
