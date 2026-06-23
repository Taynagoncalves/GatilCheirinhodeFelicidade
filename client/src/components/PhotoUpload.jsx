import { useRef } from 'react';
import { Camera } from 'lucide-react';

export default function PhotoUpload({ preview, onChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
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
