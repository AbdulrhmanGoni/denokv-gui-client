<script lang="ts">
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import {
    fetchEntries,
    kvEntriesState,
    kvEntriesStateDefaultValues,
    resetBrowsingParamsState,
    setBrowsingParams,
  } from "../../states/kvEntriesState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import SaveFilterIcon from "@lucide/svelte/icons/funnel-plus";
  import RotateCwIcon from "@lucide/svelte/icons/rotate-cw";
  import FunnelPlusIcon from "@lucide/svelte/icons/funnel-plus";
  import FunnelIcon from "@lucide/svelte/icons/funnel";
  import XIcon from "@lucide/svelte/icons/x";
  import CodeRenderer from "./CodeRenderer.svelte";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import { untrack } from "svelte";
  import BrowsingParamsForm from "./BrowsingParamsForm.svelte";

  let prefixKeyEditorValue = $state(kvEntriesStateDefaultValues.params.prefix);
  let startKeyEditorValue = $state(kvEntriesStateDefaultValues.params.start);
  let endKeyEditorValue = $state(kvEntriesStateDefaultValues.params.end);
  let limitValue = $derived(kvEntriesStateDefaultValues.params.limit);

  let openBrowseParamsForm = $state(false);

  function onApplyParams() {
    setBrowsingParams({
      prefix: prefixKeyEditorValue,
      start: startKeyEditorValue,
      end: endKeyEditorValue,
      limit: limitValue,
    });
    closeDialog();
  }

  function getOpen() {
    return openBrowseParamsForm;
  }

  function setOpen(newOpen: boolean) {
    openBrowseParamsForm = newOpen;
  }

  function closeDialog() {
    setOpen(false);
  }

  $effect(() => {
    if (kvStoresState.openedStore?.id) {
      untrack(() => {
        prefixKeyEditorValue = kvEntriesStateDefaultValues.params.prefix;
        startKeyEditorValue = kvEntriesStateDefaultValues.params.start;
        endKeyEditorValue = kvEntriesStateDefaultValues.params.end;
        limitValue = kvEntriesStateDefaultValues.params.limit;
      });
    }
  });
</script>

<div class="flex gap-2 flex-1 overflow-auto">
  <div
    class="flex gap-2 overflow-auto scroll-smooth"
    id="wheel"
    onwheel={(e) => {
      e.currentTarget.scrollLeft += e.deltaY;
    }}
  >
    <div
      class="flex gap-1 items-center font-bold bg-card px-2 rounded-sm text-sm"
    >
      <p>Prefix:</p>
      <CodeRenderer code={kvEntriesState.params.prefix} />
    </div>

    <div
      class="flex gap-1 items-center font-bold bg-card px-2 rounded-sm text-sm"
    >
      <p>Start:</p>
      <CodeRenderer code={kvEntriesState.params.start} />
    </div>

    <div
      class="flex gap-1 items-center font-bold bg-card px-2 rounded-sm text-sm"
    >
      <p>End:</p>
      <CodeRenderer code={kvEntriesState.params.end} />
    </div>
  </div>

  <div
    class="flex gap-1 items-center font-bold bg-card px-2 rounded-sm text-sm"
  >
    <p>Limit:</p>
    <CodeRenderer code={String(kvEntriesState.params.limit)} />
  </div>

  <Button
    size="sm"
    class="h-9"
    variant="secondary"
    onclick={() => {
      setOpen(true);
    }}
  >
    <FunnelPlusIcon />
    Filter
  </Button>

  <Button
    size="sm"
    class="h-9"
    variant="outline"
    onclick={() => {
      resetBrowsingParamsState();
      prefixKeyEditorValue = "[]";
      startKeyEditorValue = "[]";
      endKeyEditorValue = "[]";
      fetchEntries();
    }}
  >
    Reset
    <RotateCwIcon />
  </Button>
</div>

<AlertDialog.Root bind:open={getOpen, setOpen}>
  <AlertDialog.Content class="!max-w-xl w-full p-3 gap-2">
    <h1 class="flex gap-2 items-center text-2xl font-bold">
      <FunnelIcon /> Filter
    </h1>
    <p class="gap-1.5 text-foreground">
      See the
      <a
        class="hover:underline text-secondary"
        href="https://docs.deno.com/deploy/kv/manual/operations/#list"
        target="_blank"
        rel="noopener noreferrer"
      >
        official manual
      </a>
      of <strong>Deno Kv database</strong> for more information about how filtering
      entries works.
    </p>
    <BrowsingParamsForm
      bind:prefix={prefixKeyEditorValue}
      bind:start={startKeyEditorValue}
      bind:end={endKeyEditorValue}
      bind:limit={limitValue}
    >
      <div class="flex flex-row-reverse gap-2">
        <Button onclick={onApplyParams} size="sm">
          Apply
          <SaveFilterIcon />
        </Button>
        <Button variant="outline" size="sm" onclick={closeDialog}>
          Close
          <XIcon />
        </Button>
      </div>
    </BrowsingParamsForm>
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
  #wheel::-webkit-scrollbar {
    height: 2px;
  }
</style>
