import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users, Trash2, Layers, CheckCircle2, AlertCircle, Clock, ChevronDown, Mars, Venus, LayoutGrid, List, Syringe } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import Observacao from '../../components/Observacao';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';
import { formatarPeso } from '../../utils/peso';

const TOUR = [
  {
    selector: '[data-tour="gatos-cadastrar"]',
    titulo: 'Cadastrar Gato',
    texto: 'Toque aqui para adicionar um novo filhote ao gatil ou cadastrar um pai reprodutor.',
  },
  {
    selector: '[data-tour="gatos-filtros"]',
    titulo: 'Busca e Filtros',
    texto: 'Busque pelo nome, escolha o sexo (Machos/Fêmeas) e filtre por status (Disponível, Reservado, Vendido, Mantido).',
  },
  {
    selector: '[data-tour="gatos-visualizacao"]',
    titulo: 'Lista ou Grade',
    texto: 'Alterne entre a lista detalhada e a grade de fotos, ideal para ver todos os filhotes de uma vez.',
  },
  {
    selector: '[data-tour="gatos-lista"]',
    titulo: 'Cards dos Gatos',
    texto: 'Toque em um card para ver o perfil completo. O aviso de dose fica vermelho quando atrasada, laranja quando é hoje e azul quando é amanhã.',
  },
  {
    titulo: 'Alterar Status Rápido',
    texto: 'Toque no status do card (ex: "Disponível ▾") para alterar rapidamente sem abrir o perfil completo.',
  },
  {
    titulo: 'Excluir Gato',
    texto: 'No mesmo menu de status há a opção Excluir, que remove o gato e todo o seu histórico de saúde permanentemente.',
  },
];

function alerteDose(proxima_dose_min) {
  if (!proxima_dose_min) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { status: 'Dose atrasada',        cor: '#c0524a', bg: '#fdecea', icon: AlertCircle, urgente: true };
  if (diff === 0) return { status: 'Dose hoje!',           cor: '#b8863a', bg: '#fef3e2', icon: Clock };
  if (diff === 1) return { status: 'Dose amanhã',          cor: '#2f6690', bg: '#eaf3fb', icon: CheckCircle2 };
  if (diff <= 7)  return { status: `Dose em ${diff} dias`, cor: '#3f8c5a', bg: '#edf7f1', icon: CheckCircle2 };
  return { status: `Dose em ${diff} dias`,                 cor: '#64748b', bg: '#f1f5f9', icon: CheckCircle2 };
}

const STATUS = {
  disponivel: { label: 'Disponível', cor: '#3f8c5a', bg: '#e3f3e8' },
  reservado:  { label: 'Reservado',  cor: '#b8863a', bg: '#fbf1de' },
  vendido:    { label: 'Vendido',    cor: '#7a4fa0', bg: '#f0e9f6' },
  mantido:    { label: 'Mantido',    cor: '#2f6690', bg: '#eaf2f8' },
};
const STATUS_PADRAO = { cor: '#64748b', bg: '#f1f5f9' };

const SEXO_OPTS = [
  { v: '', l: 'Todos', icon: PawPrint },
  { v: 'macho', l: 'Machos', icon: Mars },
  { v: 'femea', l: 'Fêmeas', icon: Venus },
];

const VIEW_KEY = 'gatos-visualizacao';

function lerVisualizacao() {
  try { return localStorage.getItem(VIEW_KEY) || 'lista'; } catch { return 'lista'; }
}

function formatarData(iso) {
  return iso ? iso.split('-').reverse().join('/') : null;
}

function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function SexoBadge({ sexo, size = 13 }) {
  if (sexo !== 'macho' && sexo !== 'femea') return null;
  const Icon = sexo === 'macho' ? Mars : Venus;
  return (
    <span className={`gl-sexo gl-sexo-${sexo}`} title={sexo === 'macho' ? 'Macho' : 'Fêmea'}>
      <Icon size={size} strokeWidth={2.6} />
    </span>
  );
}

function StatusMenu({ gato, aberto, onToggle, onChange, onExcluir }) {
  const s = STATUS[gato.status] || { ...STATUS_PADRAO, label: gato.status };
  return (
    <div className="gl-status" onClick={(e) => e.stopPropagation()}>
      <button className="gl-status-pill" onClick={onToggle} style={{ background: s.bg, color: s.cor }}>
        <span className="gl-dot" style={{ background: s.cor }} />
        {s.label}
        <ChevronDown size={12} style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {aberto && (
        <div className="gl-status-menu">
          {Object.entries(STATUS).map(([value, opt]) => (
            <button key={value} className={gato.status === value ? 'ativo' : ''} onClick={() => onChange(value)}>
              <span className="gl-dot" style={{ background: opt.cor }} />
              {opt.label}
            </button>
          ))}
          <button className="gl-excluir" onClick={onExcluir}>
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function Foto({ gato, iconSize = 32 }) {
  return gato.foto_url
    ? <img className="gl-foto" src={gato.foto_url} alt={gato.nome} loading="lazy" />
    : <div className="gl-foto-vazia"><Cat size={iconSize} /></div>;
}

function Avatar({ foto, cor, bg }) {
  return foto
    ? <img className="gl-avatar" src={foto} alt="" />
    : <span className="gl-avatar" style={{ background: bg }}><Cat size={12} color={cor} /></span>;
}

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
  const [visualizacao, setVisualizacao] = useState(lerVisualizacao);
  const toast = useToast();
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR, 'gatos');
    return () => setSteps([]);
  }, []);

  useEffect(() => {
    if (statusOpen === null) return;
    const fechar = () => setStatusOpen(null);
    document.addEventListener('click', fechar);
    return () => document.removeEventListener('click', fechar);
  }, [statusOpen]);

  const trocarVisualizacao = (v) => {
    setVisualizacao(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem storage */ }
  };

  const excluir = async (id) => {
    await api.delete(`/gatos/${id}`);
    setGatos((prev) => prev.filter((g) => g.id !== id));
    setConfirmando(null);
    toast('Gato excluído com sucesso!');
  };

  const load = () => {
    api.get('/gatos', { params: { busca: busca || undefined, sexo: sexo || undefined, status: statusFiltro || undefined } })
      .then((res) => setGatos(res.data));
  };

  useEffect(() => { load(); }, [busca, sexo, statusFiltro]);

  const changeStatus = async (id, status) => {
    await api.patch(`/gatos/${id}/status`, { status });
    setGatos((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    setStatusOpen(null);
    toast('Status atualizado!');
  };

  const statusMenuProps = (g) => ({
    gato: g,
    aberto: statusOpen === g.id,
    onToggle: () => setStatusOpen(statusOpen === g.id ? null : g.id),
    onChange: (status) => changeStatus(g.id, status),
    onExcluir: () => { setStatusOpen(null); setConfirmando(g); },
  });

  const renderCard = (g, i) => {
    const alerta = alerteDose(g.proxima_dose_min);
    const AlertaIcon = alerta?.icon;
    const sub = [g.cor, g.ninhada_nome].filter(Boolean);
    const temPais = g.mae_nome || g.pai_nome;

    return (
      <div key={g.id} className="gl-card" onClick={() => navigate(`/gatos/${g.id}`)} style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, zIndex: statusOpen === g.id ? 5 : undefined }}>
        <div className="gl-card-corpo">
          <div className="gl-foto-wrap">
            <Foto gato={g} />
            <SexoBadge sexo={g.sexo} />
          </div>

          <div className="gl-info">
            <div className="gl-topo">
              <div style={{ minWidth: 0 }}>
                <p className="gl-nome">{g.nome || 'Sem nome'}</p>
                {sub.length > 0 && (
                  <p className="gl-sub">
                    {g.ninhada_nome && <Layers size={12} />}
                    {sub.join(' · ')}
                  </p>
                )}
              </div>
              <StatusMenu {...statusMenuProps(g)} />
            </div>

            <div className="gl-stats">
              <div className="gl-stat">
                <span className="gl-stat-label">Idade</span>
                <span className="gl-stat-valor">{calcularIdade(g.data_nascimento) || '—'}</span>
              </div>
              <div className="gl-stat">
                <span className="gl-stat-label">Peso</span>
                <span className="gl-stat-valor">{g.peso != null ? formatarPeso(g.peso) : '—'}</span>
              </div>
              <div className="gl-stat">
                <span className="gl-stat-label">Nasc.</span>
                <span className="gl-stat-valor">{formatarData(g.data_nascimento) || '—'}</span>
              </div>
            </div>

            {g.status === 'vendido' && g.cliente_nome && (
              <span className="gl-cliente" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${g.cliente_id}`); }}>
                <span className="gl-cliente-ini">{iniciais(g.cliente_nome)}</span>
                <span style={{ minWidth: 0, display: 'flex', gap: 4 }}>Vendido para <b>{g.cliente_nome}</b></span>
              </span>
            )}
          </div>
        </div>

        <Observacao texto={g.observacoes} />

        {(temPais || alerta) && (
          <div className="gl-rodape">
            {temPais && (
              <div className="gl-pais">
                <div className="gl-avatares">
                  {g.mae_nome && <Avatar foto={g.mae_foto} cor="#c2568a" bg="#fbeaf2" />}
                  {g.pai_nome && <Avatar foto={g.pai_foto} cor="#2f6690" bg="#eaf2f8" />}
                </div>
                <div className="gl-pais-nomes">
                  {g.mae_nome && <span>Mãe <b>{g.mae_nome}</b></span>}
                  {g.pai_nome && <span>Pai <b>{g.pai_nome}</b></span>}
                </div>
              </div>
            )}

            {alerta && (
              <div className={`gl-dose${alerta.urgente ? ' gl-dose-urgente' : ''}`} style={{ background: alerta.bg }}>
                <AlertaIcon size={16} color={alerta.cor} style={{ flexShrink: 0 }} />
                <div className="gl-dose-texto">
                  <strong style={{ color: alerta.cor }}>{alerta.status}</strong>
                  <span>{g.proxima_medicamento_nome || 'Medicamento'} · {formatarData(g.proxima_dose_min)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTile = (g, i) => {
    const alerta = alerteDose(g.proxima_dose_min);
    const idade = calcularIdade(g.data_nascimento);

    return (
      <div key={g.id} className="gl-tile" onClick={() => navigate(`/gatos/${g.id}`)} style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, zIndex: statusOpen === g.id ? 5 : undefined }}>
        <div className="gl-tile-foto">
          <Foto gato={g} iconSize={40} />
          <SexoBadge sexo={g.sexo} size={12} />
          <div className="gl-tile-legenda">
            <p>{g.nome || 'Sem nome'}</p>
            {(idade || g.peso != null) && (
              <span>{[idade, g.peso != null && formatarPeso(g.peso)].filter(Boolean).join(' · ')}</span>
            )}
          </div>
        </div>
        <StatusMenu {...statusMenuProps(g)} />
        <div className="gl-tile-rodape" style={alerta ? { color: alerta.cor } : undefined}>
          {alerta
            ? <><Syringe size={13} style={{ flexShrink: 0 }} /><span>{alerta.status}</span></>
            : <><Layers size={13} style={{ flexShrink: 0 }} /><span>{g.ninhada_nome || 'Sem ninhada'}</span></>}
        </div>
        <Observacao texto={g.observacoes} compacta />
      </div>
    );
  };

  return (
    <Layout title="Gatos" showBack>
      <button className="btn btn-primary" data-tour="gatos-cadastrar" onClick={() => setShowModal(true)}>
        <Plus size={18} /> Cadastrar Gato
      </button>

      <div className="gl-toolbar" data-tour="gatos-filtros">
        <div className="search-input" data-tour="gatos-busca">
          <Search size={18} />
          <input placeholder="Buscar gato pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca && <X size={16} style={{ cursor: 'pointer' }} onClick={() => setBusca('')} />}
        </div>

        <div className="gl-segment">
          {SEXO_OPTS.map(({ v, l, icon: Icon }) => (
            <button key={v} className={sexo === v ? 'ativo' : ''} onClick={() => setSexo(v)}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>

        <div className="gl-chips">
          <button className={`gl-chip${statusFiltro === '' ? ' ativo' : ''}`} onClick={() => setStatusFiltro('')}>
            Todos
          </button>
          {Object.entries(STATUS).map(([value, s]) => (
            <button
              key={value}
              className={`gl-chip${statusFiltro === value ? ' ativo' : ''}`}
              style={{ '--chip-cor': s.cor }}
              onClick={() => setStatusFiltro(value)}
            >
              <span className="gl-dot" style={{ background: s.cor }} /> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gl-resumo">
        <span className="gl-resumo-texto">
          <strong>{gatos.length}</strong> {gatos.length === 1 ? 'gato encontrado' : 'gatos encontrados'}
        </span>
        <div className="gl-view-toggle" data-tour="gatos-visualizacao">
          <button className={visualizacao === 'lista' ? 'ativo' : ''} onClick={() => trocarVisualizacao('lista')} aria-label="Ver em lista">
            <List size={16} />
          </button>
          <button className={visualizacao === 'grade' ? 'ativo' : ''} onClick={() => trocarVisualizacao('grade')} aria-label="Ver em grade">
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {gatos.length === 0 && (
        <EmptyState icon={Cat} title="Nenhum gato cadastrado" description="Cadastre o primeiro gato do gatil." />
      )}

      <div data-tour="gatos-lista" className={visualizacao === 'grade' ? 'gl-grade' : 'gl-lista'}>
        {gatos.map(visualizacao === 'grade' ? renderTile : renderCard)}
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
