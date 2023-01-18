import dayjs from 'dayjs'

import { api as scheduleApi } from './api';
import type { CalendarAvailability } from './types';

// round to the nearest minutes
export function roundDate(
    granularity,
    date,
) {
    const ms = 1000 * granularity;
    let dateMs = date.toDate().getTime();

    const newDate = new Date(Math.round(dateMs / ms) * ms);
    const newDay = dayjs(newDate);
    return newDay;
}

export function getRoughAvailability(availability: CalendarAvailability): Record<string, Record<string, Array<string>>> {
    return Object.entries(availability).reduce((acc, [year, months]) => {
        acc[year] = Object.entries(months).reduce((acc, [month, days]) => {
            acc[month] = Object.keys(days);
            return acc;
        }, {});
        return acc;
    }, {});
}

export function process_availability(availability) {
    const { start, end, matrix, granularity } = availability;

    // start - a string representing the start time of the time range for matrix
    // end - a string representing the end time of the time range for matrix
    // granularity (not in this example) - a string representing the granularity of the matrix (in seconds). Assume it is 30 minutes
    // matrix - a list of booleans representing blocks of time (in order) where true means available and false means unavailable

    // First, segment the matrix times into a list of index ranges
    // For example, if the matrix is [true, true, false, true, true, true, false, true, true]
    // Then the ranges would be [[0, 2], [3, 6], [7, 9]]
    const ranges = [];
    let start_index = null;
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i]) {
            if (start_index === null) {
                start_index = i;
            }
        } else {
            if (start_index !== null) {
                ranges.push([start_index, i]);
                start_index = null;
            }
        }
    }

    // Next, convert the ranges into a list of start and end times
    const times = [];
    for (let i = 0; i < ranges.length; i++) {
        const [start_index, end_index] = ranges[i];
        const start_time = dayjs(start, 'HH:mm').add((start_index-1) * granularity, 'seconds');
        let end_time = roundDate(30, dayjs(start, 'HH:mm').add((end_index-1) * granularity, 'seconds'));

        times.push([start_time, end_time]);
    }
    // pretty-print
    // const pretty_times = times.map(([start_time, end_time]) => `${start_time.format('h:mm A')} - ${end_time.format('h:mm A')}`);

    // Now, map this to the calendar
    // { year: { month: { day: [start_time, end_time] } } }
    const calendar = {};
    for (let i = 0; i < times.length; i++) {
        const [start_time, end_time] = times[i];
        const year = start_time.year();
        const month = start_time.month();
        const day = start_time.date();
        if (!calendar[year]) {
            calendar[year] = {};
        }
        if (!calendar[year][month]) {
            calendar[year][month] = {};
        }
        if (!calendar[year][month][day]) {
            calendar[year][month][day] = [];
        }
        calendar[year][month][day].push([start_time, end_time]);
    }

    return calendar;
}

export function getCalendarAvailability() {
    /* Get the availability to show for the calendar
       limits:
        - Nothing within the next 3 days
        - Nothing after 2 months

        These restrictions prevent the need to reload the availability data,
        but also prevent the user from booking too far in advance or a time that is too soon.
        This would need to be matched with the backend to prevent booking too far in advance,
        but the consequences of this are not that severe-- for now, if someone goes to the trouble of
        manually booking a time within the next 3 days, then maybe they are worthy of a meeting.
    */
    const now = dayjs();
    const start = now.add(3, 'day').startOf('day');
    let end = now.add(2, 'month').endOf('month');
    end = roundDate(1800, end);

    return scheduleApi
        .url('/availability')
        .post({
            start: start.toISOString(),
            end: end.toISOString(),
        })
        .json(process_availability);
}
