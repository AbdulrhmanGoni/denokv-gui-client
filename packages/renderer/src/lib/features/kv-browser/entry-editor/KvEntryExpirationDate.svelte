<script lang="ts">
  import TimerOffIcon from "@lucide/svelte/icons/calendar-clock";
  import Input from "$lib/ui/shadcn/input/input.svelte";
  import * as Select from "$lib/ui/shadcn/select/index.js";

  let { value = $bindable() }: { value?: number } = $props();

  let inputValue: number = $state(NaN);
  let mesurementUnit = $state("milliseconds");
  let unit = $derived.by(() => {
    switch (mesurementUnit) {
      case "milliseconds":
        return "ms";
      case "seconds":
        return "s";
      case "minutes":
        return "m";
      case "hours":
        return "h";
      case "days":
        return "d";
      default:
        return "";
    }
  });

  $effect(() => {
    switch (mesurementUnit) {
      case "milliseconds":
        value = inputValue;
        break;
      case "seconds":
        value = inputValue * 1000;
        break;
      case "minutes":
        value = inputValue * 60000;
        break;
      case "hours":
        value = inputValue * (60000 * 60);
        break;
      case "days":
        value = inputValue * (60000 * 60 * 24);
        break;
    }
  });
</script>

<div class="flex gap-3 justify-between items-center">
  <p class="flex gap-2 items-center font-bold text-lg text-nowrap">
    <TimerOffIcon /> Expires after?
  </p>
  <div class="flex gap-2">
    <Select.Root type="single" bind:value={mesurementUnit}>
      <Select.Trigger class="w-fit">
        {mesurementUnit}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="milliseconds">milliseconds</Select.Item>
        <Select.Item value="seconds">seconds</Select.Item>
        <Select.Item value="minutes">minutes</Select.Item>
        <Select.Item value="hours">hours</Select.Item>
        <Select.Item value="days">days</Select.Item>
      </Select.Content>
    </Select.Root>
    <Input
      type="number"
      placeholder="0{unit}"
      class="w-36"
      bind:value={inputValue}
    />
  </div>
</div>
