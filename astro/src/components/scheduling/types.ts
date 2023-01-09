import type { Dayjs } from 'dayjs'

// { year: { month: { day: [start_time, end_time] } } }
export type TimeRange = [Dayjs, Dayjs];
type Day = Record<string, TimeRange[]>;
type Month = Record<string, Day>;
type Year = Record<string, Month>;

export type CalendarAvailability = Year;
