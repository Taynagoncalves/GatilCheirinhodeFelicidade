import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

const LADO_FINAL = 1200;

// Recorta a área escolhida e gera um JPEG quadrado de até 1200px — também resolve
// fotos de Android grandes demais (limite de 10MB do Cloudinary) ou em HEIC.
function recortar(img, area, nomeOriginal) {
  return new Promise((resolve) => {
    const lado = Math.min(LADO_FINAL, Math.round(area.width));
    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    canvas.getContext('2d').drawImage(img, area.x, area.y, area.width, area.height, 0, 0, lado, lado);
    canvas.toBlob(
      (blob) => {
        const nome = (nomeOriginal || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
        resolve(blob ? new File([blob], nome, { type: 'image/jpeg' }) : null);
      },
      'image/jpeg',
      0.85
    );
  });
}

export default function ImageCropper({ file, onConfirm, onCancel }) {
  const [url, setUrl] = useState(null);
  const [img, setImg] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const imagem = new Image();
    imagem.onload = () => { setImg(imagem); setUrl(objectUrl); };
    // navegador não consegue abrir a imagem (ex.: HEIC no Chrome) — envia o original
    imagem.onerror = () => onConfirm(file);
    imagem.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const confirmar = async () => {
    if (!area || !img) return;
    setSalvando(true);
    const recortado = await recortar(img, area, file.name);
    onConfirm(recortado || file);
  };

  if (!url) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: '#111',
      display: 'flex', flexDirection: 'column',
    }}>
      <p style={{ color: '#fff', textAlign: 'center', fontWeight: 700, padding: '18px 16px 10px', margin: 0 }}>
        Ajuste a foto
      </p>
      <div style={{ position: 'relative', flex: 1 }}>
        <Cropper
          image={url}
          crop={crop}
          zoom={zoom}
          aspect={1}
          maxZoom={4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
        />
      </div>
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={salvando}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={confirmar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Usar foto'}
          </button>
        </div>
      </div>
    </div>
  );
}
