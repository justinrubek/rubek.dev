<script lang="ts">
    import { onMount, setContext } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quintOut } from 'svelte/easing';
    import { DateInput } from '@rubekpkgs/date-picker-svelte'
    import { createForm } from 'svelte-forms-lib'
    import dayjs from 'dayjs'

    import Timepicker from "./Timepicker.svelte"
    import { api as scheduleApi } from './api';
    import {
        roundDate,
        getRoughAvailability,
        process_availability,
        getCalendarAvailability,
    } from './util';

    // marker to indicate that the user has successfully booked an appointment
    let booked = null;

    // The current selected calendar day 
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

    // Individual day time selection
    let selectedTimeslot = null;
    const selectTime = (event) => {
        const { start, end } = event.detail;
        selectedTimeslot = { start, end };
    }
    const cancelSelection = () => {
        selectedTimeslot = null;
    }

    const reserveTimeslot = async (slot, email, name, description) => {
        const { start, end } = slot;
        scheduleApi
            .url('/reserve')
            .post({
                start: start.toISOString(),
                end: end.toISOString(),
                name,
                email,
                description,
            });
        return slot;
    }

    const { form, errors, state, handleChange, handleSubmit } = createForm({
        initialValues: {
            email: "",
            subject: "",
            description: "",
        },

        validate: values => {
            const errors = {};

            if (!values.email) {
                errors.email = "Required";
            }

            if (!values.subject) {
                errors.subject = "Required";
            }

            if (!values.description) {
                errors.description = "Required";
            }

            return errors;
        },

        onSubmit: async values => {
            reserveTimeslot(selectedTimeslot, values.email, values.subject, values.description)
                .then(() => {
                    booked = selectedTimeslot;
                    cancelSelection();
                })
                .catch(console.error)
        }
    });


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

.text-error {
    color: red;
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

{#if booked}
    <div class="layout">
        <div class="text">
            <p>You've successfully booked a meeting on {dayjs(booked.start).format('MMMM D, YYYY')} from {dayjs(booked.start).format('h:mm A')} to {dayjs(booked.end).format('h:mm A')}</p>
        </div>
    </div>
{:else}
{#await getCalendarAvailability()}
    <p class="text">loading availability...</p>
{:then calendar_availability}
    <div
        class="flex flex-wrap px-5"
    >
        <div
            class="min-w-fit"
        >
            <DateInput 
                bind:value={selected}
                markedDates={getRoughAvailability(calendar_availability)}
                format="yyyy/MM/dd"
                placeholder="Select a date"
                closeOnSelection={true}
                on:select={cancelSelection}
            />
            <Timepicker {selected} availability={calendar_availability} on:selectTime={selectTime} />
        </div>
    {#if selectedTimeslot}
        <div 
            class="w-3/4 pt-5 md:pl-5 flex flex-wrap"
            transition:slide="{{ delay: 200, duration: 300, easing: quintOut }}"
        >
            <form on:submit={handleSubmit}>
                <p class="text">
                    Schedule a meeting from {selectedTimeslot.start.format('h:mm A')} to {selectedTimeslot.end.format('h:mm A')} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </p>

                <label class="text" for="email">email</label>
                <input 
                    bind:value={$form.email} on:change={handleChange}
                    class="w-full"
                    name="email" id="email" 
                />
                {#if $errors.email}
                    <p class="text-error">{$errors.email}</p>
                {/if}
                <label class="text" for="name">subject</label>
                <input 
                    bind:value={$form.subject} on:change={handleChange}
                    class="w-full"
                    name="subject" id="subject"
                />
                {#if $errors.subject}
                    <p class="text-error">{$errors.subject}</p>
                {/if}
                <label class="text" for="description">description</label>
                <textarea
                    bind:value={$form.description} on:change={handleChange}
                    class="w-full"
                    name="description"
                    id="description"
                />
                {#if $errors.description}
                    <p class="text-error">{$errors.description}</p>
                {/if}

                <div class="flex justify-between pt-2">
                    <button type="submit" name="reserve" class="reserveButton">Reserve</button>
                    <button type="button" name="cancel" class="cancelButton" on:click={cancelSelection}>Cancel</button>
                </div>
            </form>
        </div>
    {/if}
    </div>
{:catch error}
    <p class="text">{error.message}</p>
{/await}
{/if}
