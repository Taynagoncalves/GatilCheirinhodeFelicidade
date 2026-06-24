import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import PhotoUpload from '../../components/PhotoUpload';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

export default function PaisForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nome: '',
    data_nascimento: '',
    raca: '',
    cor: '',
    sexo: 'macho',
    observacoes: '',
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (isEdit) {
      api.get(`/pais/${id}`).then((res) => {
        setForm({
          nome: res.data.nome || '',
          data_nascimento: res.data.data_nascimento?.slice(0, 10) || '',
          raca: res.data.raca || '',
          cor: res.data.cor || '',
          sexo: res.data.sexo,
          observacoes: res.data.observacoes || '',
        });
        setPreview(res.data.foto_url);
      });
    }
  }, [id]);

  const handlePhoto = (file) => {
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (foto) data.append('foto', foto);

    if (isEdit) {
      await api.put(`/pais/${id}`, data);
      toast('Registro atualizado com sucesso!');
    } else {
      await api.post('/pais', data);
      toast('Pai/Mãe cadastrado com sucesso!');
    }
    navigate('/pais');
  };

  return (
    <Layout title="Cadastrar Pai ou Mãe" showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PhotoUpload preview={preview} onChange={handlePhoto} />

        <div className="field">
          <label>Nome</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>

        <div className="field">
          <label>Data de Nascimento (opcional)</label>
          <input type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Raça</label>
            <input value={form.raca} onChange={(e) => setForm({ ...form, raca: e.target.value })} />
          </div>
          <div className="field">
            <label>Cor</label>
            <input value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Selecione uma opção</label>
          <div className="sex-toggle">
            <span
              className={`sex-option femea${form.sexo === 'femea' ? ' selected' : ''}`}
              onClick={() => setForm({ ...form, sexo: 'femea' })}
            >
              Fêmea
            </span>
            <span
              className={`sex-option macho${form.sexo === 'macho' ? ' selected' : ''}`}
              onClick={() => setForm({ ...form, sexo: 'macho' })}
            >
              Macho
            </span>
          </div>
        </div>

        <div className="field">
          <label>Observações (opcional)</label>
          <textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </Layout>
  );
}
