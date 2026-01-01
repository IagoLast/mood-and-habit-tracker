import { Temporal } from 'temporal-polyfill';

export function createPlainDateString(year: number, month: number, day: number): string {
  const plainDate = Temporal.PlainDate.from({ year, month, day });
  return plainDate.toString();
}

export function getTodayPlainDateString(): string {
  const today = Temporal.Now.plainDateISO();
  return today.toString();
}

export function parsePlainDateString(dateString: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(dateString);
}
