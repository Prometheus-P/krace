// src/lib/utils/ga.ts
// Google Analytics 4 event tracking utilities

import { RaceType } from '@/types';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void;
  }
}

/**
 * GA4 Event names
 */
export const GA_EVENTS = {
  TAB_CLICK: 'tab_click',
  RACE_DETAIL_VIEW: 'race_detail_view',
} as const;

/**
 * Generic event tracking function
 */
export function trackEvent(eventName: string, parameters: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

/**
 * Track tab click event (경마/경륜/경정 탭)
 */
export function trackTabClick(raceType: RaceType): void {
  trackEvent(GA_EVENTS.TAB_CLICK, {
    race_type: raceType,
  });
}

/**
 * Track race detail page view
 */
export interface RaceDetailViewParams {
  raceId: string;
  raceType: RaceType;
  track: string;
  raceNo: number;
}

export function trackRaceDetailView(params: RaceDetailViewParams): void {
  trackEvent(GA_EVENTS.RACE_DETAIL_VIEW, {
    race_id: params.raceId,
    race_type: params.raceType,
    track: params.track,
    race_no: params.raceNo,
  });
}
