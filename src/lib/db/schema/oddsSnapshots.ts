import { pgTable, varchar, integer, decimal, bigint, timestamp, primaryKey } from 'drizzle-orm/pg-core';

/**
 * Odds Snapshots table - 배당률 시계열 데이터
 * TimescaleDB hypertable for time-series odds data
 *
 * Note: This table should be converted to a TimescaleDB hypertable after creation:
 * SELECT create_hypertable('odds_snapshots', 'time');
 */
export const oddsSnapshots = pgTable('odds_snapshots', {
  time: timestamp('time', { withTimezone: true }).notNull(),
  raceId: varchar('race_id', { length: 50 }).notNull(),
  entryNo: integer('entry_no').notNull(),

  oddsWin: decimal('odds_win', { precision: 8, scale: 2 }), // win odds
  oddsPlace: decimal('odds_place', { precision: 8, scale: 2 }), // place odds

  poolTotal: bigint('pool_total', { mode: 'number' }), // total betting pool
  poolWin: bigint('pool_win', { mode: 'number' }), // win pool for this entry
  poolPlace: bigint('pool_place', { mode: 'number' }), // place pool for this entry

  popularityRank: integer('popularity_rank'), // popularity rank (1 = most popular)
}, (table) => ({
  pk: primaryKey({ columns: [table.time, table.raceId, table.entryNo] }),
}));

export type OddsSnapshot = typeof oddsSnapshots.$inferSelect;
export type NewOddsSnapshot = typeof oddsSnapshots.$inferInsert;
