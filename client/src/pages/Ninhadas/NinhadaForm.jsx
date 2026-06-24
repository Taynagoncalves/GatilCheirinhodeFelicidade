import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function NinhadaForm() {
  const navigate = useNavigate();
  const [maes, setMaes] = useState([]);
  const [paisList, setPaisList] = useState([]);
  const toast = useToast();
  const [form, setForm] = useState({
    nome: '',
    mae_id: '',
    pai_id: '',
    data_nascimento: '',
    quantidade_filhotes: 1,
    observacoes: '',
  });

  useEffect(() => {
    api.get('/pais', { params: { sexo: 'femea' } }).then((res) => setMaes(res.data));
    api.get('/pais', { params: { sexo: 'macho' } }).then((res) => setPaisList(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/ninhadas', form);
    toast('Ninhada cadastrada com sucesso!');
    navigate('/ninhadas');
  };

  return (
    <Layout title="Nova Ninhada" showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label>Nome da Ninhada</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>

        <div className="field">
          <label>Nome da Mãe</label>
          <select value={form.mae_id} onChange={(e) => setForm({ ...form, mae_id: e.target.value })}>
            <option value="">Selecionar Mãe</option>
            {maes.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Nome do Pai</label>
          <select value={form.pai_id} onChange={(e) => setForm({ ...form, pai_id: e.target.value })}>
            <option value="">Selecionar Pai</option>
            {paisList.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Data de Nascimento</label>
          <input type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
        </div>

        <div className="field">
          <label>Número de Filhotes</label>
          <div className="stepper">
            <button type="button" onClick={() => setForm((f) => ({ ...f, quantidade_filhotes: Math.max(0, f.quantidade_filhotes - 1) }))}>-</button>
            <span className="stepper-value">{form.quantidade_filhotes}</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, quantidade_filhotes: f.quantidade_filhotes + 1 }))}>+</button>
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
