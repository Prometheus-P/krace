import { pgTable, serial, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * Ingestion Failures table - 수집 실패 로그
 * Tracks failed ingestion attempts for monitoring and retry
 */
export const ingestionFailures = pgTable('ingestion_failures', {
  id: serial('id').primaryKey(),
  jobType: varchar('job_type', { length: 30 }).notNull(), // 'schedule_poll' | 'entry_poll' | 'result_poll' | 'odds_poll'
  entityType: varchar('entity_type', { length: 20 }).notNull(), // 'race' | 'entry' | 'result' | 'odds'
  entityId: varchar('entity_id', { length: 100 }).notNull(), // e.g., 'horse-seoul-1-20241210'
  errorMessage: text('error_message').notNull(),
  errorCode: varchar('error_code', { length: 50 }),
  errorStack: text('error_stack'),
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(5).notNull(),
  status: varchar('status', { length: 30 }).default('pending').notNull(), // 'pending' | 'retrying' | 'resolved' | 'max_retries_exceeded'
  nextRetryAt: timestamp('next_retry_at'),
  resolvedAt: timestamp('resolved_at'),
  metadata: text('metadata'), // JSON string for additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type IngestionFailure = typeof ingestionFailures.$inferSelect;
export type NewIngestionFailure = typeof ingestionFailures.$inferInsert;
