<script lang="ts">
    import { onMount } from 'svelte'
    import { Datepicker, themes } from '@justinrubek/svelte-calendar'
    import dayjs from 'dayjs'

    const { dark: theme } = themes;
    theme.calendar.width = '500px';
    // theme.calendar.maxWidth = '20vw';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lastweek = new Date(today);
    lastweek.setDate(lastweek.getDate() - 7);

    const markedDates = [today, tomorrow, lastweek];
    let schedule_availability;

    function process_availability(availability) {
        const { start, end, matrix } = availability;
        // matrix - a list of booleans representing 30 minute blocks
        // start - a string representing the start time of the time range for matrix
        // end - a string representing the end time of the time range for matrix
        // granularity (not in this example) - a string representing the granularity of the matrix (in seconds). Assume it is 30 minutes
        const granularity = 30 * 60;

        // The data needs to mapped to a calendar
        // To do this we should iterate over days in the local timezone
        // and produce an object indexed by the date that corresponds to the time
        // range for that day 
        // ultimately, we want something like this (assume this is psuedo code) and variables should be stored as relevant JavaScript types
        /* 
        start = "2023-01-01T00:00:00Z"
        end = "2023-01-31T23:59:59Z"
        // Note that the month is indexed from 0, but the day is indexed from 1
        availableDates = { 
            "2023": {
                "0": [ 10, 11, 15, 16 ]
            },
        }
        availability = {
            "2023" {
                "0": {
                    "10": [ "2023-01-01T10:00:00Z", "2023-01-01T10:30:00Z" ],
                    "11": [ "2023-01-01T11:00:00Z", "2023-01-01T11:30:00Z" ],
                    "15": [ "2023-01-01T15:00:00Z", "2023-01-01T15:30:00Z" ],
                    "16": [ "2023-01-01T16:00:00Z", "2023-01-01T16:30:00Z" ],
                }
            }
        };

        */

    }

    onMount(() => {
        console.log('Scheduler mounted')
        let start = new Date();
        /*
        fetch('http://localhost:8000/availability', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: start.toISOString(),
                end: start.toISOString(),
            })
        })
        .then(response => response.json())
        .then(data => {
            schedule_availability = data;
        }).then(() => {
            console.log(schedule_availability);
        });
        */
    })
</script>
<Datepicker {markedDates} {theme}/>
