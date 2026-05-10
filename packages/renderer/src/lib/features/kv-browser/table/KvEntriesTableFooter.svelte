<script lang="ts">
  import type { Table as TableType } from "@tanstack/table-core";
  import KvEntriesNavigation from "$lib/features/kv-browser/entry-editor/KvEntriesNavigation.svelte";
  import DeleteMultipleEntries from "$lib/features/kv-browser/actions/DeleteMultipleEntries.svelte";
  import WatchMultipleEntries from "../actions/WatchMultipleEntries.svelte";

  const { table }: { table: TableType<SerializedKvEntry> } = $props();

  const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);
  const selectedRowsCount = $derived(selectedRows.length);
  const displayedRows = $derived(table.getFilteredRowModel().rows.length);
</script>

<div class="flex gap-2 p-2 bg-muted">
  <div class="flex gap-2 items-center text-foreground text-sm">
    {selectedRowsCount} of {" "}
    {displayedRows} row{selectedRowsCount > 1 ? "s" : ""} selected.
    {#if selectedRowsCount}
      <DeleteMultipleEntries {selectedRows} />
      <WatchMultipleEntries {selectedRows} />
    {/if}
  </div>
  <KvEntriesNavigation />
</div>
