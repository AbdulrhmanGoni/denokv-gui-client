<script lang="ts">
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import {
    fetchEntries,
    kvEntriesState,
  } from "$lib/states/kvEntriesState.svelte";

  let thereIsNextCursor = $derived(
    !!kvEntriesState.params.cursors.at(-1) && !kvEntriesState.noMoreEntries,
  );

  let thereIsPreviousCursor = $derived(
    kvEntriesState.params.cursors.length > 1,
  );

  function next() {
    thereIsNextCursor && fetchEntries();
  }

  function prev() {
    if (thereIsPreviousCursor) {
      kvEntriesState.params.cursors.pop();
      if (kvEntriesState.entries.length > 0) {
        kvEntriesState.params.cursors.pop();
      }
      if (kvEntriesState.noMoreEntries) {
        kvEntriesState.noMoreEntries = false;
      }
      fetchEntries();
    }
  }
</script>

<div class="flex gap-2 ms-auto">
  <Button
    class={thereIsPreviousCursor ? "" : "opacity-25"}
    size="sm"
    onclick={prev}
    disabled={!thereIsPreviousCursor}
  >
    <ArrowLeft /> Prev
  </Button>
  <Button
    class={thereIsNextCursor ? "" : "opacity-25"}
    size="sm"
    onclick={next}
    disabled={!thereIsNextCursor}
  >
    Next <ArrowRight />
  </Button>
</div>
