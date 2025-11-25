<script lang="ts">
  import { cn } from "$lib/shadcn-utils";
  import CodeRenderer from "./CodeRenderer.svelte";
  import dataTypesColors from "./dataTypesColors";
  import KvValueRegExpRenderer from "./KvValueRegExpRenderer.svelte";

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
    className,
  )}
>
  {#if entry.value.type === "String"}
    "{entry.value.data}"
  {:else if entry.value.type === "Number"}
    {entry.value.data}
  {:else if entry.value.type === "BigInt"}
    <span class={dataTypesColors.number}>{entry.value.data}</span>n
  {:else if entry.value.type === "KvU64"}
    KvU64<span class="text-foreground">(</span><!--
    --><span
      class={dataTypesColors.number}
    >
      {entry.value.data}<span class={dataTypesColors.bigint}>n</span>
    </span><!--
    --><span class="text-foreground">)</span>
  {:else if entry.value.type === "Null"}
    null
  {:else if entry.value.type === "Undefined"}
    undefined
  {:else if entry.value.type === "Date"}
    {entry.value.data}
  {:else if entry.value.type === "RegExp"}
    <KvValueRegExpRenderer regExpValue={String(entry.value.data)} />
  {:else}
    <CodeRenderer code={entry.value.data.toString()} {format} />
  {/if}
</div>
