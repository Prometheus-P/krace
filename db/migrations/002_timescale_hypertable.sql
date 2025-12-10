-- Migration: 002_timescale_hypertable
-- Date: 2025-12-10
-- Description: Setup TimescaleDB for odds_snapshots
--
-- IMPORTANT: This migration requires TimescaleDB extension to be enabled
-- Run this on Supabase (PostgreSQL 15) or Timescale Cloud

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create odds_snapshots table
CREATE TABLE IF NOT EXISTS odds_snapshots (
    time TIMESTAMPTZ NOT NULL,
    race_id VARCHAR(50) NOT NULL,
    entry_no INTEGER NOT NULL,
    odds_win DECIMAL(8,2),
    odds_place DECIMAL(8,2),
    pool_total BIGINT,
    pool_win BIGINT,
    pool_place BIGINT,
    popularity_rank INTEGER,

    PRIMARY KEY (time, race_id, entry_no)
);

-- Convert to hypertable (TimescaleDB specific)
-- This partitions data by time for efficient time-series queries
SELECT create_hypertable('odds_snapshots', 'time', if_not_exists => TRUE);

-- Add compression policy (compress data older than 30 days)
-- This significantly reduces storage for historical data
SELECT add_compression_policy('odds_snapshots', INTERVAL '30 days', if_not_exists => TRUE);

-- Create continuous aggregate for 5-minute summaries
-- This pre-computes common aggregations for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS odds_5min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    race_id,
    entry_no,
    first(odds_win, time) AS odds_open,
    last(odds_win, time) AS odds_close,
    max(odds_win) AS odds_high,
    min(odds_win) AS odds_low,
    avg(odds_win)::decimal(8,2) AS odds_avg,
    last(popularity_rank, time) AS final_rank,
    count(*) AS snapshot_count
FROM odds_snapshots
GROUP BY bucket, race_id, entry_no;

-- Add refresh policy for continuous aggregate
-- Refreshes the materialized view every 5 minutes
SELECT add_continuous_aggregate_policy('odds_5min',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '5 minutes',
    if_not_exists => TRUE);

-- Create index for race-specific queries
CREATE INDEX IF NOT EXISTS idx_odds_snapshots_race_time
ON odds_snapshots(race_id, time DESC);
