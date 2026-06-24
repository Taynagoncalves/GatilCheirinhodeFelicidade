import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function RegistroForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gatos, setGatos] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  const toast = useToast();
  const [form, setForm] = useState({
    tipo: 'medicamento',
    gato_id: searchParams.get('gato_id') || '',
    medicamento_id: '',
    data_aplicada: '',
    proxima_dose: '',
    observacoes: '',
  });

  useEffect(() => {
    api.get('/gatos').then((res) => setGatos(res.data));
    api.get('/medicamentos').then((res) => setMedicamentos(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/aplicacoes', form);
    toast('Registro salvo com sucesso!');
    navigate('/saude');
  };

  return (
    <Layout title="Adicionar Registro" showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label>Tipo</label>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option value="medicamento">Medicamento</option>
            <option value="vacina">Vacina</option>
          </select>
        </div>

        <div className="field">
          <label>Gato</label>
          <select value={form.gato_id} onChange={(e) => setForm({ ...form, gato_id: e.target.value })} required>
            <option value="">Selecionar gato</option>
            {gatos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome || 'Sem nome'}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Medicamento Cadastrado</label>
          <select value={form.medicamento_id} onChange={(e) => setForm({ ...form, medicamento_id: e.target.value })} required>
            <option value="">Selecionar medicamento</option>
            {medicamentos.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Data Aplicada</label>
            <input type="date" value={form.data_aplicada} onChange={(e) => setForm({ ...form, data_aplicada: e.target.value })} required />
          </div>
          <div className="field">
            <label>Próxima Dose</label>
            <input type="date" value={form.proxima_dose} onChange={(e) => setForm({ ...form, proxima_dose: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Observações (opcional)</label>
          <textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary">Salvar</button>
      </form>
    </Layout>
  );
}
