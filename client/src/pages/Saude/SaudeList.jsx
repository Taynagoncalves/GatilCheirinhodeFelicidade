import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Syringe, Settings2 } from 'lucide-react';
import Layout from '../../components/Layout';
import CalendarioDoses from '../../components/CalendarioDoses';
import { useTour } from '../../contexts/TourContext';

const TOUR = [
  {
    selector: '[data-tour="saude-registrar"]',
    titulo: 'Registrar Dose',
    texto: 'Toque aqui para registrar uma nova dose de vacina ou medicamento para qualquer gato ou pai do gatil.',
  },
  {
    selector: '[data-tour="saude-medicamentos"]',
    titulo: 'Medicamentos Cadastrados',
    texto: 'Acesse o catálogo de todos os medicamentos e vacinas. Você pode adicionar novos ou editar os existentes.',
  },
  {
    selector: '[data-tour="saude-calendario"]',
    titulo: 'Calendário de Doses',
    texto: 'Veja todas as doses de gatos e pais no calendário. Pontos coloridos marcam os dias — vermelho para atrasada, laranja para hoje e verde para agendada. Toque em qualquer dia para ver os detalhes.',
  },
];

export default function SaudeList() {
  const navigate = useNavigate();
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR, 'saude');
    return () => setSteps([]);
  }, []);

  return (
    <Layout title="Saúde" showBack>
      <button className="btn btn-primary" data-tour="saude-registrar" onClick={() => navigate('/saude/registrar')}>
        <Syringe size={18} /> Registrar Dose
      </button>
      <button className="btn btn-secondary" data-tour="saude-medicamentos" onClick={() => navigate('/saude/medicamentos')}>
        <Settings2 size={18} /> Medicamentos Cadastrados
      </button>

      <div data-tour="saude-calendario">
        <CalendarioDoses />
      </div>
    </Layout>
  );
}
