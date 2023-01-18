<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quintOut } from 'svelte/easing';
    import { DateInput } from '@justinrubek/date-picker-svelte'
    import dayjs from 'dayjs'

    import Timepicker from "./Timepicker.svelte"
    import { api as scheduleApi } from './api';
    import {
        roundDate,
        getRoughAvailability,
        process_availability,
        getCalendarAvailability,
    } from './util';

    let selected;

    // Fancy animation
    let deg = 0;
    onMount(() => {
        const interval = setInterval(() => {
            deg += 2;
            if (deg >= 360) deg = 0;
            document.body.style.setProperty('--deg', deg);
        }, 60);

        return () => {
            clearInterval(interval);
        };
    });

    let eventName = '';
    let email = '';
    let description = '';

    let selectedTimeslot = null;
    const selectTime = (event) => {
        const { start, end } = event.detail;
        selectedTimeslot = { start, end };
    }

    const cancelSelection = () => {
        selectedTimeslot = null;
    }

    const reserveTimeslot = (slot, email, name, description) => {
        const { start, end } = slot;
        scheduleApi
            .url('/reserve')
            .post({
                start: start.toISOString(),
                end: end.toISOString(),
                name,
                email,
                description,
            })
    }

</script>
<style>
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding-left: 10px;
}

.text {
    @apply text-theme-primary dark:text-theme-dark-primary;
}

.cancelButton {
    @apply text-theme-primary dark:text-theme-dark-primary;
    @apply bg-transparent;
    @apply border-0;
    @apply cursor-pointer;
    @apply outline-none;
    @apply text-2xl;
    @apply font-bold;
}

.reserveButton {
    @apply text-theme-primary dark:text-theme-dark-primary;
    @apply bg-transparent;
    @apply border-0;
    @apply cursor-pointer;
    @apply outline-none;
    @apply text-2xl;
    @apply font-bold;
}

.buttonContainer {
    display: flex;
    justify-content: space-between;
    padding: 10px;
}

:global(body) {
    --date-picker-marked-border: hsl(var(--deg), 98%, 49%);
    --date-picker-marked-background: hsl(var(--deg), 98%, 49%, 20%);
}
</style>

{#await getCalendarAvailability()}
    <p class="text">loading availability...</p>
{:then calendar_availability}
    <div class="flex px-5">
        <DateInput 
            bind:value={selected}
            markedDates={getRoughAvailability(calendar_availability)}
            format="yyyy/MM/dd"
            placeholder="Select a date"
            closeOnSelection={true}
            on:select={cancelSelection}
        />
        <div class="layout">
            <Timepicker {selected} availability={calendar_availability} on:selectTime={selectTime} />
        </div>
    {#if selectedTimeslot}
        <div class="layout" transition:slide="{{ delay: 200, duration: 300, easing: quintOut }}">
            <p class="text">Schedule a meeting from {selectedTimeslot.start.format('h:mm A')} to {selectedTimeslot.end.format('h:mm A')}</p>

            <label class="text" for="email">email</label>
            <input bind:value={email} class="w-full" name="email" id="email" />
            <label class="text" for="name">subject</label>
            <input bind:value={eventName} class="w-full" name="name" id="name" />
            <label class="text" for="description">description</label>
            <textarea bind:value={description} class="w-full" name="description" id="description" />

            <div class="buttonContainer">
                <button name="reserve" class="reserveButton" on:click={() => reserveTimeslot(selectedTimeslot, email, eventName, description)}>Reserve</button>
                <button name="cancel" class="cancelButton" on:click={cancelSelection}>Cancel</button>
            </div>
        </div>
    {/if}
    </div>
{:catch error}
    <p class="text">{error.message}</p>
{/await}
