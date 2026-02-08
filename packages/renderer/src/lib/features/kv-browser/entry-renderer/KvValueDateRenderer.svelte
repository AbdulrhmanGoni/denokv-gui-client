<script lang="ts">
    import DateIcon from "@lucide/svelte/icons/calendar-clock";
    import dataTypesColors from "$lib/features/kv-browser/utils/dataTypesColors";

    let { value, className = "" }: { value: string; className?: string } =
        $props();
</script>

<span class={`flex gap-1.5 items-center ${dataTypesColors.date} ` + className}>
    <DateIcon class="size-4" />
    {value || "No Value"}
</span>
