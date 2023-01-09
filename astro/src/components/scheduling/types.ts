import type { Dayjs } from 'dayjs'

// { year: { month: { day: [start_time, end_time] } } }
export type TimeRange = [Dayjs, Dayjs];
export type Day = Record<string, TimeRange[]>;
export type Month = Record<string, Day>;
export type Year = Record<string, Month>;

export type CalendarAvailability = Year;
