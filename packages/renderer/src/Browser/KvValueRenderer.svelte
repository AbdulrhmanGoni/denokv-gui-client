<script lang="ts">
  import { cn } from "$lib/utils";
  import CodeRenderer from "./CodeRenderer.svelte";
  import dataTypesColors from "./dataTypesColors";

  const {
    entry,
    format,
    className,
  }: { entry: KvEntry; format?: boolean; className?: string } = $props();

  const dataTypeColor = dataTypesColors[entry.value.type.toLowerCase()];
</script>

<div
  class={cn(
    "font-semibold overflow-auto flex-1 py-1",
    dataTypeColor,
    className
  )}
>
  {#if entry.value.type === "String"}
    "{entry.value.data}"
  {:else if entry.value.type === "Number"}
    {entry.value.data}
  {:else if entry.value.type === "BigInt"}
    <span class={dataTypesColors.number}>{entry.value.data}</span>n
  {:else if entry.value.type === "Undefined"}
    undefined
  {:else if entry.value.type === "Null"}
    null
  {:else if entry.value.type === "Undefined"}
    undefined
  {:else if entry.value.type === "Date"}
    {entry.value.data}
  {:else if entry.value.type === "RegExp"}
    {entry.value.data}
  {:else}
    <CodeRenderer code={entry.value.data.toString()} {format} />
  {/if}
</div>
