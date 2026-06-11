<script lang="ts">
  import type { Row } from "@tanstack/table-core";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import {
    unwatchKvEntries,
    watchKvEntries,
  } from "$lib/states/watchedKvEntriesState.svelte";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";

  const { selectedRows }: { selectedRows: Row<SerializedKvEntry>[] } = $props();
</script>

<div class="flex items-center rounded-md border overflow-hidden">
  <Button
    size="sm"
    class="gap-1 h-fit px-2! py-1! rounded-none border-e"
    variant="secondary"
    onclick={() => watchKvEntries(selectedRows.map((r) => r.original))}
  >
    <EyeIcon />
    Watch
  </Button>
  <Button
    size="sm"
    class="gap-1 h-fit px-2! py-1! border-0 rounded-none border-s"
    variant="outline"
    onclick={() => unwatchKvEntries(selectedRows.map((r) => r.original))}
  >
    <EyeOffIcon />
    Unwatch
  </Button>
</div>
