import { Temporal } from 'temporal-polyfill';

export interface TimestampData {
  timestamp: number;
  offsetMinutes: number;
  timeZone: string;
}

export function getCurrentTimestampData(): TimestampData {
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    timestamp: now.epochMilliseconds,
    offsetMinutes: Number(now.offsetNanoseconds) / 60e9,
    timeZone: now.timeZoneId,
  };
}

export function formatTimestampData(data: TimestampData): string {
  return JSON.stringify(data);
}

export function parseTimestampData(json: string): TimestampData {
  return JSON.parse(json);
}
