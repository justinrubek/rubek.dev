<script lang="ts">
    import { Dayjs } from 'dayjs';

    export let start;
    export let end;
    export let selectTime: (start: Dayjs, end: Dayjs) => void;

    function displayTime(time: Dayjs) {
        // 24 hour time
        // return time.format('H:mm');

        return time.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
</script>
<style>
    .timecard {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border: 2px solid #ccc;
        cursor: pointer;
    }
    .timecard:hover {
        background-color: #eee;
    }
    .timecard .time {
        font-size: 1.2rem;
        @apply text-theme-primary dark:text-theme-dark-primary;
    }
    .timecard .time .start {
        font-weight: bold;
    }
    .timecard .time .end {
        font-weight: normal;
    }
    .timecard .duration {
        font-size: 0.8rem;
        color: #666;
    }
</style>
<li class="timecard" on:click={() => selectTime(start, end)}>
    <div class="time">
        <span class="start">{displayTime(start)}</span>
        <span class="end"> - {displayTime(end)}</span>
    </div>
</li>
