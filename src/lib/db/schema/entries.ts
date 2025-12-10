import { pgTable, serial, varchar, integer, decimal, timestamp, unique } from 'drizzle-orm/pg-core';
import { races } from './races';

/**
 * Entries table - 출전 정보
 * Stores race entry information for horses/cyclists/boat racers
 */
export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  raceId: varchar('race_id', { length: 50 }).references(() => races.id).notNull(),
  entryNo: integer('entry_no').notNull(), // 마번/배번
  name: varchar('name', { length: 100 }).notNull(), // 마명/선수명
  entityType: varchar('entity_type', { length: 10 }).notNull(), // 'horse' | 'cyclist' | 'boat_racer'

  // Horse racing specific fields
  horseId: varchar('horse_id', { length: 20 }),
  jockeyId: varchar('jockey_id', { length: 20 }),
  jockeyName: varchar('jockey_name', { length: 50 }),
  trainerId: varchar('trainer_id', { length: 20 }),
  trainerName: varchar('trainer_name', { length: 50 }),
  ownerName: varchar('owner_name', { length: 50 }),
  birthYear: integer('birth_year'),
  sex: varchar('sex', { length: 10 }), // 수, 암, 거세
  weight: decimal('weight', { precision: 5, scale: 1 }), // horse weight
  burdenWeight: decimal('burden_weight', { precision: 5, scale: 1 }), // burden weight
  rating: integer('rating'), // horse rating

  // Cycle/Boat racing specific fields
  racerId: varchar('racer_id', { length: 20 }),
  racerGrade: varchar('racer_grade', { length: 10 }),
  gearRatio: decimal('gear_ratio', { precision: 3, scale: 2 }), // cycle gear ratio
  motorNo: integer('motor_no'), // boat motor number
  boatNo: integer('boat_no'), // boat number

  // Common fields
  recentRecord: varchar('recent_record', { length: 100 }),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'scratched'

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRaceEntry: unique().on(table.raceId, table.entryNo),
}));

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
