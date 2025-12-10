// src/lib/utils/ui.test.ts
import { getRaceTypeEmoji } from './ui';

describe('ui utilities', () => {
  describe('getRaceTypeEmoji', () => {
    it('should return horse emoji for horse type', () => {
      expect(getRaceTypeEmoji('horse')).toBe('🐎');
    });

    it('should return cycle emoji for cycle type', () => {
      expect(getRaceTypeEmoji('cycle')).toBe('🚴');
    });

    it('should return boat emoji for boat type', () => {
      expect(getRaceTypeEmoji('boat')).toBe('🚤');
    });

    it('should handle all race types exhaustively', () => {
      const raceTypes = ['horse', 'cycle', 'boat'] as const;

      raceTypes.forEach((type) => {
        const emoji = getRaceTypeEmoji(type);
        expect(typeof emoji).toBe('string');
        expect(emoji.length).toBeGreaterThan(0);
      });
    });
  });
});
