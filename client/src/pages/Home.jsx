import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, PawPrint, Plus, Syringe, CalendarClock, X, Users, Bell } from 'lucide-react';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { usePush } from '../hooks/usePush';
import api from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  usePush();

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  async function testarNotificacao() {
    try {
      await api.post('/push/test');
    } catch {
      alert('Erro ao enviar notificação de teste.');
    }
  }

  return (
    <Layout title="Cheirinho de Felicidade" subtitle="Organização e Controle dos Gatos" showNotification>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><Cat size={18} /></span>
          <span className="stat-value">{data?.total_gatos ?? '—'}</span>
          <span className="stat-label">Gatos cadastrados</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><PawPrint size={18} /></span>
          <span className="stat-value">{data?.total_ninhadas ?? '—'}</span>
          <span className="stat-label">Ninhadas</span>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Cadastrar Gato
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/ninhadas/nova')}>
          <PawPrint size={18} /> Nova Ninhada
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/saude/registrar')}>
          <Syringe size={18} /> Registrar Dose
        </button>
        <button className="btn btn-secondary" onClick={testarNotificacao}>
          <Bell size={18} /> Testar Notificação
        </button>
      </div>

      <section>
        <h2 className="section-title">Próximas doses</h2>
        {data && data.proximas_doses.length === 0 && (
          <EmptyState icon={CalendarClock} title="Nenhuma dose agendada" description="As próximas doses cadastradas aparecerão aqui." />
        )}
        {data?.proximas_doses.length > 0 && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.proximas_doses.map((d) => (
              <li key={d.id} className="list-row">
                {d.gato_foto ? (
                  <img src={d.gato_foto} alt={d.gato_nome} className="card-photo" style={{ width: 48, height: 48 }} />
                ) : (
                  <span className="card-photo-placeholder" style={{ width: 48, height: 48 }}><Cat size={20} /></span>
                )}
                <div>
                  <p className="card-title" style={{ fontSize: '0.95rem' }}>{d.gato_nome || 'Sem nome'}</p>
                  <p className="card-meta">{d.medicamento_nome} · próxima: {new Date(d.proxima_dose).toLocaleDateString('pt-BR')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
