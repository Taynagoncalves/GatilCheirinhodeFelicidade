import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cat, Calendar, PawPrint, Pencil } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function NinhadaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ninhada, setNinhada] = useState(null);

  useEffect(() => {
    api.get(`/ninhadas/${id}`).then((res) => setNinhada(res.data));
  }, [id]);

  if (!ninhada) return null;

  return (
    <Layout title={ninhada.nome} showBack>
      <div className="card">
        <div className="card-row">
          {ninhada.mae_foto ? (
            <img src={ninhada.mae_foto} alt={ninhada.mae_nome} className="card-photo" />
          ) : (
            <span className="card-photo-placeholder"><Cat size={26} /></span>
          )}
          <div>
            <p className="card-title">{ninhada.nome}</p>
            <p className="card-meta">
              Mãe: {ninhada.mae_nome || 'Não informado'}<br />
              Pai: {ninhada.pai_nome || 'Não informado'}
            </p>
          </div>
        </div>
        <p className="card-meta" style={{ display: 'flex', gap: 14, marginTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} /> {ninhada.data_nascimento ? ninhada.data_nascimento.split('-').reverse().join('/') : '—'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PawPrint size={14} /> {ninhada.quantidade_filhotes} filhotes
          </span>
        </p>
        {ninhada.observacoes && <p className="card-meta" style={{ marginTop: 8 }}>{ninhada.observacoes}</p>}
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate(`/ninhadas/${id}/editar`)}>
          <Pencil size={15} /> Editar Ninhada
        </button>
      </div>

      <section>
        <h2 className="section-title">Filhotes</h2>
        {ninhada.filhotes.length === 0 && (
          <EmptyState icon={Cat} title="Nenhum filhote cadastrado" description="Cadastre os filhotes desta ninhada no módulo Gatos." />
        )}
        {ninhada.filhotes.length > 0 && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ninhada.filhotes.map((f) => (
              <li key={f.id} className="list-row" onClick={() => navigate(`/gatos/${f.id}`)} style={{ cursor: 'pointer' }}>
                {f.foto_url ? (
                  <img src={f.foto_url} alt={f.nome} className="card-photo" style={{ width: 48, height: 48 }} />
                ) : (
                  <span className="card-photo-placeholder" style={{ width: 48, height: 48 }}><Cat size={20} /></span>
                )}
                <p className="card-title" style={{ fontSize: '0.95rem' }}>{f.nome || 'Sem nome'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
