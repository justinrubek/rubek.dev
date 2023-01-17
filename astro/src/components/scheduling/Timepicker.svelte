<script lang="ts">
    import { getContext, createEventDispatcher } from 'svelte'

    import { contextKey } from './store';
    import Timecard from './Timecard.svelte';

    const scheduleStore = getContext(contextKey);

    export let selected;
    export let availability = {};
    $: selectedTimeslots = timeslots(availability, selected);

    const dispatch = createEventDispatcher();

    function selectTime(start, end) {
        console.log('selectTime', start, end);
        dispatch('selectTime', { start, end });
    }

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

</script>
<style>
.text {
    @apply text-theme-primary dark:text-theme-dark-primary;
}
</style>
{#if selectedTimeslots.length > 0}
    <ul role="list">
        {#each selectedTimeslots as timeslot}
            <Timecard {selectTime} start={timeslot[0]} end={timeslot[1]} />
        {/each}
    </ul>
{:else}
    <p class="text">No timeslots available on this day</p>
{/if}
