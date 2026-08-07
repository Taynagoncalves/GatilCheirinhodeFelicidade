import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cat, Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

  const historico = gato?.historico_peso || [];

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0d1f35 0%, #1a3a5c 45%, #0d2a4a 100%)',
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
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Cabeçalho com foto + nome */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            borderRadius: 26,
            padding: '18px 20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            {gato.foto_url ? (
              <img
                src={gato.foto_url}
                alt={gato.nome}
                style={{
                  width: 68, height: 68, objectFit: 'cover', borderRadius: '50%', flexShrink: 0,
                  border: '3px solid rgba(96,165,250,0.55)',
                  boxShadow: '0 0 0 4px rgba(96,165,250,0.12)',
                }}
              />
            ) : (
              <div style={{
                width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #1a4d7c, #2f6690)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(96,165,250,0.55)',
              }}>
                <Cat size={30} color="#dbeafe" />
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#fff' }}>
                {gato.nome || 'Sem nome'}
              </p>
              <div style={{
                marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: 999, padding: '4px 12px 4px 8px',
              }}>
                <Scale size={13} color="#93c5fd" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dbeafe' }}>
                  {formatarPeso(gato.peso) || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Histórico de peso */}
          <div style={{
            marginTop: 18,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            borderRadius: 26,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
            padding: '20px 20px 22px',
          }}>
            <p style={{
              margin: '0 0 18px', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#7fb2e8', fontWeight: 800,
            }}>
              Histórico de peso completo
            </p>

            {historico.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                Nenhum peso registrado ainda.
              </p>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* linha vertical da timeline */}
                <div style={{
                  position: 'absolute', left: 5, top: 8, bottom: 8, width: 2,
                  background: 'linear-gradient(to bottom, rgba(96,165,250,0.5), rgba(96,165,250,0.05))',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {historico.map((h, i) => {
                    const anterior = historico[i + 1];
                    const delta = anterior ? parseFloat(h.peso) - parseFloat(anterior.peso) : null;
                    const atual = i === 0;
                    return (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                          background: atual ? '#60a5fa' : '#1a3a5c',
                          border: '2px solid ' + (atual ? '#bfdbfe' : 'rgba(147,197,253,0.4)'),
                          boxShadow: atual ? '0 0 0 5px rgba(96,165,250,0.18)' : 'none',
                          zIndex: 1,
                        }} />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                                {formatarPeso(h.peso)}
                              </span>
                              {atual && (
                                <span style={{
                                  fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
                                  color: '#0d1f35', background: '#93c5fd', borderRadius: 999, padding: '2px 8px',
                                }}>
                                  Atual
                                </span>
                              )}
                              {h.origem === 'inicial' && (
                                <span style={{
                                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                                  color: '#93c5fd', border: '1px solid rgba(147,197,253,0.4)', borderRadius: 999, padding: '2px 8px',
                                }}>
                                  Peso inicial
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                              {h.data_registro.split('-').reverse().join('/')}
                            </p>
                          </div>
                          {delta !== null && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                              fontSize: '0.78rem', fontWeight: 700,
                              color: delta > 0 ? '#86efac' : delta < 0 ? '#fca5a5' : 'rgba(255,255,255,0.45)',
                            }}>
                              {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                              {delta !== 0 ? formatarPeso(Math.abs(delta)) : '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé da marca */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              apresentado por
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              🐾 Cheirinho de Felicidade
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
