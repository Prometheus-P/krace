-- Migration: 001_init_schema
-- Date: 2025-12-10
-- Description: Initialize core tables for Data Platform Phase 1

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    race_type VARCHAR(10) NOT NULL CHECK (race_type IN ('horse', 'cycle', 'boat')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- races table
CREATE TABLE IF NOT EXISTS races (
    id VARCHAR(50) PRIMARY KEY,
    race_type VARCHAR(10) NOT NULL,
    track_id INTEGER REFERENCES tracks(id),
    race_no INTEGER NOT NULL,
    race_date DATE NOT NULL,
    start_time TIME,
    distance INTEGER,
    grade VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled' NOT NULL,
    purse BIGINT,
    conditions JSONB,
    weather VARCHAR(20),
    track_condition VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_races_type_date ON races(race_type, race_date);
CREATE INDEX idx_races_status ON races(status);

-- entries table
CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    race_id VARCHAR(50) REFERENCES races(id) NOT NULL,
    entry_no INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(10) NOT NULL,

    -- Horse racing specific
    horse_id VARCHAR(20),
    jockey_id VARCHAR(20),
    jockey_name VARCHAR(50),
    trainer_id VARCHAR(20),
    trainer_name VARCHAR(50),
    owner_name VARCHAR(50),
    birth_year INTEGER,
    sex VARCHAR(10),
    weight DECIMAL(5,1),
    burden_weight DECIMAL(5,1),
    rating INTEGER,

    -- Cycle/Boat racing specific
    racer_id VARCHAR(20),
    racer_grade VARCHAR(10),
    gear_ratio DECIMAL(3,2),
    motor_no INTEGER,
    boat_no INTEGER,

    -- Common
    recent_record VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_entries_race ON entries(race_id);
CREATE INDEX idx_entries_jockey ON entries(jockey_id);
CREATE INDEX idx_entries_horse ON entries(horse_id);
CREATE INDEX idx_entries_racer ON entries(racer_id);

-- results table
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    race_id VARCHAR(50) REFERENCES races(id) NOT NULL,
    entry_no INTEGER NOT NULL,
    finish_position INTEGER NOT NULL,
    time DECIMAL(10,3),
    margin VARCHAR(20),
    split_times JSONB,
    dividend_win BIGINT,
    dividend_place BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_results_race ON results(race_id);
CREATE INDEX idx_results_position ON results(finish_position);

-- ingestion_failures table
CREATE TABLE IF NOT EXISTS ingestion_failures (
    id SERIAL PRIMARY KEY,
    source VARCHAR(20) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0 NOT NULL,
    max_retries INTEGER DEFAULT 5 NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ingestion_failures_resolved ON ingestion_failures(resolved);
CREATE INDEX idx_ingestion_failures_source ON ingestion_failures(source);
