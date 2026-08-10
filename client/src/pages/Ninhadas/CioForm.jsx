import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function CioForm() {
  const navigate = useNavigate();
  const [gatas, setGatas] = useState([]);
  const [machos, setMachos] = useState([]);
  const toast = useToast();
  const [form, setForm] = useState({
    gata_id: '',
    macho_id: '',
    data_registro: new Date().toISOString().slice(0, 10),
    observacoes: '',
  });

  useEffect(() => {
    api.get('/pais', { params: { sexo: 'femea' } }).then((res) => setGatas(res.data));
    api.get('/pais', { params: { sexo: 'macho' } }).then((res) => setMachos(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/cios', form);
    toast('Cio registrado com sucesso!');
    navigate('/ninhadas?tab=cios');
  };

  return (
    <Layout title="Registrar Cio" showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label>Gata</label>
          <select value={form.gata_id} onChange={(e) => setForm({ ...form, gata_id: e.target.value })} required>
            <option value="">Selecionar Gata</option>
            {gatas.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Macho (Reprodutor)</label>
          <select value={form.macho_id} onChange={(e) => setForm({ ...form, macho_id: e.target.value })}>
            <option value="">Selecionar Macho</option>
            {machos.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Data do Registro</label>
          <input type="date" value={form.data_registro} onChange={(e) => setForm({ ...form, data_registro: e.target.value })} required />
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
