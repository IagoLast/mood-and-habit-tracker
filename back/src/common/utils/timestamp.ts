import { Temporal } from 'temporal-polyfill';

export function getCurrentTimestampMs(): number {
  return Temporal.Now.instant().epochMilliseconds;
}

export function createZonedDateTimeString(
  year: number,
  month: number,
  day: number,
  timeZone?: string
): string {
  const tz = timeZone || Temporal.Now.zonedDateTimeISO().timeZoneId;
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
  return createZonedDateTimeString(year, month, day);
}
