<script lang="ts">
  import { FlexRender } from "$lib/ui/shadcn/data-table/index.js";
  import * as Table from "$lib/ui/shadcn/table/index.js";
  import type { Row } from "@tanstack/table-core";
  import { openKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import {
    isUpdatedRecently,
    isWatchedEntry,
  } from "$lib/states/watchedKvEntriesState.svelte";

  const { row }: { row: Row<SerializedKvEntry> } = $props();

  const updateType = $derived(isUpdatedRecently(row.original));
  const rowBg = $derived(
    updateType === "deleted"
      ? "bg-red-500/15"
      : updateType === "edited"
        ? "bg-muted"
        : "",
  );
</script>

<Table.Row
  data-state={row.getIsSelected() && "selected"}
  ondblclick={() => openKvEntryDialog(row.original)}
  class=" transition-colors ease-out duration-800 {rowBg}"
>
  {#each row.getVisibleCells() as cell (cell.id)}
    <Table.Cell class={cell.column.id === "key" ? "relative" : ""}>
      {#if cell.column.id === "key" && isWatchedEntry(row.original)}
        <EyeIcon class="size-3.5 absolute -left-0.5 top-[5px]" />
      {/if}
      <FlexRender
        content={cell.column.columnDef.cell}
        context={cell.getContext()}
      />
    </Table.Cell>
  {/each}
</Table.Row>
