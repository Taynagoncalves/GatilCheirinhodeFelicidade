import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Syringe, Pill, ClipboardList, Settings2, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';

const TOUR = [
  {
    selector: '[data-tour="saude-registrar"]',
    titulo: 'Registrar Dose',
    texto: 'Toque aqui para registrar uma nova dose de vacina ou medicamento para qualquer gato do gatil.',
  },
  {
    selector: '[data-tour="saude-medicamentos"]',
    titulo: 'Medicamentos Cadastrados',
    texto: 'Acesse o catálogo de todos os medicamentos e vacinas. Você pode adicionar novos ou editar os existentes.',
  },
  {
    selector: '[data-tour="saude-tabs"]',
    titulo: 'Filtro por Tipo',
    texto: 'Alterne entre "Medicamentos" e "Vacinas" para filtrar e visualizar apenas o que precisa.',
  },
  {
    selector: '[data-tour="saude-lista"]',
    titulo: 'Histórico de Doses',
    texto: 'Cada card mostra o gato, o medicamento, a data da última aplicação e a próxima dose agendada.',
  },
  {
    titulo: 'Excluir Registro',
    texto: 'O ícone de lixeira em cada card exclui aquele registro. Use com cuidado — a exclusão não pode ser desfeita.',
  },
];

export default function SaudeList() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('medicamento');
  const [registros, setRegistros] = useState([]);
  const [confirmando, setConfirmando] = useState(null);
  const toast = useToast();
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR);
    return () => setSteps([]);
  }, []);

  useEffect(() => {
    api.get('/aplicacoes', { params: { tipo } }).then((res) => setRegistros(res.data));
  }, [tipo]);

  const excluir = async (id) => {
    await api.delete(`/aplicacoes/${id}`);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
    setConfirmando(null);
    toast('Registro excluído!');
  };

  return (
    <Layout title="Saúde" showBack>
      <button className="btn btn-primary" data-tour="saude-registrar" onClick={() => navigate('/saude/registrar')}>
        <Syringe size={18} /> Registrar Dose
      </button>
      <button className="btn btn-secondary" data-tour="saude-medicamentos" onClick={() => navigate('/saude/medicamentos')}>
        <Settings2 size={18} /> Medicamentos Cadastrados
      </button>

      <div className="tabs" data-tour="saude-tabs">
        <button className={`tab${tipo === 'medicamento' ? ' active' : ''}`} onClick={() => setTipo('medicamento')}>Medicamentos</button>
        <button className={`tab${tipo === 'vacina' ? ' active' : ''}`} onClick={() => setTipo('vacina')}>Vacinas</button>
      </div>

      {registros.length === 0 && (
        <EmptyState icon={ClipboardList} title="Nenhum registro encontrado" description="Registre uma dose para começar o histórico de saúde." />
      )}

      <div data-tour="saude-lista">
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
            <button
              className="icon-btn"
              style={{ color: 'var(--color-danger)', alignSelf: 'center', flexShrink: 0 }}
              onClick={() => setConfirmando(r)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      </div>

      {confirmando && (
        <ConfirmModal
          message={`Excluir registro de ${confirmando.medicamento_nome} de ${confirmando.gato_nome}?`}
          onConfirm={() => excluir(confirmando.id)}
          onCancel={() => setConfirmando(null)}
        />
      )}
    </Layout>
  );
}
