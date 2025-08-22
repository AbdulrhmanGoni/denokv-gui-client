<script lang="ts">
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/shadcn/data-table/index.js";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import * as Table from "$lib/components/shadcn/table/index.js";
  import {
    type RowSelectionState,
    getCoreRowModel,
  } from "@tanstack/table-core";
  import { kvEntriesState, fetchEntries } from "./kvEntriesState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
  import Loader from "@lucide/svelte/icons/loader";
  import { openKvEntryDialog } from "./kvEntryDialogState.svelte";
  import { columns } from "./columns";
  import KvEntriesNavigation from "./KvEntriesNavigation.svelte";

  let rowSelection = $state<RowSelectionState>({});

  const table = createSvelteTable({
    get data() {
      return kvEntriesState.entries;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
    state: {
      get rowSelection() {
        return rowSelection;
      },
    },
  });
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
          {#each table.getRowModel().rows as row (row.id)}
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
  <div class="flex gap-2 p-2 items-center text-foreground text-sm bg-muted">
    {table.getFilteredSelectedRowModel().rows.length} of {" "}
    {table.getFilteredRowModel().rows.length} row(s) selected.
    <KvEntriesNavigation />
  </div>
</div>
