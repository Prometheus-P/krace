import { pgTable, varchar, integer, date, time, timestamp, jsonb, bigint } from 'drizzle-orm/pg-core';
import { tracks } from './tracks';

/**
 * Races table - 경주 정보
 * Stores race schedule and metadata
 */
export const races = pgTable('races', {
  id: varchar('id', { length: 50 }).primaryKey(), // Format: 'horse-1-3-20241210'
  raceType: varchar('race_type', { length: 10 }).notNull(), // 'horse' | 'cycle' | 'boat'
  trackId: integer('track_id').references(() => tracks.id),
  raceNo: integer('race_no').notNull(),
  raceDate: date('race_date').notNull(),
  startTime: time('start_time'),
  distance: integer('distance'), // meters
  grade: varchar('grade', { length: 20 }),
  status: varchar('status', { length: 20 }).default('scheduled').notNull(),
  // Status values: 'scheduled' | 'upcoming' | 'live' | 'finished' | 'canceled' | 'postponed'
  purse: bigint('purse', { mode: 'number' }), // prize money in KRW
  conditions: jsonb('conditions'), // race conditions JSON
  weather: varchar('weather', { length: 20 }),
  trackCondition: varchar('track_condition', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Race = typeof races.$inferSelect;
export type NewRace = typeof races.$inferInsert;
