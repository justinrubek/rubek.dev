<script lang="ts">
    import { getContext } from 'svelte'

    import { contextKey } from './store';
    import Timecard from './Timecard.svelte';

    const scheduleStore = getContext(contextKey);

    export let selected;
    export let selectedTimeslots;

    export let selectTime = (start, end) => {
        console.log('selectTime', start, end);
    }
</script>
{#if selectedTimeslots.length > 0}
    <ul>
        {#each selectedTimeslots as timeslot}
            <Timecard {selectTime} start={timeslot[0]} end={timeslot[1]} />
        {/each}
    </ul>
{:else}
    <p>No timeslots available on this day</p>
{/if}
