import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';

const TOUR = [
  {
    selector: '[data-tour="gatos-cadastrar"]',
    titulo: 'Cadastrar Gato',
    texto: 'Toque aqui para adicionar um novo filhote ao gatil ou cadastrar um pai reprodutor.',
  },
  {
    selector: '[data-tour="gatos-tabs-sexo"]',
    titulo: 'Filtro por Sexo',
    texto: 'Alterne entre Todos, Machos e Fêmeas para organizar a visualização dos gatos.',
  },
  {
    selector: '[data-tour="gatos-tabs-status"]',
    titulo: 'Filtro por Status',
    texto: 'Filtre por disponibilidade: Todos, Disponível, Reservado ou Vendido.',
  },
  {
    selector: '[data-tour="gatos-busca"]',
    titulo: 'Busca Rápida',
    texto: 'Digite o nome do gato para encontrá-lo rapidamente entre todos os cadastrados.',
  },
  {
    selector: '[data-tour="gatos-lista"]',
    titulo: 'Cards dos Gatos',
    texto: 'Toque em um card para ver o perfil completo. Os badges coloridos indicam dose urgente: vermelho = atrasada, laranja = hoje, azul = amanhã.',
  },
  {
    titulo: 'Alterar Status Rápido',
    texto: 'Dentro de cada card, toque no badge de status (ex: "Disponível ▾") para alterar rapidamente sem abrir o perfil completo.',
  },
  {
    titulo: 'Excluir Gato',
    texto: 'O ícone de lixeira no lado direito de cada card exclui o gato e todo o seu histórico de saúde permanentemente.',
  },
];

function alerteDose(proxima_dose_min, proxima_medicamento_nome) {
  if (!proxima_dose_min) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  const med = proxima_medicamento_nome ? ` · ${proxima_medicamento_nome}` : '';
  if (diff < 0) return { label: `Dose atrasada${med}`, cor: '#c0524a' };
  if (diff === 0) return { label: `Dose hoje!${med}`, cor: '#b8863a' };
  if (diff === 1) return { label: `Dose amanhã${med}`, cor: '#2f6690' };
  return { label: `Dose em dia${med}`, cor: '#3f8c5a' };
}

const STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível', cls: 'status-disponivel' },
  { value: 'reservado', label: 'Reservado', cls: 'status-reservado' },
  { value: 'vendido', label: 'Vendido', cls: 'status-vendido' },
  { value: 'mantido', label: 'Mantido no gatil', cls: 'status-mantido' },
];

export default function GatosList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [sexo, setSexo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState(searchParams.get('status') || '');
  const [gatos, setGatos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusOpen, setStatusOpen] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const toast = useToast();
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR, 'gatos');
    return () => setSteps([]);
  }, []);

  const excluir = async (id) => {
    await api.delete(`/gatos/${id}`);
    setGatos((prev) => prev.filter((g) => g.id !== id));
    setConfirmando(null);
    toast('Gato excluído com sucesso!');
  };

  const load = () => {
    api.get('/gatos', { params: { busca: busca || undefined, sexo: sexo || undefined, status: statusFiltro || undefined } }).then((res) => setGatos(res.data));
  };

  useEffect(() => { load(); }, [busca, sexo, statusFiltro]);

  const changeStatus = async (id, status) => {
    await api.patch(`/gatos/${id}/status`, { status });
    setGatos((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    setStatusOpen(null);
    toast('Status atualizado!');
  };

  return (
    <Layout title="Gatos" showBack>
      <button className="btn btn-primary" data-tour="gatos-cadastrar" onClick={() => setShowModal(true)}>
        <Plus size={18} /> Cadastrar Gato
      </button>

      <div className="tabs" data-tour="gatos-tabs-sexo">
        <button className={`tab${sexo === '' ? ' active' : ''}`} onClick={() => setSexo('')}>Todos</button>
        <button className={`tab${sexo === 'macho' ? ' active' : ''}`} onClick={() => setSexo('macho')}>Machos</button>
        <button className={`tab${sexo === 'femea' ? ' active' : ''}`} onClick={() => setSexo('femea')}>Fêmeas</button>
      </div>

      <div className="tabs" data-tour="gatos-tabs-status">
        <button className={`tab${statusFiltro === '' ? ' active' : ''}`} onClick={() => setStatusFiltro('')}>Todos</button>
        <button className={`tab${statusFiltro === 'disponivel' ? ' active' : ''}`} onClick={() => setStatusFiltro('disponivel')}>Disponível</button>
        <button className={`tab${statusFiltro === 'reservado' ? ' active' : ''}`} onClick={() => setStatusFiltro('reservado')}>Reservado</button>
        <button className={`tab${statusFiltro === 'vendido' ? ' active' : ''}`} onClick={() => setStatusFiltro('vendido')}>Vendido</button>
      </div>

      <div className="search-input" data-tour="gatos-busca">
        <Search size={18} />
        <input placeholder="Buscar gato..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {gatos.length === 0 && (
        <EmptyState icon={Cat} title="Nenhum gato cadastrado" description="Cadastre o primeiro gato do gatil." />
      )}

      <div data-tour="gatos-lista">
      {gatos.map((g) => {
        const alerta = alerteDose(g.proxima_dose_min, g.proxima_medicamento_nome);
        return (
        <div key={g.id} className="card" onClick={() => navigate(`/gatos/${g.id}`)} style={{ cursor: 'pointer' }}>
          <div className="card-row">
            {g.foto_url ? (
              <img src={g.foto_url} alt={g.nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder"><Cat size={26} /></span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <p className="card-title" style={{ margin: 0 }}>{g.nome || 'Sem nome'}</p>
                {alerta && (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                    background: alerta.cor, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap',
                  }}>{alerta.label}</span>
                )}
              </div>
              <p className="card-meta">
                {g.data_nascimento ? `${g.data_nascimento.split('-').reverse().join('/')}` : ''}
                {g.data_nascimento && <><br />Idade: {calcularIdade(g.data_nascimento)}</>}
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
        );
      })}

      </div>

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
