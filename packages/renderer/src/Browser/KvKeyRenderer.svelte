<script lang="ts">
  import { cn } from "$lib/utils";
  import dataTypesColors from "./dataTypesColors";

  const { entry, className }: { entry: KvEntry; className?: string } = $props();
</script>

<div
  class={cn(
    "flex gap-1 items-center font-semibold overflow-auto py-1",
    className
  )}
>
  {"["}
  {#each entry.key as keyPart, i}
    <span class="flex items-center">
      {#if typeof keyPart === "object"}
        {#if keyPart?.type === "BigInt"}
          {@render bigint(keyPart.value)}
        {:else if keyPart?.type === "Uint8Array"}
          {@render uint8Array(keyPart.value)}
        {:else if keyPart?.type === "Number"}
          {@render number(keyPart.value)}
        {/if}
      {:else if typeof keyPart === "string"}
        {@render string(keyPart)}
      {:else if typeof keyPart === "number"}
        {@render number(keyPart)}
      {:else if typeof keyPart === "boolean"}
        {@render boolean(keyPart)}
      {/if}
      {#if i != entry.key.length - 1}
        <span class="me-0.5">,</span>
      {/if}
    </span>
  {/each}
  {"]"}
</div>

{#snippet string(value: string)}
  <span class={dataTypesColors.string}>{`"${value}"`}</span>
{/snippet}

{#snippet number(value: number | string)}
  <span class={dataTypesColors.number}>{value}</span>
{/snippet}

{#snippet boolean(value: boolean)}
  <span class={dataTypesColors.boolean}>{value}</span>
{/snippet}

{#snippet bigint(keyPartValue: string)}
  <span class={dataTypesColors.number}>{keyPartValue}</span>
  <span class={dataTypesColors.bigint}>n</span>
{/snippet}

{#snippet uint8Array(_keyPartValue: string)}
  <span class={dataTypesColors.uint8Array}>
    Uint8Array(<span class="text-foreground">[...]</span>)
  </span>
{/snippet}
