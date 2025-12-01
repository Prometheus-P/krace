// src/lib/api-helpers/mappers.test.ts
import {
  mapOddsResponse,
  mapKRAHorseRaceToRace,
  mapKSPOCycleRaceToRace,
  mapKSPOBoatRaceToRace,
} from './mappers';

describe('mapOddsResponse', () => {
  describe('valid odds values', () => {
    it('should map KSPO odds response to Odds type', () => {
      const kspoResponse = {
        oddsDansng: '2.5',
        oddsBoksng: '1.8',
        oddsSsangsng: '5.2',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: 2.5,
        place: 1.8,
        quinella: 5.2,
      });
    });
  });

  describe('null handling', () => {
    it('should handle null odds values', () => {
      const kspoResponse = {
        oddsDansng: null,
        oddsBoksng: '1.8',
        oddsSsangsng: null,
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 1.8,
        quinella: null,
      });
    });

    it('should handle undefined odds values', () => {
      const kspoResponse = {
        oddsBoksng: '3.5',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 3.5,
        quinella: null,
      });
    });

    it('should handle empty string odds values', () => {
      const kspoResponse = {
        oddsDansng: '',
        oddsBoksng: '',
        oddsSsangsng: '',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: null,
        quinella: null,
      });
    });
  });

  describe('invalid input', () => {
    it('should handle invalid number strings', () => {
      const kspoResponse = {
        oddsDansng: 'invalid',
        oddsBoksng: '2.0',
        oddsSsangsng: 'NaN',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 2.0,
        quinella: null,
      });
    });
  });
});

describe('API Response Mappers', () => {
  describe('mapKRAHorseRaceToRace', () => {
    const validHorseRaceItem = {
      meet: '1',
      rcNo: '3',
      rcDate: '20240115',
      rcTime: '14:30',
      rcDist: '1400',
      rank: '국산5등급',
      hrNo: '5',
      hrName: '썬더볼트',
      jkName: '김기수',
      trName: '박조교',
      age: '4',
      wgHr: '56',
      rcRst: '1-2-1',
    };

    it('should_map_basic_race_info_correctly', () => {
      const result = mapKRAHorseRaceToRace(validHorseRaceItem);

      expect(result.id).toBe('horse-1-3-20240115');
      expect(result.type).toBe('horse');
      expect(result.raceNo).toBe(3);
      expect(result.startTime).toBe('14:30');
      expect(result.distance).toBe(1400);
      expect(result.grade).toBe('국산5등급');
      expect(result.status).toBe('upcoming');
    });

    it('should_map_track_correctly_for_meet_1', () => {
      const item = { ...validHorseRaceItem, meet: '1' };
      expect(mapKRAHorseRaceToRace(item).track).toBe('서울');
    });

    it('should_map_track_correctly_for_meet_2', () => {
      const item = { ...validHorseRaceItem, meet: '2' };
      expect(mapKRAHorseRaceToRace(item).track).toBe('부산경남');
    });

    it('should_map_track_to_jeju_for_other_meets', () => {
      const item = { ...validHorseRaceItem, meet: '3' };
      expect(mapKRAHorseRaceToRace(item).track).toBe('제주');
    });

    it('should_map_entry_data_when_present', () => {
      const result = mapKRAHorseRaceToRace(validHorseRaceItem);

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toEqual({
        no: 5,
        name: '썬더볼트',
        jockey: '김기수',
        trainer: '박조교',
        age: 4,
        weight: 56,
        recentRecord: '1-2-1',
      });
    });

    it('should_return_empty_entries_when_hrNo_missing', () => {
      const itemWithoutEntry = {
        meet: '1',
        rcNo: '1',
        rcDate: '20240115',
        rcTime: '11:30',
        rcDist: '1200',
        rank: '국산3등급',
      };
      const result = mapKRAHorseRaceToRace(itemWithoutEntry);
      expect(result.entries).toHaveLength(0);
    });

    describe('Edge Cases', () => {
      it('should_handle_NaN_for_invalid_numbers', () => {
        const invalidItem = {
          ...validHorseRaceItem,
          rcNo: 'invalid',
          rcDist: 'notanumber',
        };
        const result = mapKRAHorseRaceToRace(invalidItem);
        expect(result.raceNo).toBeNaN();
        expect(result.distance).toBeNaN();
      });

      it('should_handle_undefined_optional_fields', () => {
        const minimalItem = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240101',
          rcTime: '10:00',
          rcDist: '1000',
        };
        const result = mapKRAHorseRaceToRace(minimalItem);
        expect(result.grade).toBeUndefined();
        expect(result.entries).toHaveLength(0);
      });
    });
  });

  describe('mapKSPOCycleRaceToRace', () => {
    const validCycleRaceItem = {
      meet: '1',
      rcNo: '2',
      rcDate: '20240115',
      rcTime: '11:00',
      rcDist: '1800',
      hrNo: '3',
      hrName: '이선수',
      age: '32',
      recentRecord: '2-1-3',
    };

    it('should_map_basic_race_info_correctly', () => {
      const result = mapKSPOCycleRaceToRace(validCycleRaceItem);

      expect(result.id).toBe('cycle-1-2-20240115');
      expect(result.type).toBe('cycle');
      expect(result.raceNo).toBe(2);
      expect(result.startTime).toBe('11:00');
      expect(result.distance).toBe(1800);
      expect(result.grade).toBeUndefined();
      expect(result.status).toBe('upcoming');
    });

    it('should_map_track_correctly_for_meet_1', () => {
      const item = { ...validCycleRaceItem, meet: '1' };
      expect(mapKSPOCycleRaceToRace(item).track).toBe('광명');
    });

    it('should_map_track_correctly_for_meet_2', () => {
      const item = { ...validCycleRaceItem, meet: '2' };
      expect(mapKSPOCycleRaceToRace(item).track).toBe('창원');
    });

    it('should_map_track_to_busan_for_other_meets', () => {
      const item = { ...validCycleRaceItem, meet: '3' };
      expect(mapKSPOCycleRaceToRace(item).track).toBe('부산');
    });

    it('should_map_entry_data_when_present', () => {
      const result = mapKSPOCycleRaceToRace(validCycleRaceItem);

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toEqual({
        no: 3,
        name: '이선수',
        age: 32,
        recentRecord: '2-1-3',
      });
    });

    it('should_return_empty_entries_when_hrNo_missing', () => {
      const itemWithoutEntry = {
        meet: '1',
        rcNo: '1',
        rcDate: '20240115',
        rcTime: '10:00',
        rcDist: '1000',
      };
      const result = mapKSPOCycleRaceToRace(itemWithoutEntry);
      expect(result.entries).toHaveLength(0);
    });
  });

  describe('mapKSPOBoatRaceToRace', () => {
    const validBoatRaceItem = {
      meet: '1',
      rcNo: '4',
      rcDate: '20240115',
      rcTime: '10:30',
      hrNo: '7',
      hrName: '박선수',
      age: '28',
      recentRecord: '1-1-2',
    };

    it('should_map_basic_race_info_correctly', () => {
      const result = mapKSPOBoatRaceToRace(validBoatRaceItem);

      expect(result.id).toBe('boat-1-4-20240115');
      expect(result.type).toBe('boat');
      expect(result.raceNo).toBe(4);
      expect(result.startTime).toBe('10:30');
      expect(result.distance).toBeUndefined();
      expect(result.grade).toBeUndefined();
      expect(result.status).toBe('upcoming');
    });

    it('should_always_map_track_to_misari', () => {
      const item1 = { ...validBoatRaceItem, meet: '1' };
      const item2 = { ...validBoatRaceItem, meet: '2' };
      const item3 = { ...validBoatRaceItem, meet: '99' };

      expect(mapKSPOBoatRaceToRace(item1).track).toBe('미사리');
      expect(mapKSPOBoatRaceToRace(item2).track).toBe('미사리');
      expect(mapKSPOBoatRaceToRace(item3).track).toBe('미사리');
    });

    it('should_map_entry_data_when_present', () => {
      const result = mapKSPOBoatRaceToRace(validBoatRaceItem);

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toEqual({
        no: 7,
        name: '박선수',
        age: 28,
        recentRecord: '1-1-2',
      });
    });

    it('should_return_empty_entries_when_hrNo_missing', () => {
      const itemWithoutEntry = {
        meet: '1',
        rcNo: '1',
        rcDate: '20240115',
        rcTime: '09:00',
      };
      const result = mapKSPOBoatRaceToRace(itemWithoutEntry);
      expect(result.entries).toHaveLength(0);
    });
  });

  describe('ID Format Consistency', () => {
    it('should_generate_consistent_id_format_for_horse', () => {
      const item = { meet: '1', rcNo: '5', rcDate: '20240220', rcTime: '12:00', rcDist: '1200' };
      expect(mapKRAHorseRaceToRace(item).id).toBe('horse-1-5-20240220');
    });

    it('should_generate_consistent_id_format_for_cycle', () => {
      const item = { meet: '2', rcNo: '7', rcDate: '20240220', rcTime: '13:00', rcDist: '1500' };
      expect(mapKSPOCycleRaceToRace(item).id).toBe('cycle-2-7-20240220');
    });

    it('should_generate_consistent_id_format_for_boat', () => {
      const item = { meet: '1', rcNo: '3', rcDate: '20240220', rcTime: '14:00' };
      expect(mapKSPOBoatRaceToRace(item).id).toBe('boat-1-3-20240220');
    });
  });

  describe('KSPO Edge Cases (TEST-004)', () => {
    describe('Cycle Race Edge Cases', () => {
      it('should_handle_missing_rcTime', () => {
        const item = { meet: '1', rcNo: '1', rcDate: '20240115' };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.startTime).toBe('');
      });

      it('should_handle_missing_rcDist', () => {
        const item = { meet: '1', rcNo: '1', rcDate: '20240115', rcTime: '10:00' };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.distance).toBeUndefined();
      });

      it('should_handle_missing_age_in_entry', () => {
        const item = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240115',
          rcTime: '10:00',
          hrNo: '1',
          hrName: '테스트선수',
        };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.entries[0].age).toBeUndefined();
      });

      it('should_handle_missing_recentRecord_in_entry', () => {
        const item = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240115',
          rcTime: '10:00',
          hrNo: '1',
          hrName: '테스트선수',
          age: '30',
        };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.entries[0].recentRecord).toBeUndefined();
      });

      it('should_parse_entry_number_correctly', () => {
        const item = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240115',
          rcTime: '10:00',
          hrNo: '12',
          hrName: '테스트선수',
        };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.entries[0].no).toBe(12);
      });
    });

    describe('Boat Race Edge Cases', () => {
      it('should_handle_missing_rcTime', () => {
        const item = { meet: '1', rcNo: '1', rcDate: '20240115' };
        const result = mapKSPOBoatRaceToRace(item);
        expect(result.startTime).toBe('');
      });

      it('should_always_have_undefined_distance', () => {
        const item = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240115',
          rcTime: '10:00',
          rcDist: '1000',
        };
        const result = mapKSPOBoatRaceToRace(item);
        expect(result.distance).toBeUndefined();
      });

      it('should_handle_missing_age_in_entry', () => {
        const item = {
          meet: '1',
          rcNo: '1',
          rcDate: '20240115',
          rcTime: '10:00',
          hrNo: '1',
          hrName: '테스트선수',
        };
        const result = mapKSPOBoatRaceToRace(item);
        expect(result.entries[0].age).toBeUndefined();
      });
    });

    describe('Fallback ID Generation', () => {
      beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should_generate_fallback_id_when_meet_missing', () => {
        const item = { rcNo: '1', rcDate: '20240115', rcTime: '10:00' };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.id).toMatch(/^cycle-unknown-\d+$/);
      });

      it('should_generate_fallback_id_when_rcNo_missing', () => {
        const item = { meet: '1', rcDate: '20240115', rcTime: '10:00' };
        const result = mapKSPOBoatRaceToRace(item);
        expect(result.id).toMatch(/^boat-unknown-\d+$/);
      });

      it('should_generate_fallback_id_when_rcDate_missing', () => {
        const item = { meet: '1', rcNo: '1', rcTime: '10:00' };
        const result = mapKSPOCycleRaceToRace(item);
        expect(result.id).toMatch(/^cycle-unknown-\d+$/);
      });

      it('should_log_warning_for_missing_required_fields', () => {
        const consoleSpy = jest.spyOn(console, 'warn');
        const item = { rcTime: '10:00' };
        mapKSPOCycleRaceToRace(item);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing required fields for race ID generation')
        );
      });
    });
  });
});
