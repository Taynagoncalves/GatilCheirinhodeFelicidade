import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PawPrint, Weight, X } from 'lucide-react';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';
import { formatarPeso } from '../../utils/peso';

export default function PaisPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pai, setPai] = useState(null);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [pesoValor, setPesoValor] = useState('');
  const [pesoUnidade, setPesoUnidade] = useState('kg');
  const toast = useToast();

  const carregar = () => api.get(`/pais/${id}`).then((res) => setPai(res.data));

  useEffect(() => { carregar(); }, [id]);

  const salvarPeso = async () => {
    if (!pesoValor) return;
    const pesoG = pesoUnidade === 'kg' ? parseFloat(pesoValor) * 1000 : parseFloat(pesoValor);
    await api.patch(`/pais/${id}/peso`, { peso: pesoG });
    setShowPesoModal(false);
    setPesoValor('');
    toast('Peso registrado!');
    carregar();
  };

  if (!pai) return null;

  return (
    <Layout title="Perfil do Pai / Mãe" showBack>
      <div className="card">
        {pai.foto_url ? (
          <img src={pai.foto_url} alt={pai.nome} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <PawPrint size={48} />
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <p className="card-title" style={{ fontSize: '1.2rem' }}>{pai.nome}</p>
          <p className="card-meta" style={{ marginTop: 6 }}>
            Sexo: {pai.sexo === 'macho' ? 'Macho' : 'Fêmea'}<br />
            Raça: {pai.raca || 'Não informado'}<br />
            Cor: {pai.cor || 'Não informado'}<br />
            Nascimento: {pai.data_nascimento ? pai.data_nascimento.split('-').reverse().join('/') : 'Não informado'}<br />
            Idade: {pai.data_nascimento ? calcularIdade(pai.data_nascimento) : 'Não informado'}<br />
            Peso: {formatarPeso(pai.peso) || 'Não informado'}
            {pai.observacoes && <><br />Obs: {pai.observacoes}</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/pais/${id}/editar`)}>
            Editar
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setPesoValor(''); setPesoUnidade('kg'); setShowPesoModal(true); }}>
            <Weight size={16} /> Registrar Peso
          </button>
        </div>
      </div>

      {showPesoModal && (
        <div className="modal-overlay" onClick={() => setShowPesoModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPesoModal(false)}><X size={20} /></button>
            <p className="modal-title">Registrar Peso</p>
            <p className="card-meta" style={{ marginBottom: 16 }}>
              Peso atual: <strong>{formatarPeso(pai.peso) || 'não informado'}</strong>
            </p>
            <div className="field">
              <label>Novo peso</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" step="0.1" min="0"
                  placeholder={pesoUnidade === 'g' ? 'Ex: 350' : 'Ex: 4.5'}
                  value={pesoValor}
                  onChange={(e) => setPesoValor(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <select value={pesoUnidade} onChange={(e) => setPesoUnidade(e.target.value)} style={{ width: 64 }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={salvarPeso} disabled={!pesoValor}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
