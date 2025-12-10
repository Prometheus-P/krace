/**
 * Failure Logger Utility
 *
 * Logs ingestion failures to the database for retry tracking.
 */

import { db } from '@/lib/db/client';
import { ingestionFailures } from '@/lib/db/schema';
import { eq, and, lt, desc, sql } from 'drizzle-orm';
import type { IngestionFailure, NewIngestionFailure } from '@/lib/db/schema';

export type FailureStatus = 'pending' | 'retrying' | 'resolved' | 'max_retries_exceeded';
export type JobType = 'schedule_poll' | 'entry_poll' | 'result_poll' | 'odds_poll';
export type EntityType = 'race' | 'entry' | 'result' | 'odds';

export interface LogFailureParams {
  jobType: JobType;
  entityType: EntityType;
  entityId: string;
  errorMessage: string;
  errorCode?: string;
  errorStack?: string;
  maxRetries?: number;
  metadata?: Record<string, unknown>;
}

export interface GetFailuresParams {
  status?: FailureStatus;
  jobType?: JobType;
  entityType?: EntityType;
  limit?: number;
}

/**
 * Log a new ingestion failure
 *
 * @param params - Failure details
 * @returns Created failure record
 */
export async function logFailure(params: LogFailureParams): Promise<IngestionFailure> {
  const {
    jobType,
    entityType,
    entityId,
    errorMessage,
    errorCode,
    errorStack,
    maxRetries = 5,
    metadata,
  } = params;

  const failure: NewIngestionFailure = {
    jobType,
    entityType,
    entityId,
    errorMessage,
    errorCode: errorCode ?? null,
    errorStack: errorStack ?? null,
    retryCount: 0,
    maxRetries,
    status: 'pending',
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    nextRetryAt: calculateNextRetryTime(0),
  };

  const result = await db.insert(ingestionFailures).values(failure).returning();

  console.log(`[FailureLogger] Logged failure: ${result[0].id} for ${entityType}/${entityId}`);

  return result[0];
}

/**
 * Get failures with optional filters
 *
 * @param params - Filter parameters
 * @returns Array of failure records
 */
export async function getFailures(params: GetFailuresParams = {}): Promise<IngestionFailure[]> {
  const { status, jobType, entityType, limit = 100 } = params;

  const conditions = [];

  if (status) {
    conditions.push(eq(ingestionFailures.status, status));
  }

  if (jobType) {
    conditions.push(eq(ingestionFailures.jobType, jobType));
  }

  if (entityType) {
    conditions.push(eq(ingestionFailures.entityType, entityType));
  }

  const query = db.select().from(ingestionFailures);

  if (conditions.length > 0) {
    return query
      .where(and(...conditions))
      .orderBy(desc(ingestionFailures.createdAt))
      .limit(limit);
  }

  return query.orderBy(desc(ingestionFailures.createdAt)).limit(limit);
}

/**
 * Get failures that are ready to be retried
 *
 * @param limit - Maximum number of failures to return
 * @returns Retryable failures
 */
export async function getRetryableFailures(limit: number = 50): Promise<IngestionFailure[]> {
  const now = new Date();

  return db
    .select()
    .from(ingestionFailures)
    .where(
      and(
        eq(ingestionFailures.status, 'pending'),
        lt(ingestionFailures.nextRetryAt, now),
        sql`${ingestionFailures.retryCount} < ${ingestionFailures.maxRetries}`
      )
    )
    .orderBy(ingestionFailures.nextRetryAt)
    .limit(limit);
}

/**
 * Update failure status
 *
 * @param failureId - Failure ID (number)
 * @param status - New status
 * @returns Updated failure or null
 */
export async function updateFailureStatus(
  failureId: number,
  status: FailureStatus
): Promise<IngestionFailure | null> {
  const result = await db
    .update(ingestionFailures)
    .set({
      status,
      updatedAt: new Date(),
      resolvedAt: status === 'resolved' ? new Date() : null,
    })
    .where(eq(ingestionFailures.id, failureId))
    .returning();

  return result[0] ?? null;
}

/**
 * Increment retry count and update next retry time
 *
 * @param failureId - Failure ID (number)
 * @returns Updated failure or null
 */
export async function incrementRetryCount(failureId: number): Promise<IngestionFailure | null> {
  // First get current retry count
  const current = await db
    .select()
    .from(ingestionFailures)
    .where(eq(ingestionFailures.id, failureId));

  if (!current[0]) return null;

  const newRetryCount = current[0].retryCount + 1;
  const newStatus: FailureStatus =
    newRetryCount >= current[0].maxRetries ? 'max_retries_exceeded' : 'pending';

  const result = await db
    .update(ingestionFailures)
    .set({
      retryCount: newRetryCount,
      status: newStatus,
      updatedAt: new Date(),
      nextRetryAt: calculateNextRetryTime(newRetryCount),
    })
    .where(eq(ingestionFailures.id, failureId))
    .returning();

  return result[0] ?? null;
}

/**
 * Get a single failure by ID
 *
 * @param failureId - Failure ID (number)
 * @returns Failure record or null
 */
export async function getFailureById(failureId: number): Promise<IngestionFailure | null> {
  const result = await db
    .select()
    .from(ingestionFailures)
    .where(eq(ingestionFailures.id, failureId));

  return result[0] ?? null;
}

/**
 * Calculate next retry time using exponential backoff
 *
 * @param retryCount - Current retry count
 * @returns Next retry time
 */
function calculateNextRetryTime(retryCount: number): Date {
  // Exponential backoff: 1min, 2min, 4min, 8min, 16min
  const baseDelayMs = 60 * 1000; // 1 minute
  const delayMs = baseDelayMs * Math.pow(2, retryCount);
  const maxDelayMs = 30 * 60 * 1000; // Max 30 minutes

  return new Date(Date.now() + Math.min(delayMs, maxDelayMs));
}

/**
 * Get failure statistics
 *
 * @returns Failure counts by status
 */
export async function getFailureStats(): Promise<Array<{ status: string; count: number }>> {
  return db
    .select({
      status: ingestionFailures.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ingestionFailures)
    .groupBy(ingestionFailures.status);
}
