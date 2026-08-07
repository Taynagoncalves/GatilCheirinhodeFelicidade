import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cat, Scale, Share2, Plus, X } from 'lucide-react';
import { formatarPeso } from '../../utils/peso';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function GatoPesoHistorico() {
  const { id } = useParams();
  const [gato, setGato] = useState(null);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [pesoValor, setPesoValor] = useState('');
  const [pesoUnidade, setPesoUnidade] = useState('g');
  const toast = useToast();

  const carregarGato = () => api.get(`/gatos/${id}`).then((res) => setGato(res.data));

  useEffect(() => { carregarGato(); }, [id]);

  const salvarPeso = async () => {
    if (!pesoValor) return;
    const pesoG = pesoUnidade === 'kg' ? parseFloat(pesoValor) * 1000 : parseFloat(pesoValor);
    await api.patch(`/gatos/${id}/peso`, { peso: pesoG });
    setShowPesoModal(false);
    setPesoValor('');
    toast('Peso registrado!');
    carregarGato();
  };

  const compartilhar = async () => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const serverOrigin = apiBase ? new URL(apiBase).origin : window.location.origin;
    const url = `${serverOrigin}/g/${id}/peso`;
    if (navigator.share) {
      try { await navigator.share({ title: `Histórico de peso de ${gato?.nome || 'gatinho'}`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copiado!');
    }
  };

  if (!gato) return null;

  return (
    <Layout title="Histórico de Peso" showBack>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {gato.foto_url ? (
          <img src={gato.foto_url} alt={gato.nome} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
            <Cat size={26} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p className="card-title" style={{ fontSize: '1.05rem' }}>{gato.nome || 'Sem nome'}</p>
          <p className="card-meta">Peso atual: {formatarPeso(gato.peso) || 'Não informado'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setPesoValor(''); setPesoUnidade('g'); setShowPesoModal(true); }}>
          <Plus size={18} /> Registrar Peso
        </button>
        <button
          onClick={compartilhar}
          title="Compartilhar"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0 18px', height: 44, borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-primary)',
            background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Share2 size={16} />
        </button>
      </div>

      <section style={{ marginTop: 16 }}>
        {(!gato.historico_peso || gato.historico_peso.length === 0) ? (
          <EmptyState icon={Scale} title="Nenhum peso registrado" description="Registre o peso para acompanhar o crescimento." />
        ) : (
          <div className="card">
            {gato.historico_peso.map((h) => (
              <div key={h.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="card-photo-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <Scale size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>
                    {formatarPeso(h.peso)}
                    {h.origem === 'inicial' && <span className="card-meta" style={{ marginLeft: 6 }}>(peso inicial)</span>}
                  </p>
                  <p className="card-meta">{h.data_registro.split('-').reverse().join('/')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showPesoModal && (
        <div className="modal-overlay" onClick={() => setShowPesoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPesoModal(false)}><X size={20} /></button>
            <p className="modal-title">Registrar Peso</p>
            <p className="card-meta" style={{ marginBottom: 12 }}>
              Peso atual: <strong>{formatarPeso(gato.peso) || 'não informado'}</strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label>Novo peso</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder={pesoUnidade === 'g' ? 'Ex: 350' : 'Ex: 3.5'}
                  value={pesoValor}
                  onChange={(e) => setPesoValor(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select value={pesoUnidade} onChange={(e) => setPesoUnidade(e.target.value)} style={{ width: 64 }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={salvarPeso} disabled={!pesoValor}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
