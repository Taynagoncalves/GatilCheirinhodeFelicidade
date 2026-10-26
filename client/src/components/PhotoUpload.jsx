import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import ImageCropper from './ImageCropper';

export default function PhotoUpload({ preview, onChange }) {
  const inputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setArquivo(file);
  };

  return (
    <>
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
      {arquivo && (
        <ImageCropper
          file={arquivo}
          onConfirm={(f) => { setArquivo(null); onChange(f); }}
          onCancel={() => setArquivo(null)}
        />
      )}
    </>
  );
}
