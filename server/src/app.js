const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/pais', require('./routes/pais'));
app.use('/api/ninhadas', require('./routes/ninhadas'));
app.use('/api/gatos', require('./routes/gatos'));
app.use('/api/medicamentos', require('./routes/medicamentos'));
app.use('/api/aplicacoes', require('./routes/aplicacoes'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
