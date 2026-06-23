import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/client';

const categorias = [
  { value: 'vermifugo', label: 'Vermífugo' },
  { value: 'vacina', label: 'Vacina' },
  { value: 'antibiotico', label: 'Antibiótico' },
  { value: 'antipulgas', label: 'Antipulgas' },
  { value: 'outro', label: 'Outro' },
];

export default function MedicamentoForm() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('outro');

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/medicamentos', { nome, categoria });
    navigate('/saude/medicamentos');
  };

  return (
    <Layout title="Cadastrar Medicamento" showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>

        <div className="field">
          <label>Categoria</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </Layout>
  );
}
