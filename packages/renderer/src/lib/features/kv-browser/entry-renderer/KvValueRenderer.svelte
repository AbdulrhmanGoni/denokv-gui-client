<script lang="ts">
  import { cn } from "$lib/shadcn-utils";
  import CodeRenderer from "$lib/features/kv-browser/entry-renderer/CodeRenderer.svelte";
  import dataTypesColors from "$lib/features/kv-browser/utils/dataTypesColors";
  import KvValueRegExpRenderer from "$lib/features/kv-browser/entry-renderer/KvValueRegExpRenderer.svelte";
  import KvValueDateRenderer from "$lib/features/kv-browser/entry-renderer/KvValueDateRenderer.svelte";

  const {
    value,
    format,
    className,
  }: { value: KvEntry["value"]; format?: boolean; className?: string } =
    $props();

  const dataTypeColor = dataTypesColors[value.type.toLowerCase()];
</script>

<div
  class={cn(
    "font-semibold overflow-auto flex-1 py-1",
    dataTypeColor,
    className,
  )}
>
  {#if value.type === "String"}
    "{value.data}"
  {:else if value.type === "Number"}
    {value.data}
  {:else if value.type === "BigInt"}
    <span class={dataTypesColors.number}>{value.data}</span>n
  {:else if value.type === "KvU64"}
    KvU64<span class="text-foreground">(</span><!--
    --><span
      class={dataTypesColors.number}
    >
      {value.data}<span class={dataTypesColors.bigint}>n</span>
    </span><!--
    --><span class="text-foreground">)</span>
  {:else if value.type === "Null"}
    null
  {:else if value.type === "Undefined"}
    undefined
  {:else if value.type === "Date"}
    <KvValueDateRenderer value={String(value.data)} />
  {:else if value.type === "RegExp"}
    <KvValueRegExpRenderer regExpValue={String(value.data)} />
  {:else}
    <CodeRenderer code={value.data.toString()} {format} />
  {/if}
</div>
