import { Temporal } from 'temporal-polyfill';

export function getCurrentTimestampMs(): number {
  return Temporal.Now.instant().epochMilliseconds;
}

export function normalizePlainDate(date: string): string {
  const plainDate = Temporal.PlainDate.from(date);
  return plainDate.toString();
}

export function dateStringToPlainDate(dateString: string): string {
  const plainDate = Temporal.PlainDate.from(dateString);
  return plainDate.toString();
}
