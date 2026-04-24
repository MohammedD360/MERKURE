-- Script d'initialisation PostgreSQL
-- Exécuté une seule fois à la création du container

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Chiffrement credentials broker
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Recherche textuelle fuzzy (pour symboles)

-- Schéma applicatif dédié
CREATE SCHEMA IF NOT EXISTS tradeedge;

-- Commentaire sur la base
COMMENT ON DATABASE tradeedge_db IS 'TradeEdge Pro — Dashboard Intelligent de Gestion de Compte Trader';
