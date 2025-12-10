import { pgTable, serial, varchar, integer, decimal, bigint, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { races } from './races';

/**
 * Results table - 경주 결과
 * Stores race finish results and dividends
 */
export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  raceId: varchar('race_id', { length: 50 }).references(() => races.id).notNull(),
  entryNo: integer('entry_no').notNull(),

  finishPosition: integer('finish_position').notNull(), // 착순 (1 = winner)
  time: decimal('time', { precision: 10, scale: 3 }), // finish time in seconds
  margin: varchar('margin', { length: 20 }), // margin ('목', '1/2마신' etc.)

  // Split times (horse racing specific)
  splitTimes: jsonb('split_times'), // {s1f: 13.2, g3f: 36.5, ...}

  // Dividends
  dividendWin: bigint('dividend_win', { mode: 'number' }), // win dividend
  dividendPlace: bigint('dividend_place', { mode: 'number' }), // place dividend

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRaceResult: unique().on(table.raceId, table.entryNo),
}));

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
