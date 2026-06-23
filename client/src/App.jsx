import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GatosList from './pages/Gatos/GatosList';
import GatoForm from './pages/Gatos/GatoForm';
import GatoPerfil from './pages/Gatos/GatoPerfil';
import PaisList from './pages/Pais/PaisList';
import PaisForm from './pages/Pais/PaisForm';
import NinhadasList from './pages/Ninhadas/NinhadasList';
import NinhadaForm from './pages/Ninhadas/NinhadaForm';
import NinhadaDetalhe from './pages/Ninhadas/NinhadaDetalhe';
import SaudeList from './pages/Saude/SaudeList';
import MedicamentosCatalogo from './pages/Saude/MedicamentosCatalogo';
import MedicamentoForm from './pages/Saude/MedicamentoForm';
import RegistroForm from './pages/Saude/RegistroForm';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/gatos" element={<GatosList />} />
      <Route path="/gatos/novo" element={<GatoForm />} />
      <Route path="/gatos/:id" element={<GatoPerfil />} />
      <Route path="/gatos/:id/editar" element={<GatoForm />} />

      <Route path="/pais" element={<PaisList />} />
      <Route path="/pais/novo" element={<PaisForm />} />
      <Route path="/pais/:id/editar" element={<PaisForm />} />

      <Route path="/ninhadas" element={<NinhadasList />} />
      <Route path="/ninhadas/nova" element={<NinhadaForm />} />
      <Route path="/ninhadas/:id" element={<NinhadaDetalhe />} />

      <Route path="/saude" element={<SaudeList />} />
      <Route path="/saude/registrar" element={<RegistroForm />} />
      <Route path="/saude/medicamentos" element={<MedicamentosCatalogo />} />
      <Route path="/saude/medicamentos/novo" element={<MedicamentoForm />} />
    </Routes>
  );
}
