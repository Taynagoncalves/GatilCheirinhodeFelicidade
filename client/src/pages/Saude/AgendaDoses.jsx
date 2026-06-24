import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Syringe, Pill, CalendarClock } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

function diffDias(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataStr + 'T00:00:00');
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}

function formatData(dataStr) {
  return dataStr.split('-').reverse().join('/');
}

function GatoCard({ item, onClick }) {
  return (
    <div
      className="card-row"
      style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
      onClick={onClick}
    >
      {item.gato_foto ? (
        <img src={item.gato_foto} alt={item.gato_nome} className="card-photo" />
      ) : (
        <span className="card-photo-placeholder"><Cat size={22} /></span>
      )}
      <div style={{ flex: 1 }}>
        <p className="card-title" style={{ fontSize: '0.95rem', margin: 0 }}>{item.gato_nome}</p>
        <p className="card-meta" style={{ margin: 0 }}>
          {item.medicamento_nome}
        </p>
      </div>
      <span style={{ flexShrink: 0 }}>
        {item.tipo === 'vacina' ? <Syringe size={16} color="var(--color-primary)" /> : <Pill size={16} color="var(--color-primary)" />}
      </span>
    </div>
  );
}

function Grupo({ titulo, cor, itens, onClickGato }) {
  if (!itens.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: cor, flexShrink: 0 }} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: cor }}>{titulo}</p>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {itens.length} {itens.length === 1 ? 'dose' : 'doses'}
        </span>
      </div>
      <div className="card" style={{ padding: '0 14px' }}>
        {itens.map((item, i) => (
          <GatoCard
            key={`${item.gato_id}-${item.medicamento_nome}-${i}`}
            item={item}
            onClick={() => onClickGato(item.gato_id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function AgendaDoses() {
  const navigate = useNavigate();
  const [doses, setDoses] = useState([]);

  useEffect(() => {
    api.get('/aplicacoes/agenda').then((res) => setDoses(res.data));
  }, []);

  const atrasadas = doses.filter((d) => diffDias(d.proxima_dose) < 0);
  const hoje = doses.filter((d) => diffDias(d.proxima_dose) === 0);
  const amanha = doses.filter((d) => diffDias(d.proxima_dose) === 1);
  const proximos = doses.filter((d) => diffDias(d.proxima_dose) > 1);

  const proxPorData = proximos.reduce((acc, d) => {
    const key = d.proxima_dose;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const vazio = doses.length === 0;

  return (
    <Layout title="Agenda de Doses" showBack>
      {vazio ? (
        <EmptyState
          icon={CalendarClock}
          title="Nenhuma dose agendada"
          description="Quando registrar doses com próxima data, elas aparecem aqui."
        />
      ) : (
        <>
          <Grupo
            titulo="Atrasadas"
            cor="#c0524a"
            itens={atrasadas}
            onClickGato={(id) => navigate(`/gatos/${id}`)}
          />
          <Grupo
            titulo="Hoje"
            cor="#b8863a"
            itens={hoje}
            onClickGato={(id) => navigate(`/gatos/${id}`)}
          />
          <Grupo
            titulo="Amanhã"
            cor="#2f6690"
            itens={amanha}
            onClickGato={(id) => navigate(`/gatos/${id}`)}
          />
          {Object.entries(proxPorData).map(([data, itens]) => (
            <Grupo
              key={data}
              titulo={formatData(data)}
              cor="#3f8c5a"
              itens={itens}
              onClickGato={(id) => navigate(`/gatos/${id}`)}
            />
          ))}
        </>
      )}
    </Layout>
  );
}
