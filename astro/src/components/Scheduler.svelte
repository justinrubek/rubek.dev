<script lang="ts">
    import { onMount } from 'svelte'

    let schedule_availability;

    onMount(() => {
        console.log('Scheduler mounted')
        let start = new Date();
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
    })
</script>
