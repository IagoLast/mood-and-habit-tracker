import { Temporal } from 'temporal-polyfill';

export interface DateTimeInfo {
  timestampMs: number;
  timezoneOffsetMinutes: number;
  timezoneId: string;
  dateString: string;
}

function getSystemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function getCurrentDateTimeInfo(): DateTimeInfo {
  try {
    const timeZone = getSystemTimeZone();
    const now = Temporal.Now.zonedDateTimeISO(timeZone);
    const dateString = now.toPlainDate().toString();
    
    return {
      timestampMs: now.epochMilliseconds,
      timezoneOffsetMinutes: Number(now.offsetNanoseconds) / (60 * 1_000_000_000),
      timezoneId: now.timeZoneId,
      dateString,
    };
  } catch (error) {
    const date = new Date();
    const timeZone = getSystemTimeZone();
    const offsetMinutes = -date.getTimezoneOffset();
    
    return {
      timestampMs: date.getTime(),
      timezoneOffsetMinutes: offsetMinutes,
      timezoneId: timeZone,
      dateString: date.toISOString().split('T')[0],
    };
  }
}

export function getDateTimeInfoForDate(date: Date): DateTimeInfo {
  try {
    const timeZone = getSystemTimeZone();
    const zonedDateTime = Temporal.ZonedDateTime.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
      timeZone,
    });
    
    const dateString = zonedDateTime.toPlainDate().toString();
    
    return {
      timestampMs: zonedDateTime.epochMilliseconds,
      timezoneOffsetMinutes: Number(zonedDateTime.offsetNanoseconds) / (60 * 1_000_000_000),
      timezoneId: zonedDateTime.timeZoneId,
      dateString,
    };
  } catch (error) {
    const timeZone = getSystemTimeZone();
    const offsetMinutes = -date.getTimezoneOffset();
    
    return {
      timestampMs: date.getTime(),
      timezoneOffsetMinutes: offsetMinutes,
      timezoneId: timeZone,
      dateString: date.toISOString().split('T')[0],
    };
  }
}
