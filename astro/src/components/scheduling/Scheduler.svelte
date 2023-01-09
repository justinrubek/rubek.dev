<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { Datepicker, themes } from '@justinrubek/svelte-calendar'
    import dayjs from 'dayjs'

    import Timepicker from "./Timepicker.svelte"
    import { contextKey, dateContextKey, get as getStore } from './store';

    function timeslots(availability: CalendarAvailability, date: Date): Array<TimeRange> {
        if (date == null || availability == null) {
            return [];
        }
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // all open ranges of time in the day
        let ranges = availability?.[year]?.[month]?.[day];

        if (ranges == null) {
            return [];
        }

        // Divide each range into 30 minute slots
        const granularity = 30;
        let slots = [];
        for (let range of ranges) {
            let start = range[0];
            let end = range[1];
            while (start < end) {
                let newStart = start.add(granularity, 'minute');
                slots.push([start, newStart]);
                start = newStart;
            }
        }

        return slots;
    }

    let datestore;
    let selected;

    export let scheduleStore = getStore();
    setContext(scheduleStore.contextKey, scheduleStore);
    $: schedule_availability = $scheduleStore.availability;
    $: selectedTimeslots = timeslots(schedule_availability, selected);

    const { dark: theme } = themes;
    theme.calendar.width = '500px';
    // theme.calendar.maxWidth = '20vw';

    function process_availability(availability) {
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
            const start_time = dayjs(start, 'HH:mm').add(start_index * granularity, 'seconds');
            const end_time = dayjs(start, 'HH:mm').add(end_index * granularity, 'seconds');
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

    function markDates(calendar_availability) {
        return Object.keys(calendar_availability).map(year => {
            return Object.keys(calendar_availability[year]).map(month => {
                return Object.keys(calendar_availability[year][month]).map(day => {
                    return new Date(year, month, day);
                });
            });
        }).flat(2);
    }

    onMount(() => {
        // Determine the bounds of the month
        let start = dayjs().startOf('month');
        let end = dayjs().endOf('month');

        fetch('http://localhost:8000/availability', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: start.toISOString(),
                end: end.toISOString(),
            })
        })
        .then(response => response.json())
        .then(process_availability)
        .then(calendar => {
            datestore.setMarkedDates(markDates(calendar));
            scheduleStore.updateAvailability(calendar);
        })
    })
</script>
<Datepicker {theme} bind:selected bind:store={datestore} />
<Timepicker {selected} {selectedTimeslots} />
