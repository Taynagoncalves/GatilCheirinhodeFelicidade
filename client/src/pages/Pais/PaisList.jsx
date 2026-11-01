import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, PawPrint, Pencil, Trash2, X, Mars, Venus, List, LayoutGrid, Syringe, AlertCircle, Clock, CheckCircle2, Palette } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import Observacao from '../../components/Observacao';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';
import { formatarPeso } from '../../utils/peso';

function alerteDose(proxima_dose_min) {
  if (!proxima_dose_min) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { status: 'Dose atrasada', cor: '#c0524a', bg: '#fdecea', icon: AlertCircle, urgente: true };
  if (diff === 0) return { status: 'Dose hoje!',    cor: '#b8863a', bg: '#fef3e2', icon: Clock };
  if (diff === 1) return { status: 'Dose amanhã',   cor: '#2f6690', bg: '#eaf3fb', icon: CheckCircle2 };
  return { status: 'Dose em dia',                   cor: '#3f8c5a', bg: '#edf7f1', icon: CheckCircle2 };
}

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
    selector: '[data-tour="pais-visualizacao"]',
    titulo: 'Lista ou Grade',
    texto: 'Alterne entre a lista detalhada e a grade de fotos.',
  },
  {
    selector: '[data-tour="pais-lista"]',
    titulo: 'Cards de Reprodutores',
    texto: 'Toque em um card para ver o perfil completo. O aviso de dose fica vermelho quando atrasada, laranja quando é hoje e verde quando está em dia. Use os botões de lápis e lixeira para editar ou excluir sem abrir o perfil.',
  },
];

const VIEW_KEY = 'pais-visualizacao';

function lerVisualizacao() {
  try { return localStorage.getItem(VIEW_KEY) || 'lista'; } catch { return 'lista'; }
}

function formatarData(iso) {
  return iso ? iso.split('-').reverse().join('/') : null;
}

function Foto({ pai, iconSize = 30 }) {
  return pai.foto_url
    ? <img className="gl-foto" src={pai.foto_url} alt={pai.nome} loading="lazy" />
    : <div className="gl-foto-vazia"><PawPrint size={iconSize} /></div>;
}

function SexoBadge({ sexo, size = 13 }) {
  if (sexo !== 'macho' && sexo !== 'femea') return null;
  const Icon = sexo === 'macho' ? Mars : Venus;
  return (
    <span className={`gl-sexo gl-sexo-${sexo}`} title={sexo === 'macho' ? 'Pai' : 'Mãe'}>
      <Icon size={size} strokeWidth={2.6} />
    </span>
  );
}

export default function PaisList() {
  const navigate = useNavigate();
  const [sexo, setSexo] = useState('macho');
  const [busca, setBusca] = useState('');
  const [pais, setPais] = useState([]);
  const toast = useToast();
  const [confirmId, setConfirmId] = useState(null);
  const [visualizacao, setVisualizacao] = useState(lerVisualizacao);
  const { setSteps } = useTour();

  useEffect(() => { setSteps(TOUR, 'pais'); return () => setSteps([]); }, []);

  const load = () => {
    api.get('/pais', { params: { sexo, busca: busca || undefined } }).then((res) => setPais(res.data));
  };

  useEffect(() => {
    load();
  }, [sexo, busca]);

  const trocarVisualizacao = (v) => {
    setVisualizacao(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem storage */ }
  };

  const remove = async () => {
    await api.delete(`/pais/${confirmId}`);
    toast('Registro excluído!', 'error');
    setConfirmId(null);
    load();
  };

  const acoes = (p) => (
    <div className="gl-acoes" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => navigate(`/pais/${p.id}/editar`)} aria-label="Editar"><Pencil size={14} /></button>
      <button className="danger" onClick={() => setConfirmId(p.id)} aria-label="Excluir"><Trash2 size={14} /></button>
    </div>
  );

  const renderCard = (p, i) => {
    const alerta = alerteDose(p.proxima_dose_min);
    const AlertaIcon = alerta?.icon;
    const sub = [p.raca, p.cor].filter(Boolean);

    return (
      <div key={p.id} className="gl-card" onClick={() => navigate(`/pais/${p.id}`)} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
        <div className="gl-card-corpo">
          <div className="gl-foto-wrap">
            <Foto pai={p} />
            <SexoBadge sexo={p.sexo} />
          </div>

          <div className="gl-info">
            <div className="gl-topo">
              <div style={{ minWidth: 0 }}>
                <p className="gl-nome">{p.nome}</p>
                <p className="gl-sub">
                  {p.cor && <Palette size={12} />}
                  {sub.length > 0 ? sub.join(' · ') : 'Raça não informada'}
                </p>
              </div>
              {acoes(p)}
            </div>

            <div className="gl-stats">
              <div className="gl-stat">
                <span className="gl-stat-label">Idade</span>
                <span className="gl-stat-valor">{calcularIdade(p.data_nascimento) || '—'}</span>
              </div>
              <div className="gl-stat">
                <span className="gl-stat-label">Peso</span>
                <span className="gl-stat-valor">{p.peso != null ? formatarPeso(p.peso) : '—'}</span>
              </div>
              <div className="gl-stat">
                <span className="gl-stat-label">Nasc.</span>
                <span className="gl-stat-valor">{formatarData(p.data_nascimento) || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <Observacao texto={p.observacoes} />

        {alerta && (
          <div className="gl-rodape">
            <div className={`gl-dose${alerta.urgente ? ' gl-dose-urgente' : ''}`} style={{ background: alerta.bg, maxWidth: '100%' }}>
              <AlertaIcon size={16} color={alerta.cor} style={{ flexShrink: 0 }} />
              <div className="gl-dose-texto">
                <strong style={{ color: alerta.cor }}>{alerta.status}</strong>
                <span>{p.proxima_medicamento_nome || 'Medicamento'} · {formatarData(p.proxima_dose_min)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTile = (p, i) => {
    const alerta = alerteDose(p.proxima_dose_min);
    const idade = calcularIdade(p.data_nascimento);

    return (
      <div key={p.id} className="gl-tile" onClick={() => navigate(`/pais/${p.id}`)} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
        <div className="gl-tile-foto">
          <Foto pai={p} iconSize={40} />
          <SexoBadge sexo={p.sexo} size={12} />
          <div className="gl-tile-legenda">
            <p>{p.nome}</p>
            {(idade || p.raca) && <span>{[p.raca, idade].filter(Boolean).join(' · ')}</span>}
          </div>
        </div>
        <div className="gl-status">{acoes(p)}</div>
        <div className="gl-tile-rodape" style={alerta ? { color: alerta.cor } : undefined}>
          {alerta
            ? <><Syringe size={13} style={{ flexShrink: 0 }} /><span>{alerta.status}</span></>
            : <><Syringe size={13} style={{ flexShrink: 0 }} /><span>Sem dose agendada</span></>}
        </div>
        <Observacao texto={p.observacoes} compacta />
      </div>
    );
  };

  return (
    <Layout title="Pais" showBack>
      <button className="btn btn-primary" data-tour="pais-cadastrar" onClick={() => navigate('/pais/novo')}>
        <Plus size={18} /> Novo Pai ou Mãe
      </button>

      <div className="gl-toolbar">
        <div className="search-input" data-tour="pais-busca">
          <Search size={18} />
          <input placeholder="Buscar pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca && <X size={16} style={{ cursor: 'pointer' }} onClick={() => setBusca('')} />}
        </div>

        <div className="gl-segment" data-tour="pais-tabs">
          <button className={sexo === 'macho' ? 'ativo' : ''} onClick={() => setSexo('macho')}>
            <Mars size={14} /> Pais
          </button>
          <button className={sexo === 'femea' ? 'ativo' : ''} onClick={() => setSexo('femea')}>
            <Venus size={14} /> Mães
          </button>
        </div>
      </div>

      <div className="gl-resumo">
        <span className="gl-resumo-texto">
          <strong>{pais.length}</strong> {sexo === 'macho'
            ? (pais.length === 1 ? 'pai cadastrado' : 'pais cadastrados')
            : (pais.length === 1 ? 'mãe cadastrada' : 'mães cadastradas')}
        </span>
        <div className="gl-view-toggle" data-tour="pais-visualizacao">
          <button className={visualizacao === 'lista' ? 'ativo' : ''} onClick={() => trocarVisualizacao('lista')} aria-label="Ver em lista">
            <List size={16} />
          </button>
          <button className={visualizacao === 'grade' ? 'ativo' : ''} onClick={() => trocarVisualizacao('grade')} aria-label="Ver em grade">
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {pais.length === 0 && (
        <EmptyState icon={PawPrint} title="Nenhum registro encontrado" description="Cadastre o primeiro pai ou mãe do gatil." />
      )}

      <div data-tour="pais-lista" className={visualizacao === 'grade' ? 'gl-grade' : 'gl-lista'}>
        {pais.map(visualizacao === 'grade' ? renderTile : renderCard)}
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
