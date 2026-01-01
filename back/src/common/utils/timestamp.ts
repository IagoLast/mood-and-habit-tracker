import { Temporal } from 'temporal-polyfill';

export function getCurrentTimestampMs(): number {
  return Temporal.Now.instant().epochMilliseconds;
}

export function normalizeDateZtsToUTC(dateZts: string): string {
  const zonedDateTime = Temporal.ZonedDateTime.from(dateZts);
  const plainDate = zonedDateTime.toPlainDate();
  const utcDateTime = Temporal.ZonedDateTime.from({
    year: plainDate.year,
    month: plainDate.month,
    day: plainDate.day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    timeZone: 'UTC',
  });
  return utcDateTime.toString();
}

export function createZonedDateTimeString(
  year: number,
  month: number,
  day: number,
  timeZone?: string
): string {
  const tz = timeZone || 'UTC';
  const zonedDateTime = Temporal.ZonedDateTime.from({
    year,
    month,
    day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    timeZone: tz,
  });
  return zonedDateTime.toString();
}

export function parseZonedDateTimeString(dateZts: string): Temporal.ZonedDateTime {
  return Temporal.ZonedDateTime.from(dateZts);
}

export function dateStringToDateZts(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return createZonedDateTimeString(year, month, day, 'UTC');
}
