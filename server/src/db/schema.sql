-- Banco de dados: Cheirinho de Felicidade (Gatil)
-- Execute este script no PostgreSQL (Aiven) para criar a estrutura completa.

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('macho', 'femea')),
  raca VARCHAR(120),
  cor VARCHAR(120),
  data_nascimento DATE,
  foto_url VARCHAR(500),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ninhadas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  mae_id INTEGER REFERENCES pais(id) ON DELETE SET NULL,
  pai_id INTEGER REFERENCES pais(id) ON DELETE SET NULL,
  data_nascimento DATE,
  quantidade_filhotes INTEGER DEFAULT 0,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gatos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120),
  cor VARCHAR(120),
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('macho', 'femea')),
  data_nascimento DATE,
  ninhada_id INTEGER REFERENCES ninhadas(id) ON DELETE SET NULL,
  mae_id INTEGER REFERENCES pais(id) ON DELETE SET NULL,
  pai_id INTEGER REFERENCES pais(id) ON DELETE SET NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido', 'mantido')),
  foto_url VARCHAR(500),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicamentos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  categoria VARCHAR(20) NOT NULL DEFAULT 'outro' CHECK (categoria IN ('vermifugo', 'vacina', 'antibiotico', 'antipulgas', 'outro')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aplicacoes (
  id SERIAL PRIMARY KEY,
  gato_id INTEGER NOT NULL REFERENCES gatos(id) ON DELETE CASCADE,
  medicamento_id INTEGER NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
  tipo VARCHAR(15) NOT NULL DEFAULT 'medicamento' CHECK (tipo IN ('medicamento', 'vacina')),
  data_aplicada DATE NOT NULL,
  proxima_dose DATE,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gatos_status ON gatos(status);
CREATE INDEX idx_aplicacoes_proxima_dose ON aplicacoes(proxima_dose);
