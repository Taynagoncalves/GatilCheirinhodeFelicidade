import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Syringe, Pill, ClipboardList, Settings2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function SaudeList() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('medicamento');
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    api.get('/aplicacoes', { params: { tipo } }).then((res) => setRegistros(res.data));
  }, [tipo]);

  return (
    <Layout title="Saúde" showBack>
      <button className="btn btn-primary" onClick={() => navigate('/saude/registrar')}>
        <Syringe size={18} /> Registrar Dose
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/saude/medicamentos')}>
        <Settings2 size={18} /> Medicamentos Cadastrados
      </button>

      <div className="tabs">
        <button className={`tab${tipo === 'medicamento' ? ' active' : ''}`} onClick={() => setTipo('medicamento')}>Medicamentos</button>
        <button className={`tab${tipo === 'vacina' ? ' active' : ''}`} onClick={() => setTipo('vacina')}>Vacinas</button>
      </div>

      {registros.length === 0 && (
        <EmptyState icon={ClipboardList} title="Nenhum registro encontrado" description="Registre uma dose para começar o histórico de saúde." />
      )}

      {registros.map((r) => (
        <div key={r.id} className="card">
          <div className="card-row">
            {r.gato_foto ? (
              <img src={r.gato_foto} alt={r.gato_nome} className="card-photo" />
            ) : (
              <span className="card-photo-placeholder">{r.tipo === 'vacina' ? <Syringe size={24} /> : <Pill size={24} />}</span>
            )}
            <div style={{ flex: 1 }}>
              <p className="card-title">{r.gato_nome || 'Sem nome'}</p>
              <p className="card-meta">
                {r.medicamento_nome}<br />
                Última aplicação: {r.data_aplicada.split('-').reverse().join('/')}<br />
                {r.proxima_dose && <>Próxima dose: {r.proxima_dose.split('-').reverse().join('/')}<br /></>}
                {r.observacoes && <>Obs: {r.observacoes}</>}
              </p>
            </div>
          </div>
        </div>
      ))}
    </Layout>
  );
}
