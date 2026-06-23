import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cat, Syringe, Pill } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function GatoPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gato, setGato] = useState(null);

  useEffect(() => {
    api.get(`/gatos/${id}`).then((res) => setGato(res.data));
  }, [id]);

  if (!gato) return null;

  const medicamentosAtivos = gato.historico.filter((h) => h.proxima_dose);

  return (
    <Layout title="Perfil do Gato" showBack>
      <div className="card">
        {gato.foto_url ? (
          <img src={gato.foto_url} alt={gato.nome} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Cat size={48} />
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <p className="card-title" style={{ fontSize: '1.2rem' }}>{gato.nome || 'Sem nome'}</p>
          <div style={{ margin: '6px 0' }}><StatusBadge status={gato.status} /></div>
          <p className="card-meta">
            Cor: {gato.cor || 'Não informado'}<br />
            Sexo: {gato.sexo === 'macho' ? 'Macho' : 'Fêmea'}<br />
            Nascimento: {gato.data_nascimento ? new Date(gato.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}<br />
            Mãe: {gato.mae_nome || 'Não informado'}<br />
            Pai: {gato.pai_nome || 'Não informado'}<br />
            Ninhada: {gato.ninhada_nome || 'Não informado'}
          </p>
        </div>
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate(`/gatos/${id}/editar`)}>
          Editar Gato
        </button>
      </div>

      <section>
        <h2 className="section-title">Histórico de Saúde</h2>
        {gato.historico.length === 0 ? (
          <EmptyState icon={Pill} title="Nenhum registro de saúde" description="Os registros de vacinas e medicamentos aparecerão aqui." />
        ) : (
          <div className="card">
            {gato.historico.map((h) => (
              <div key={h.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)' }}>
                <span className="card-photo-placeholder" style={{ width: 40, height: 40 }}>
                  {h.tipo === 'vacina' ? <Syringe size={18} /> : <Pill size={18} />}
                </span>
                <div>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>{h.medicamento_nome}</p>
                  <p className="card-meta">{new Date(h.data_aplicada).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Medicamentos Ativos</h2>
        {medicamentosAtivos.length === 0 ? (
          <EmptyState icon={Syringe} title="Nenhuma dose futura agendada" />
        ) : (
          <div className="card">
            {medicamentosAtivos.map((m) => (
              <div key={m.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)' }}>
                <div style={{ flex: 1 }}>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>{m.medicamento_nome}</p>
                  <p className="card-meta">Próxima dose: {new Date(m.proxima_dose).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {gato.ninhada_nome && (
        <section>
          <h2 className="section-title">Dados da Ninhada</h2>
          <div className="card">
            <p className="card-title" style={{ fontSize: '0.95rem' }}>{gato.ninhada_nome}</p>
            <div className="card-row" style={{ marginTop: 10 }}>
              {gato.mae_foto ? <img src={gato.mae_foto} className="card-photo" alt="Mãe" /> : <span className="card-photo-placeholder"><Cat size={22} /></span>}
              {gato.pai_foto ? <img src={gato.pai_foto} className="card-photo" alt="Pai" /> : <span className="card-photo-placeholder"><Cat size={22} /></span>}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
