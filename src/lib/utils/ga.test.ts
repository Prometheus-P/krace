/**
 * @jest-environment jsdom
 */
// src/lib/utils/ga.test.ts

import { trackEvent, trackTabClick, trackRaceDetailView, GA_EVENTS } from './ga';

// Type for window with gtag
type WindowWithGtag = Window &
  typeof globalThis & {
    gtag?: jest.Mock;
  };

describe('GA Utils', () => {
  beforeEach(() => {
    // Clear window.gtag mock
    (window as WindowWithGtag).gtag = jest.fn();
  });

  afterEach(() => {
    delete (window as WindowWithGtag).gtag;
  });

  describe('trackEvent', () => {
    it('should call gtag with event name and parameters', () => {
      trackEvent('test_event', { category: 'test', value: 123 });

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {
        category: 'test',
        value: 123,
      });
    });

    it('should not throw when gtag is undefined', () => {
      delete (window as WindowWithGtag).gtag;

      expect(() => trackEvent('test_event', {})).not.toThrow();
    });
  });

  describe('trackTabClick', () => {
    it('should track tab_click event with race type', () => {
      trackTabClick('horse');

      expect(window.gtag).toHaveBeenCalledWith('event', GA_EVENTS.TAB_CLICK, {
        race_type: 'horse',
      });
    });

    it('should track cycle tab click', () => {
      trackTabClick('cycle');

      expect(window.gtag).toHaveBeenCalledWith('event', GA_EVENTS.TAB_CLICK, {
        race_type: 'cycle',
      });
    });

    it('should track boat tab click', () => {
      trackTabClick('boat');

      expect(window.gtag).toHaveBeenCalledWith('event', GA_EVENTS.TAB_CLICK, {
        race_type: 'boat',
      });
    });
  });

  describe('trackRaceDetailView', () => {
    it('should track race_detail_view event with race info', () => {
      trackRaceDetailView({
        raceId: 'horse-1-5-20251210',
        raceType: 'horse',
        track: '서울',
        raceNo: 5,
      });

      expect(window.gtag).toHaveBeenCalledWith('event', GA_EVENTS.RACE_DETAIL_VIEW, {
        race_id: 'horse-1-5-20251210',
        race_type: 'horse',
        track: '서울',
        race_no: 5,
      });
    });
  });

  describe('GA_EVENTS constants', () => {
    it('should have correct event names', () => {
      expect(GA_EVENTS.TAB_CLICK).toBe('tab_click');
      expect(GA_EVENTS.RACE_DETAIL_VIEW).toBe('race_detail_view');
    });
  });
});
