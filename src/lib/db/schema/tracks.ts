import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tracks table - 경기장 정보
 * Stores information about race tracks for horse, cycle, and boat racing
 */
export const tracks = pgTable('tracks', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  raceType: varchar('race_type', { length: 10 }).notNull(), // 'horse' | 'cycle' | 'boat'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
