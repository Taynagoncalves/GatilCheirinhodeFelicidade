import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatarPeso } from '../../utils/peso';
import api from '../../api/client';

export default function GatoPesoPublico() {
  const { id } = useParams();
  const [gato, setGato] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    api.get(`/gatos/publico/${id}`)
      .then(r => setGato(r.data))
      .catch(() => setErro(true));
  }, [id]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1a0533 0%, #3b1260 45%, #0f1f3d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 20px 40px', fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {erro && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', margin: 'auto' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <p style={{ marginTop: 16, fontSize: '1rem' }}>Este gatinho não foi encontrado.</p>
        </div>
      )}

      {!gato && !erro && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 'auto' }}>Carregando...</div>
      )}

      {gato && (
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Cabeçalho com foto + nome */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: '16px 18px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            {gato.foto_url ? (
              <img
                src={gato.foto_url}
                alt={gato.nome}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2d1065, #5b21b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
              }}>
                🐱
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
                {gato.nome || 'Sem nome'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                Peso atual: <strong style={{ color: '#fff' }}>{formatarPeso(gato.peso) || '—'}</strong>
              </p>
            </div>
          </div>

          {/* Histórico de peso */}
          <div style={{
            marginTop: 20,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            padding: '18px 20px 20px',
          }}>
            <p style={{
              margin: '0 0 14px', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)', fontWeight: 700,
            }}>
              Histórico de peso completo
            </p>

            {(!gato.historico_peso || gato.historico_peso.length === 0) ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                Nenhum peso registrado ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {gato.historico_peso.map((h) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      {formatarPeso(h.peso)}
                      {h.origem === 'inicial' && (
                        <span style={{ marginLeft: 8, fontSize: '0.68rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
                          (peso inicial)
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                      {h.data_registro.split('-').reverse().join('/')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé da marca */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              apresentado por
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              🐾 Cheirinho de Felicidade
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
