<script lang="ts">
  import { FlexRender } from "$lib/ui/shadcn/data-table/index.js";
  import * as Table from "$lib/ui/shadcn/table/index.js";
  import type { Row } from "@tanstack/table-core";
  import { openKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";

  const { row }: { row: Row<SerializedKvEntry> } = $props();
</script>

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
