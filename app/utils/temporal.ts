import { Temporal } from 'temporal-polyfill';

export function parseZonedDateTimeString(dateZts: string): Temporal.ZonedDateTime {
  return Temporal.ZonedDateTime.from(dateZts);
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

export function getTodayZonedDateTimeString(timeZone?: string): string {
  const tz = timeZone || Temporal.Now.zonedDateTimeISO().timeZoneId;
  const today = Temporal.Now.zonedDateTimeISO(tz);
  return createZonedDateTimeString(today.year, today.month, today.day, tz);
}

export function getZonedDateTimeFromDate(date: Date, timeZone?: string): Temporal.ZonedDateTime {
  const tz = timeZone || Temporal.Now.zonedDateTimeISO().timeZoneId;
  return Temporal.ZonedDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
    timeZone: tz,
  });
}
