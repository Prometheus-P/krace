// src/lib/api-helpers/mappers.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  mapOddsResponse,
  mapKRAHorseRaceToRace,
  mapKSPOCycleRaceToRace,
  mapKSPOBoatRaceToRace,
  mapKSPOBoatRaceResults,
  mapKSPOBoatPayoffs,
  mapKSPOBoatRacerInfo,
  mapKSPOBoatPartMaster,
  mapKSPOBoatSupplier,
  mapKSPOBoatEquipmentReports,
  mapKSPOBoatRacerTilts,
  mapKSPOBoatRacerConditions,
  mapKSPOCycleRaceResults,
  mapKSPOCycleRaceRankings,
  mapKSPOCycleRacerInfo,
  mapKSPOCyclePayoffs,
  mapKRAHorseResultDetails,
  mapKRAHorseRaceInfo,
  mapKRAHorseEntryDetails,
  mapKRAHorseEntryRegistration,
  mapKRAHorseDividendSummary,
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

  describe('KSPO Boat additional mappers', () => {
    const rcDate = '20240101';

    it('maps boat race results to HistoricalRace', () => {
      const items = [
        {
          stnd_yr: '2024',
          race_no: '1',
          rank1: '3',
          rank2: '5',
          rank3: '7',
          pool1_val: '1200',
          pool2_val: '800',
          pool3_val: '5000',
          pool4_val: '400',
          pool5_val: '700',
          pool6_val: '900',
          week_tcnt: '1',
          day_tcnt: '1',
          row_num: '1',
        },
      ];

      const races = mapKSPOBoatRaceResults(items as any, rcDate);
      expect(races).toHaveLength(1);
      expect(races[0].id).toBe('boat-1-1-20240101');
      expect(races[0].results).toHaveLength(3);
      expect(races[0].dividends).toHaveLength(6);
      expect(races[0].dividends[0].amount).toBe(1200);
    });

    it('maps boat payoffs to dividends', () => {
      const items = [
        {
          stnd_yr: '2024',
          race_ymd: '20240101',
          race_no: '1',
          pool1_val: '1000',
          pool2_1_val: '500',
          pool2_2_val: '600',
          pool4_val: '2000',
          pool5_val: '3000',
          pool6_val: '4000',
          week_tcnt: '1',
          day_tcnt: '1',
          row_num: '1',
        },
      ];

      const dividends = mapKSPOBoatPayoffs(items as any);
      expect(dividends).toHaveLength(6);
      expect(dividends[0]).toMatchObject({ type: 'win', amount: 1000 });
      expect(dividends[1]).toMatchObject({ type: 'place', amount: 500 });
    });

    it('maps boat racer info to Racer', () => {
      const items = [
        {
          rank1_tcnt: '1',
          rank2_tcnt: '2',
          rank3_tcnt: '3',
          rank4_tcnt: '0',
          rank5_tcnt: '0',
          rank6_tcnt: '0',
          stnd_yr: '2024',
          racer_nm: '선수A',
          race_tcnt: '10',
          avg_rank: '2.3',
          avg_acdnt_scr: '0.1',
          avg_scr: '1.2',
          avg_strt_tm: '0.15',
          win_ratio: '20.5',
          high_rate: '40.0',
          high_3_rank_ratio: '60.0',
          row_num: '1',
          racer_perio_no: 'R123',
          racer_grd_cd: 'A',
        },
      ];

      const racers = mapKSPOBoatRacerInfo(items as any);
      expect(racers).toHaveLength(1);
      expect(racers[0]).toMatchObject({
        id: 'R123',
        name: '선수A',
        grade: 'A',
        totalStarts: 10,
        avgRank: 2.3,
        winRate: 20.5,
      });
    });

    it('maps boat part master', () => {
      const items = [
        {
          parts_item_cd_nm: '엔진',
          supp_spec_nm: '사양A',
          row_num: '1',
        },
      ];
      const mapped = mapKSPOBoatPartMaster(items as any);
      expect(mapped[0]).toEqual({ codeName: '엔진', spec: '사양A' });
    });

    it('maps boat supplier', () => {
      const items = [
        {
          supp_nm: '공급사',
          supp_spec_nm: '사양B',
          row_num: '1',
        },
      ];
      const mapped = mapKSPOBoatSupplier(items as any);
      expect(mapped[0]).toEqual({ name: '공급사', spec: '사양B' });
    });

    it('maps boat equipment reports', () => {
      const items = [
        {
          stnd_yr: '2024',
          repr_ymd: '20240101',
          equip_tpe_nm: '장비',
          mjr_parts_nm: '부품',
          repr_desc_cn: '설명',
          row_num: '1',
        },
      ];
      const mapped = mapKSPOBoatEquipmentReports(items as any);
      expect(mapped[0]).toMatchObject({ year: '2024', equipmentType: '장비', mainParts: '부품' });
    });

    it('maps boat racer tilts', () => {
      const items = [
        {
          race_no: '2',
          tilt_val: '0.5',
          jacket_add_wght: '+1',
          boat_add_wght_cn: '+2',
          body_wght: 55,
          day_tcnt: 1,
          week_tcnt: 1,
          stnd_yr: '2024',
          racer_no: 'R1',
          row_num: '1',
        },
      ];
      const mapped = mapKSPOBoatRacerTilts(items as any);
      expect(mapped[0]).toMatchObject({ raceNo: 2, tilt: '0.5', racerNo: 'R1' });
    });

    it('maps boat racer conditions', () => {
      const items = [
        {
          stnd_yr: '2024',
          week_tcnt: 1,
          racer_no: 'R2',
          heal_stat_cn: '양호',
          trng_stat_cn: '훈련중',
          row_num: '1',
        },
      ];
      const mapped = mapKSPOBoatRacerConditions(items as any);
      expect(mapped[0]).toMatchObject({ year: '2024', racerNo: 'R2', health: '양호' });
    });
  });

  describe('KSPO Cycle race result mapper', () => {
    it('maps cycle race results to HistoricalRace with dividends', () => {
      const items = [
        {
          stnd_yr: '2024',
          race_ymd: '20240102',
          meet_nm: '광명',
          race_no: '5',
          rank1: '1',
          rank2: '4',
          rank3: '7',
          pool1_val: '1100',
          pool2_val: '900',
          pool4_val: '5000',
          pool5_val: '4200',
          pool6_val: '3100',
          pool7_val: '2500',
          pool8_val: '800',
          week_tcnt: 1,
          day_tcnt: 1,
          row_num: '1',
        },
      ];

      const races = mapKSPOCycleRaceResults(items as any, '20240102');
      expect(races).toHaveLength(1);
      expect(races[0].id).toBe('cycle-1-5-20240102');
      expect(races[0].results).toHaveLength(3);
      expect(races[0].dividends).toHaveLength(7);
      expect(races[0].dividends[0]).toMatchObject({ type: 'win', amount: 1100 });
    });
  });

  describe('KSPO Cycle race rank mapper', () => {
    it('maps cycle race rank items to HistoricalRace', () => {
      const items = [
        {
          row_num: '1',
          stnd_year: '2024',
          meet_nm: '광명',
          tms: '1',
          day_ord: '1',
          race_no: '3',
          race_day: '20240103',
          racer_no: '9',
          racer_nm: '사이클선수',
          race_rank: '1',
        },
      ];

      const races = mapKSPOCycleRaceRankings(items as any);
      expect(races).toHaveLength(1);
      expect(races[0].id).toBe('cycle-1-3-20240103');
      expect(races[0].results[0]).toMatchObject({ entryNo: 9, rank: 1 });
    });
  });

  describe('KSPO Cycle racer info mapper', () => {
    it('maps cycle racer info to Racer[]', () => {
      const items = [
        {
          racer_nm: '사이클선수',
          racer_grd_cd: 'S1',
          run_cnt: '12',
          run_day_tcnt: '3',
          rank1_tcnt: '2',
          win_rate: '16.7',
          rank2_tcnt: '1',
          high_rate: '25.0',
          rank3_tcnt: '1',
          high_3_rate: '33.3',
          rank4_tcnt: '0',
          stnd_yr: '2024',
          rank5_tcnt: '0',
          rank6_tcnt: '0',
          rank7_tcnt: '0',
          rank8_tcnt: '0',
          rank9_tcnt: '0',
          elim_tcnt: '0',
          down_po_cnt: '0',
          go_po_tcnt: '0',
          period_no: 'P-99',
          row_num: '1',
        },
      ];

      const racers = mapKSPOCycleRacerInfo(items as any);
      expect(racers).toHaveLength(1);
      expect(racers[0]).toMatchObject({
        id: 'P-99',
        name: '사이클선수',
        grade: 'S1',
        winRate: 16.7,
      });
    });
  });

  describe('KSPO Cycle payoff mapper', () => {
    it('maps cycle payoffs to dividends', () => {
      const items = [
        {
          stnd_yr: '2024',
          race_ymd: '20240101',
          race_no: '1',
          pool1_val: '1000',
          pool2_1_val: '400',
          pool2_2_val: '500',
          pool4_val: '2000',
          pool5_val: '2500',
          pool6_val: '3000',
          week_tcnt: 1,
          day_tcnt: 1,
          row_num: '1',
        },
      ];

      const dividends = mapKSPOCyclePayoffs(items as any);
      expect(dividends).toHaveLength(6);
      expect(dividends[0]).toMatchObject({ type: 'win', amount: 1000 });
      expect(dividends[1]).toMatchObject({ type: 'place', amount: 400 });
    });
  });

  describe('KRA horse result detail mapper', () => {
    it('maps detailed results to HistoricalRaceResult[]', () => {
      const items = [
        {
          rsutRk: '1',
          pthrHrno: '7',
          pthrHrnm: '마필A',
          hrmJckyNm: '기수A',
          hrmTrarNm: '조교사A',
          rsutRaceRcd: '1:12.3',
          rsutMargin: '1.0',
        },
      ];

      const results = mapKRAHorseResultDetails(items as any);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        rank: 1,
        entryNo: 7,
        name: '마필A',
        jockey: '기수A',
        time: '1:12.3',
      });
    });
  });

  describe('KRA horse race info mapper', () => {
    it('maps monthly horse race info', () => {
      const items = [
        {
          meet: '서울',
          rank: '1등급',
          rcKrFlag: '1',
          rcKrFlagText: '국산마',
          rccnt: 12,
          yyyymm: '202401',
        },
      ];

      const info = mapKRAHorseRaceInfo(items as any);
      expect(info[0]).toMatchObject({
        track: '서울',
        grade: '1등급',
        originText: '국산마',
        raceCount: 12,
        yearMonth: '202401',
      });
    });
  });

  describe('KRA horse entry registration mapper', () => {
    it('maps entry registration to Race[] with entries', () => {
      const items = [
        {
          meet: '서울',
          pgDate: '20240120',
          pgNo: '4',
          rcName: '제4경주',
          rank: '국산5등급',
          rcDist: '1200',
          budam: '',
          prizeCond: '',
          ageCond: '',
          chaksun1: '1000',
          chaksun2: '500',
          chaksun3: '300',
          chaksun4: '200',
          chaksun5: '100',
          enNo: '3',
          recentRating: '70',
          hrName: '빠른말',
          hrNo: '123',
          name: '빠른말',
          sex: '수',
          age: '4',
          trName: '조교사A',
          trNo: 'T1',
          owName: '마주A',
          owNo: 'O1',
          prdName: '미국',
          rcCntY: '5',
          calPrize_6m: '0',
          calPrizeY: '0',
          chaksunT: '0',
          cndStrtPargTim: '14:30',
        },
      ];

      const races = mapKRAHorseEntryRegistration(items as any);
      expect(races).toHaveLength(1);
      expect(races[0].id).toBe('horse-서울-4-20240120');
      expect(races[0].entries?.[0]).toMatchObject({ no: 3, name: '빠른말', trainer: '조교사A' });
    });
  });

  describe('KRA horse dividend summary mapper', () => {
    it('maps dividend summary to simplified objects', () => {
      const items = [
        {
          meet: '서울',
          rcDate: '20240120',
          rcNo: '5',
          hrName: '스피드',
          chulNo: '7',
          ord: '2',
          jkName: '기수B',
          trName: '조교사B',
          wgHr: '500',
          wgBudam: '55',
          finalBit: '3.5',
          rcTime: '1:11.2',
        },
      ];

      const summaries = mapKRAHorseDividendSummary(items as any);
      expect(summaries[0]).toMatchObject({
        raceNo: 5,
        horseName: '스피드',
        entryNo: 7,
        finish: 2,
        odds: 3.5,
      });
    });
  });

  describe('KRA horse entry detail mapper', () => {
    it('maps entry detail to simplified records', () => {
      const items = [
        {
          meet: '서울',
          rcDate: '20240120',
          rcDay: '토',
          rcNo: '5',
          chulNo: '8',
          hrName: '디테일말',
          hrNo: '88',
          trName: '조교사C',
          owName: '마주C',
          jkName: '기수C',
          rating: '70',
          wgBudam: '55',
          prizeCond: '조건',
          rcDist: '1200',
          stTime: '14:10',
        },
      ];

      const results = mapKRAHorseEntryDetails(items as any);
      expect(results[0]).toMatchObject({
        raceNo: 5,
        entryNo: 8,
        horseName: '디테일말',
        jockey: '기수C',
        trainer: '조교사C',
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
