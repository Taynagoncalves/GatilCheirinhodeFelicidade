import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Syringe } from 'lucide-react';
import Layout from '../../components/Layout';
import PhotoUpload from '../../components/PhotoUpload';
import { useToast } from '../../components/Toast';
import api from '../../api/client';

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'mantido', label: 'Mantido no gatil' },
];

export default function GatoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [ninhadas, setNinhadas] = useState([]);
  const [maes, setMaes] = useState([]);
  const [paisList, setPaisList] = useState([]);
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    nome: '',
    cor: '',
    sexo: 'macho',
    data_nascimento: '',
    ninhada_id: '',
    mae_id: '',
    pai_id: '',
    status: 'disponivel',
    observacoes: '',
  });

  useEffect(() => {
    api.get('/ninhadas').then((res) => setNinhadas(res.data));
    api.get('/pais', { params: { sexo: 'femea' } }).then((res) => setMaes(res.data));
    api.get('/pais', { params: { sexo: 'macho' } }).then((res) => setPaisList(res.data));

    if (isEdit) {
      api.get(`/gatos/${id}`).then((res) => {
        setForm({
          nome: res.data.nome || '',
          cor: res.data.cor || '',
          sexo: res.data.sexo,
          data_nascimento: res.data.data_nascimento?.slice(0, 10) || '',
          ninhada_id: res.data.ninhada_id || '',
          mae_id: res.data.mae_id || '',
          pai_id: res.data.pai_id || '',
          status: res.data.status,
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
      await api.put(`/gatos/${id}`, data);
      toast('Gato atualizado com sucesso!');
    } else {
      await api.post('/gatos', data);
      toast('Gato cadastrado com sucesso!');
    }
    navigate('/gatos');
  };

  return (
    <Layout title={isEdit ? 'Editar Gato' : 'Cadastrar Filhote'} showBack>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PhotoUpload preview={preview} onChange={handlePhoto} />

        <div className="field-row">
          <div className="field">
            <label>Nome (opcional)</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="field">
            <label>Data de Nascimento</label>
            <input type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Ninhada</label>
            <select value={form.ninhada_id} onChange={(e) => setForm({ ...form, ninhada_id: e.target.value })}>
              <option value="">Selecionar ninhada</option>
              {ninhadas.map((n) => (
                <option key={n.id} value={n.id}>{n.nome}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cor</label>
            <input value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Mãe</label>
            <select value={form.mae_id} onChange={(e) => setForm({ ...form, mae_id: e.target.value })}>
              <option value="">Selecionar Mãe</option>
              {maes.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Pai</label>
            <select value={form.pai_id} onChange={(e) => setForm({ ...form, pai_id: e.target.value })}>
              <option value="">Selecionar Pai</option>
              {paisList.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
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
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Observação (opcional)</label>
          <textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </div>

        {isEdit && (
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/saude/registrar?gato_id=${id}`)}>
            <Syringe size={18} /> Registrar Medicamento
          </button>
        )}

        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </Layout>
  );
}
