<script lang="ts">
  import { FlexRender } from "$lib/components/shadcn/data-table/index.js";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import * as Table from "$lib/components/shadcn/table/index.js";
  import {
    kvEntriesState,
    fetchEntries,
  } from "$lib/states/kvEntriesState.svelte";
  import type { Table as TableType } from "@tanstack/table-core";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
  import Loader from "@lucide/svelte/icons/loader";
  import { openKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";
  import { columns } from "./columns";
  import KvEntriesNavigation from "./KvEntriesNavigation.svelte";
  import DeleteMultipleEntries from "./DeleteMultipleEntries.svelte";

  const { table }: { table: TableType<SerializedKvEntry> } = $props();

  const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);
  const selectedRowsCount = $derived(selectedRows.length);
  const displayedRows = $derived(table.getFilteredRowModel().rows.length);
</script>

<div class="rounded-md border">
  <div class="overflow-auto h-[450px]">
    <Table.Root>
      <Table.Header class="bg-muted">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if kvEntriesState.loading}
          <tr>
            <td colspan={columns.length} class="h-[398px] text-center">
              <Loader class="animate-spin mx-auto" />
            </td>
          </tr>
        {:else if kvEntriesState.error}
          <tr>
            <td
              colspan={columns.length}
              class="h-[398px] text-center space-y-1"
            >
              <p class="text-lg text-destructive font-semibold">
                Failed to fetch entries
              </p>
              <p>{kvEntriesState.error}</p>
              <Button size="icon" onclick={fetchEntries}>
                <RefreshIcon />
              </Button>
            </td>
          </tr>
        {:else if kvEntriesState.fetched}
          {#each table.getRowModel().rows as row (JSON.stringify(row.original.key))}
            <Table.Row
              data-state={row.getIsSelected() && "selected"}
              ondblclick={() => openKvEntryDialog(row.original)}
            >
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <tr>
              <td
                colspan={columns.length}
                class="h-[398px] text-lg text-center"
              >
                {#if kvEntriesState.params.cursors.length}
                  No More Entries in this Deno Kv Store.
                {:else}
                  No Entries in this Deno Kv Store.
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
  <Separator />
  <div class="flex gap-2 p-2 bg-muted">
    <div class="flex gap-2 items-center text-foreground text-sm">
      {selectedRowsCount} of {" "}
      {displayedRows} row{selectedRowsCount > 1 ? "s" : ""} selected.
      {#if selectedRowsCount}
        <DeleteMultipleEntries {selectedRows} />
      {/if}
    </div>
    <KvEntriesNavigation />
  </div>
</div>
