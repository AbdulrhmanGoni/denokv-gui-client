<script lang="ts">
  import Button from "$lib/components/shadcn/button/button.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import {
    fetchEntries,
    kvEntriesState,
  } from "../../states/kvEntriesState.svelte";

  let thereIsNextCursor = $derived(
    !!kvEntriesState.params.cursors[kvEntriesState.params.nextCursorIndex] &&
      !kvEntriesState.noMoreEntries,
  );

  let thereIsPreviousCursor = $derived(
    !!kvEntriesState.params.cursors[kvEntriesState.params.nextCursorIndex - 1],
  );

  function next() {
    if (thereIsNextCursor) {
      fetchEntries();
    }
  }

  function prev() {
    if (thereIsPreviousCursor) {
      kvEntriesState.params.nextCursorIndex -= 2;
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
