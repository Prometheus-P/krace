/**
 * Metrics Tracking Utility
 *
 * Provides in-memory metrics collection for ingestion operations.
 * Designed for simple tracking without external dependencies.
 */

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  lastValue: number;
  lastUpdated: Date;
}

// In-memory metrics storage
const metrics = new Map<string, MetricEntry[]>();
const MAX_ENTRIES_PER_METRIC = 1000;

/**
 * Record a metric value
 *
 * @param name - Metric name (e.g., 'ingestion.schedules.duration')
 * @param value - Numeric value
 * @param labels - Optional labels for filtering
 */
export function recordMetric(
  name: string,
  value: number,
  labels?: Record<string, string>
): void {
  const entry: MetricEntry = {
    name,
    value,
    timestamp: new Date(),
    labels,
  };

  const entries = metrics.get(name) ?? [];
  entries.push(entry);

  // Keep only recent entries
  if (entries.length > MAX_ENTRIES_PER_METRIC) {
    entries.splice(0, entries.length - MAX_ENTRIES_PER_METRIC);
  }

  metrics.set(name, entries);
}

/**
 * Record duration of an operation
 *
 * @param name - Metric name
 * @param startTime - Start time from Date.now()
 * @param labels - Optional labels
 */
export function recordDuration(
  name: string,
  startTime: number,
  labels?: Record<string, string>
): void {
  const duration = Date.now() - startTime;
  recordMetric(name, duration, labels);
}

/**
 * Increment a counter metric
 *
 * @param name - Metric name
 * @param increment - Amount to increment (default: 1)
 * @param labels - Optional labels
 */
export function incrementCounter(
  name: string,
  increment: number = 1,
  labels?: Record<string, string>
): void {
  recordMetric(name, increment, labels);
}

/**
 * Get summary statistics for a metric
 *
 * @param name - Metric name
 * @param since - Optional start time to filter entries
 * @returns Summary statistics or null if no data
 */
export function getMetricSummary(name: string, since?: Date): MetricSummary | null {
  const entries = metrics.get(name);
  if (!entries || entries.length === 0) {
    return null;
  }

  const filtered = since ? entries.filter((e) => e.timestamp >= since) : entries;

  if (filtered.length === 0) {
    return null;
  }

  const values = filtered.map((e) => e.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const lastEntry = filtered[filtered.length - 1];

  return {
    name,
    count: filtered.length,
    sum,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / filtered.length,
    lastValue: lastEntry.value,
    lastUpdated: lastEntry.timestamp,
  };
}

/**
 * Get all metric names
 *
 * @returns Array of metric names
 */
export function getMetricNames(): string[] {
  return Array.from(metrics.keys());
}

/**
 * Get all metrics with summaries
 *
 * @param since - Optional start time to filter entries
 * @returns Map of metric name to summary
 */
export function getAllMetrics(since?: Date): Map<string, MetricSummary> {
  const result = new Map<string, MetricSummary>();
  const metricNames = Array.from(metrics.keys());

  for (const name of metricNames) {
    const summary = getMetricSummary(name, since);
    if (summary) {
      result.set(name, summary);
    }
  }

  return result;
}

/**
 * Clear all metrics (for testing)
 */
export function clearMetrics(): void {
  metrics.clear();
}

/**
 * Get raw metric entries (for debugging)
 *
 * @param name - Metric name
 * @param limit - Maximum entries to return
 * @returns Array of metric entries
 */
export function getMetricEntries(name: string, limit: number = 100): MetricEntry[] {
  const entries = metrics.get(name) ?? [];
  return entries.slice(-limit);
}

// Predefined metric names for ingestion
export const INGESTION_METRICS = {
  SCHEDULE_POLL_DURATION: 'ingestion.schedules.duration',
  SCHEDULE_POLL_COUNT: 'ingestion.schedules.count',
  ENTRY_POLL_DURATION: 'ingestion.entries.duration',
  ENTRY_POLL_COUNT: 'ingestion.entries.count',
  RESULT_POLL_DURATION: 'ingestion.results.duration',
  RESULT_POLL_COUNT: 'ingestion.results.count',
  ODDS_POLL_DURATION: 'ingestion.odds.duration',
  ODDS_POLL_COUNT: 'ingestion.odds.count',
  ODDS_SNAPSHOT_COUNT: 'ingestion.odds.snapshots',
  API_REQUEST_DURATION: 'api.request.duration',
  API_ERROR_COUNT: 'api.errors.count',
  FAILURE_COUNT: 'ingestion.failures.count',
  RECOVERY_COUNT: 'ingestion.recovery.count',
} as const;

/**
 * Helper to wrap an async function with duration tracking
 *
 * @param name - Metric name for duration
 * @param fn - Async function to wrap
 * @param labels - Optional labels
 * @returns Wrapped function result
 */
export async function withMetrics<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();
  try {
    return await fn();
  } finally {
    recordDuration(name, startTime, labels);
  }
}
