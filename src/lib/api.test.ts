import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
  fetchRaceById,
  fetchHistoricalResults,
  fetchHistoricalResultById,
  fetchHorseRaceInfo,
  fetchHorseRaceResultDetail,
  fetchHorseEntryRegistration,
  fetchHorseDividendSummary,
  fetchHorseEntryDetail,
  fetchBoatPayoffs,
  fetchCyclePayoffs,
  fetchCycleRaceResults,
  fetchBoatRaceRankings,
  fetchCycleRaceRankings,
  fetchBoatRacerInfo,
  fetchCycleRacerInfo,
  fetchBoatOperationInfo,
  fetchCycleOperationInfo,
  fetchCycleExerciseStats,
  fetchCyclePartUnits,
  fetchCycleInspectStats,
  fetchCycleInOutStats,
} from '../lib/api';

describe('API Client', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules(); // Important to clear module cache for env variables
    process.env = { ...originalEnv }; // Make a copy of the original environment

    // Mock the global fetch function before each test
    global.fetch = jest.fn(
      (url: RequestInfo | URL) =>
        Promise.resolve({
          ok: true,
          json: () => {
            if (typeof url === 'string' && url.includes('API299')) {
              // KRA API299 (Horse Race Results)
              // Mock response for KRA API299 경주결과종합
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet: '서울',
                          rcDate: 20240115,
                          rcNo: 1,
                          chulNo: 1,
                          ord: 1,
                          hrName: '말1',
                          hrNo: '001',
                          jkName: '기수1',
                          jkNo: '101',
                          rcTime: 72.5,
                          age: 3,
                          rank: '국산5등급',
                          schStTime: '2024-01-15T11:30:00',
                        },
                        {
                          meet: '서울',
                          rcDate: 20240115,
                          rcNo: 1,
                          chulNo: 2,
                          ord: 2,
                          hrName: '말2',
                          hrNo: '002',
                          jkName: '기수2',
                          jkNo: '102',
                          rcTime: 73.1,
                          age: 4,
                          rank: '국산5등급',
                          schStTime: '2024-01-15T11:30:00',
                        },
                      ],
                    },
                    numOfRows: 100,
                    pageNo: 1,
                    totalCount: 2,
                  },
                },
              });
            } else if (typeof url === 'string' && url.includes('SRVC_OD_API_CRA_RACE_ORGAN')) {
              // KSPO Cycle (New approved API)
              // Mock response for KSPO cycle race schedules (new approved API format)
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet_nm: '광명',
                          stnd_yr: '2024',
                          week_tcnt: '1',
                          day_tcnt: '1',
                          race_no: '1',
                          back_no: '1',
                          racer_nm: '선수1',
                          racer_age: '25',
                          win_rate: '15.5',
                          gear_rate: '3.92',
                        },
                      ],
                    },
                    numOfRows: 50,
                    pageNo: 1,
                    totalCount: 1,
                  },
                },
              });
            } else if (typeof url === 'string' && url.includes('SRVC_OD_API_VWEB_MBR_RACE_INFO')) {
              // KSPO Boat (New approved API)
              // Mock response for KSPO boat race schedules (new approved API format)
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet_nm: '미사리',
                          stnd_yr: '2024',
                          week_tcnt: '1',
                          day_tcnt: '1',
                          race_no: '1',
                          back_no: '1',
                          racer_nm: '선수1',
                          racer_age: '28',
                          wght: '52',
                          motor_no: '15',
                          boat_no: '23',
                          tms_6_avg_rank_scr: '3.2',
                        },
                      ],
                    },
                    numOfRows: 50,
                    pageNo: 1,
                    totalCount: 1,
                  },
                },
              });
            }
            return Promise.resolve({});
          },
        }) as Promise<Response>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env after all tests
  });

  it('should fetch horse race schedules from KRA API when API key is set and include entry details', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY'; // Set a dummy API key for this test
    const schedules = await fetchHorseRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551015/API299/Race_Result_total'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'horse');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
    expect(schedules[0]).toHaveProperty('grade');
    expect(schedules[0]).toHaveProperty('status', 'finished');

    // Entries from API299 are grouped by race
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('jockey');
    expect(entry).toHaveProperty('age');
  });

  it('should return empty array when KRA_API_KEY is not set', async () => {
    delete process.env.KRA_API_KEY; // Ensure API key is not set

    const schedules = await fetchHorseRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch cycle race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_OD_API_CRA_RACE_ORGAN'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'cycle');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');

    // New assertions for entries
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('age');
    expect(entry).toHaveProperty('recentRecord');
  });

  it('should return empty array when KSPO_API_KEY is not set for cycle', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch boat race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_OD_API_VWEB_MBR_RACE_INFO'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'boat');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');

    // New assertions for entries
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('age');
    expect(entry).toHaveProperty('recentRecord');
  });

  it('should return empty array when KSPO_API_KEY is not set for boat', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch a specific race by its ID', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    // API299 returns meet as '서울' which maps to '1', raceNo 1, date 20240115
    const race = await fetchRaceById('horse-1-1-20240115');

    expect(race).not.toBeNull();
    expect(race?.id).toBe('horse-1-1-20240115');
    expect(race?.type).toBe('horse');
    expect(race?.track).toBe('서울');
    expect(race?.status).toBe('finished');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should return null if a race is not found by ID', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    const race = await fetchRaceById('invalid-id');

    expect(race).toBeNull();
  });
});

describe('Historical Results API - real endpoints (mocked)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY';
    fetchMock.mockReset();

    global.fetch = fetchMock as unknown as typeof fetch;

    fetchMock.mockImplementation((url: RequestInfo | URL) => {
      const href = typeof url === 'string' ? url : url.toString();

      if (href.includes('B551015/API299')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: {
                body: {
                  items: {
                    item: [
                      {
                        meet: '서울',
                        rcDate: 20240101,
                        rcNo: 1,
                        ord: 1,
                        chulNo: 7,
                        hrName: '청룡',
                        jkName: '김기수',
                        rcDist: 1200,
                        schStTime: '2024-01-01T11:00:00',
                      },
                      {
                        meet: '서울',
                        rcDate: 20240101,
                        rcNo: 1,
                        ord: 2,
                        chulNo: 3,
                        hrName: '백호',
                        jkName: '박기수',
                        rcDist: 1200,
                        schStTime: '2024-01-01T11:00:00',
                      },
                    ],
                  },
                },
              },
            }),
        }) as unknown as Response;
      }

      if (href.includes('SRVC_TODZ_CRA_RACE_RESULT')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: {
                body: {
                  items: {
                    item: [
                      {
                        meet: '1',
                        rcDate: '20240101',
                        rcNo: '2',
                        ord: 1,
                        hrNo: '5',
                        hrName: '박선수',
                        rcTime: '12:00',
                        rcDist: '1000',
                      },
                    ],
                  },
                },
              },
            }),
        }) as unknown as Response;
      }

      if (href.includes('SRVC_OD_API_MBR_RACE_RESULT')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: {
                body: {
                  items: {
                    item: [
                      {
                        meet: '1',
                        rcDate: '20240101',
                        rcNo: '3',
                        ord: 1,
                        hrNo: '4',
                        hrName: '최선수',
                        rcTime: '13:00',
                        rcDist: '1200',
                      },
                    ],
                  },
                },
              },
            }),
        }) as unknown as Response;
      }

      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      }) as unknown as Response;
    });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('should call real endpoints and map to historical races when API keys are set', async () => {
    const result = await fetchHistoricalResults({
      dateFrom: '20240101',
      dateTo: '20240101',
      types: ['horse', 'cycle', 'boat'],
      limit: 20,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551015/API299'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_TODZ_CRA_RACE_RESULT'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_OD_API_MBR_RACE_RESULT'),
      expect.anything()
    );

    const horseRace = result.items.find((r) => r.type === 'horse');
    const cycleRace = result.items.find((r) => r.type === 'cycle');
    const boatRace = result.items.find((r) => r.type === 'boat');

    expect(horseRace?.results[0].name).toBe('청룡');
    expect(cycleRace?.results[0].name).toBe('박선수');
    expect(boatRace?.results[0].name).toBe('최선수');

    const detail = await fetchHistoricalResultById('horse-1-1-20240101');
    expect(detail).not.toBeNull();
    expect(detail?.results[0].name).toBe('청룡');
    expect(detail?.dividends).toBeInstanceOf(Array);
  });
});

describe('Auxiliary external APIs', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY';
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    fetchMock.mockImplementation((url: RequestInfo | URL) => {
      const href = typeof url === 'string' ? url : url.toString();

      const makeResponse = (items: unknown[]) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              response: {
                body: {
                  items: {
                    item: items,
                  },
                },
              },
            }),
        }) as unknown as Response;

      if (href.includes('API187')) return makeResponse([{ rcNo: 1, hrName: '말1' }]);
      if (href.includes('API156')) return makeResponse([{ meet: '서울', rcNo: 2 }]);
      if (href.includes('API23_1')) return makeResponse([{ entry: '등록1' }]);
      if (href.includes('API301')) return makeResponse([{ payoff: 1234 }]);
      if (href.includes('API26_2')) return makeResponse([{ detail: 'entry detail' }]);

      if (href.includes('SRVC_OD_API_MBR_PAYOFF')) return makeResponse([{ boat: '배당' }]);
      if (href.includes('SRVC_OD_API_CRA_PAYOFF')) return makeResponse([{ cycle: '배당' }]);
      if (href.includes('SRVC_TODZ_CRA_RACE_RESULT')) {
        return makeResponse([
          {
            stnd_yr: '2024',
            race_ymd: '20240101',
            meet_nm: '광명',
            race_no: '1',
            rank1: '1',
            rank2: '2',
            rank3: '3',
            pool1_val: '100',
            pool2_val: '90',
            pool4_val: '80',
            pool5_val: '70',
            pool6_val: '60',
            pool7_val: '50',
            pool8_val: '40',
            week_tcnt: 1,
            day_tcnt: 1,
            row_num: '1',
          },
        ]);
      }
      if (href.includes('SRVC_MRA_RACE_RANK'))
        return makeResponse([
          {
            row_num: '1',
            stnd_year: '2024',
            tms: '1',
            day_ord: '1',
            race_no: '1',
            race_day: '20240101',
            racer_no: '5',
            racer_nm: '미사리선수',
            race_rank: '1',
            mbr_nm: '조교사',
          },
        ]);
      if (href.includes('SRVC_CRA_RACE_RANK')) return makeResponse([{ cycleRank: 1 }]);
      if (href.includes('SRVC_VWEB_MBR_RACER_INFO')) return makeResponse([{ boatRacer: '선수A' }]);
      if (href.includes('SRVC_CRA_RACER_INFO')) return makeResponse([{ cycleRacer: '선수B' }]);
      if (href.includes('SRVC_OD_API_MRA_SUPP_CD')) return makeResponse([{ code: 'ABC' }]);
      if (href.includes('SRVC_OD_API_CRA_CYCLE_EXER'))
        return makeResponse([
          {
            starting_nope: 1,
            eclnt_nope: 2,
            get_eclet_nope: 3,
            stnd_yr: '2024',
            week_tcnt: 1,
            day_tcnt: 1,
            race_ymd: '20240101',
            tak_nope: 4,
            rora_nope: 5,
            repr_nope: 6,
            row_num: '1',
          },
        ]);
      if (href.includes('SRVC_OD_API_CRA_CYCLE_PART'))
        return makeResponse([{ mstr_unit_nm: '프레임', salv_unit_nm: '휠', row_num: '1' }]);
      if (href.includes('SRVC_OD_API_CRA_INSPECT'))
        return makeResponse([
          {
            bf_strt1_tcnt: 1,
            bf_strt2_tcnt: 2,
            bf_strt3_tcnt: 3,
            bf_strt4_tcnt: 4,
            bf_strt5_tcnt: 5,
            now_str1_tcnt: 1,
            now_str2_tcnt: 2,
            now_str3_tcnt: 3,
            now_str4_tcnt: 4,
            now_str5_tcnt: 5,
            af_str1_tcnt: 1,
            af_str2_tcnt: 2,
            af_str3_tcnt: 3,
            af_str4_tcnt: 4,
            af_str5_tcnt: 5,
            max_race_ymd: '20240101',
            cfm_insp_cnt: 2,
            stnd_yr: '2024',
            week_tcnt: 1,
            dmag_cd: 'A',
            row_num: '1',
          },
        ]);
      if (href.includes('SRVC_OD_API_CRA_INOUT'))
        return makeResponse([
          {
            stnd_yr: '2024',
            week_tcnt: 1,
            day_tcnt: 1,
            cycle_keep_cnt: 10,
            cycle_out_cnt: 2,
            row_num: '1',
          },
        ]);

      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) }) as unknown as Response;
    });
  });

  it('calls KRA auxiliary endpoints', async () => {
    await fetchHorseRaceInfo('20240101');
    await fetchHorseRaceResultDetail('20240101');
    await fetchHorseEntryRegistration('20240101');
    await fetchHorseDividendSummary('20240101');
    await fetchHorseEntryDetail('20240101');

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('API187'), expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('API156'), expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('API23_1'), expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('API301'), expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('API26_2'), expect.anything());
  });

  it('calls KSPO auxiliary endpoints', async () => {
    await fetchBoatPayoffs('20240101');
    await fetchCyclePayoffs('20240101');
    await fetchCycleRaceResults('20240101');
    await fetchBoatRaceRankings('20240101');
    await fetchCycleRaceRankings('20240101');
    await fetchBoatRacerInfo('20240101');
    await fetchCycleRacerInfo('20240101');
    await fetchBoatOperationInfo('20240101');
    await fetchCycleOperationInfo('20240101');
    await fetchCycleExerciseStats('20240101');
    await fetchCyclePartUnits('20240101');
    await fetchCycleInspectStats('20240101');
    await fetchCycleInOutStats('20240101');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_MBR_PAYOFF'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_CRA_PAYOFF'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_TODZ_CRA_RACE_RESULT'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_MRA_RACE_RANK'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_CRA_RACE_RANK'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_VWEB_MBR_RACER_INFO'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_CRA_RACER_INFO'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_MRA_SUPP_CD'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_CRA_CYCLE_EXER'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_CRA_CYCLE_PART'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_CRA_INSPECT'),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('SRVC_OD_API_CRA_INOUT'),
      expect.anything()
    );
  });
});

// Historical Results API Tests
describe('Historical Results API', () => {
  it('should return empty results when API keys are not set', async () => {
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      page: 1,
      limit: 20,
    });

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total', 0);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 20);
    expect(result).toHaveProperty('totalPages', 0);
    expect(result.items).toEqual([]);
  });

  it('should return null for invalid historical result ID format', async () => {
    const result = await fetchHistoricalResultById('invalid-id');
    expect(result).toBeNull();
  });

  it('should return null when no matching race found by ID', async () => {
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;

    const result = await fetchHistoricalResultById('horse-1-1-20240101');
    expect(result).toBeNull();
  });
});
