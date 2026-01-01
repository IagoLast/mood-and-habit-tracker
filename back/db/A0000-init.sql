-- A0000-init.sql
-- Schema inicial de Good Choices

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at_timestamp_ms BIGINT,
  updated_at_timestamp_ms BIGINT
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at_timestamp_ms BIGINT,
  updated_at_timestamp_ms BIGINT
);

-- Tabla de elementos (hábitos dentro de categorías)
CREATE TABLE IF NOT EXISTS elements (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at_timestamp_ms BIGINT,
  updated_at_timestamp_ms BIGINT
);

-- Tabla de completados diarios
CREATE TABLE IF NOT EXISTS daily_completions (
  id SERIAL PRIMARY KEY,
  element_id INTEGER NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  date_zts VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at_timestamp_ms BIGINT,
  UNIQUE(element_id, date_zts)
);

-- Tabla de puntuaciones diarias (1-10)
CREATE TABLE IF NOT EXISTS daily_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_zts VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at_timestamp_ms BIGINT,
  updated_at_timestamp_ms BIGINT,
  UNIQUE(user_id, date_zts)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_elements_category_id ON elements(category_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_element_id ON daily_completions(element_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_date_zts ON daily_completions(date_zts);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON daily_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_date_zts ON daily_scores(date_zts);
