<script lang="ts">
    import { Dayjs } from 'dayjs';

    export let start;
    export let end;
    export let selectTime: (start: Dayjs, end: Dayjs) => void;

    function displayTime(time: Dayjs) {
        return time.format('h:mm A');
    }
</script>
<li on:click={() => selectTime(start, end)}>{displayTime(start)} - {displayTime(end)}</li>
