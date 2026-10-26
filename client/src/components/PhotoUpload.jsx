import { useRef } from 'react';
import { Camera } from 'lucide-react';

const MAX_LADO = 1600;

// Redimensiona e converte para JPEG antes do upload — fotos de Android costumam
// passar de 10MB (limite do Cloudinary) ou vir em HEIC, que o servidor recusa.
function comprimirImagem(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const nome = (file.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], nome, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function PhotoUpload({ preview, onChange }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(await comprimirImagem(file));
  };

  return (
    <div className="photo-upload" onClick={() => inputRef.current?.click()}>
      {preview ? (
        <img src={preview} alt="Foto selecionada" />
      ) : (
        <>
          <Camera size={26} />
          <span>Adicionar foto</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
    </div>
  );
}
