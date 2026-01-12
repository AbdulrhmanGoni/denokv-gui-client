<script lang="ts">
  import * as Dialog from "$lib/components/shadcn/dialog/index.js";
  import {
    fetchSavedDefaultBrowsingParams,
    kvEntriesState,
    resetBrowsingParamsState,
    setBrowsingParams,
    kvEntriesStateDefaultValues,
  } from "../../states/kvEntriesState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import SaveFilterIcon from "@lucide/svelte/icons/funnel-plus";
  import ClearFilter from "@lucide/svelte/icons/funnel-x";
  import FunnelPlusIcon from "@lucide/svelte/icons/funnel-plus";
  import BookMarkedIcon from "@lucide/svelte/icons/book-marked";
  import FunnelIcon from "@lucide/svelte/icons/funnel";
  import EditIcon from "@lucide/svelte/icons/pencil-line";
  import CodeRenderer from "./CodeRenderer.svelte";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import { untrack } from "svelte";
  import BrowsingParamsForm from "./BrowsingParamsForm.svelte";
  import SavedBrowsingParamsList from "./SavedBrowsingParamsList.svelte";
  import { browsingParamsService } from "@app/preload";
  import { toast } from "svelte-sonner";
  import Checkbox from "../shadcn/checkbox/checkbox.svelte";
  import Label from "../shadcn/label/label.svelte";
  import Separator from "../shadcn/separator/separator.svelte";
  import type { CodeJar } from "codejar";
  import ButtonWithTooltip from "../custom/ButtonWithTooltip.svelte";

  let prefixKeyEditorValue = $derived(kvEntriesState.params.prefix);
  let startKeyEditorValue = $derived(kvEntriesState.params.start);
  let endKeyEditorValue = $derived(kvEntriesState.params.end);
  let prefixKeyEditorRef: CodeJar | undefined = $state();
  let startKeyEditorRef: CodeJar | undefined = $state();
  let endKeyEditorRef: CodeJar | undefined = $state();

  let limitValue = $derived(kvEntriesState.params.limit);
  let batchSizeValue = $derived(kvEntriesState.params.batchSize);
  let consistencyValue = $derived(kvEntriesState.params.consistency);
  let reverseValue = $derived(!!kvEntriesState.params.reverse);

  let openBrowseParamsForm = $state(false);

  let saveParams = $state(false);
  let setParamsAsDefault = $state(false);

  function resetFormParams() {
    prefixKeyEditorRef?.updateCode(kvEntriesStateDefaultValues.params.prefix);
    startKeyEditorRef?.updateCode(kvEntriesStateDefaultValues.params.start);
    endKeyEditorRef?.updateCode(kvEntriesStateDefaultValues.params.end);
    limitValue = kvEntriesStateDefaultValues.params.limit;
    batchSizeValue = kvEntriesStateDefaultValues.params.batchSize;
    consistencyValue = kvEntriesStateDefaultValues.params.consistency;
    reverseValue = !!kvEntriesStateDefaultValues.params.reverse;
  }

  function onApplyParams() {
    setBrowsingParams({
      prefix: prefixKeyEditorValue,
      start: startKeyEditorValue,
      end: endKeyEditorValue,
      limit: limitValue,
      batchSize: batchSizeValue,
      consistency: consistencyValue,
      reverse: reverseValue,
    });
    setOpen(false);
    if (saveParams) {
      saveBrowsingParams();
    }
  }

  function getOpen() {
    return openBrowseParamsForm;
  }

  function setOpen(newOpen: boolean) {
    openBrowseParamsForm = newOpen;
  }

  $effect(() => {
    if (kvStoresState.openedStore?.id) {
      untrack(() => {
        resetBrowsingParamsState();
      });
    }
  });

  $effect(() => {
    if (!openBrowseParamsForm) {
      untrack(() => {
        saveParams = false;
        setParamsAsDefault = false;
      });
    }
  });

  function saveBrowsingParams() {
    if (kvStoresState.openedStore) {
      const { result, error } = browsingParamsService.saveBrowsingParams(
        kvStoresState.openedStore.id,
        {
          browsingParams: {
            prefix: prefixKeyEditorValue,
            start: startKeyEditorValue,
            end: endKeyEditorValue,
            limit: limitValue,
            batchSize: batchSizeValue,
            consistency: consistencyValue,
            reverse: reverseValue,
          },
          setAsDefault: saveParams && setParamsAsDefault,
        },
      );

      if (result) {
        toast.success("Filter has been saved successfully");
        fetchSavedDefaultBrowsingParams();
      } else {
        toast.error(error);
      }
    }
  }

  let openSavedBrowsingParamsList = $state(false);
  function closeSavedBrowsingParamsList(closeDialog?: boolean) {
    openSavedBrowsingParamsList = false;
    if (closeDialog) {
      setOpen(false);
    }
  }
</script>

<div class="flex gap-1 overflow-auto bg-card rounded-md border">
  <div
    class="flex overflow-auto scroll-smooth items-center"
    id="wheel"
    onwheel={(e) => {
      e.currentTarget.scrollLeft += e.deltaY;
    }}
  >
    <div class="flex gap-1 items-center px-2 py-1 font-bold bg-muted">
      <FunnelPlusIcon class="size-4.5" />
      Filter
    </div>
    <Separator orientation="vertical" />
    <div
      class="flex gap-1 items-center font-semibold bg-card px-2 rounded-sm text-sm"
    >
      <p>Prefix:</p>
      <CodeRenderer code={kvEntriesState.params.prefix} />
    </div>

    <Separator orientation="vertical" />

    <div
      class="flex gap-1 items-center font-semibold bg-card px-2 rounded-sm text-sm"
    >
      <p>Start:</p>
      <CodeRenderer code={kvEntriesState.params.start} />
    </div>

    <Separator orientation="vertical" />

    <div
      class="flex gap-1 items-center font-semibold bg-card px-2 rounded-sm text-sm"
    >
      <p>End:</p>
      <CodeRenderer code={kvEntriesState.params.end} />
    </div>
  </div>

  <ButtonWithTooltip
    size="sm"
    tooltipContent="Edit Filters"
    onclick={() => {
      setOpen(true);
    }}
  >
    <EditIcon />
  </ButtonWithTooltip>
</div>

<Dialog.Root bind:open={getOpen, setOpen}>
  <Dialog.Content
    class="max-w-xl! w-full max-h-[600px]! overflow-auto p-3 gap-2"
  >
    {#if openSavedBrowsingParamsList}
      <SavedBrowsingParamsList closeList={closeSavedBrowsingParamsList} />
    {:else}
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
      <Separator />
      <BrowsingParamsForm
        bind:prefix={prefixKeyEditorValue}
        bind:prefixRef={prefixKeyEditorRef}
        bind:start={startKeyEditorValue}
        bind:startRef={startKeyEditorRef}
        bind:end={endKeyEditorValue}
        bind:endRef={endKeyEditorRef}
        bind:limit={limitValue}
        bind:batchSize={batchSizeValue}
        bind:consistency={consistencyValue}
        bind:reverse={reverseValue}
      >
        <div class="flex items-center gap-3 *:cursor-pointer">
          <Checkbox id="save" bind:checked={saveParams} />
          <Label for="save">Save this filter for reusing in the future?</Label>
        </div>
        <div class="flex items-center gap-3 *:cursor-pointer">
          <Checkbox
            id="set-default"
            bind:checked={setParamsAsDefault}
            disabled={!saveParams}
          />
          <Label for="set-default">
            Set this filter as the default for the current KV store?
          </Label>
        </div>
        <div class="flex flex-row-reverse gap-2 mt-2">
          <Button onclick={onApplyParams} size="sm">
            Apply
            <SaveFilterIcon />
          </Button>
          <Button
            class="ms-auto"
            variant="outline"
            size="sm"
            onclick={resetFormParams}
          >
            Reset
            <ClearFilter />
          </Button>
          <Button
            variant="secondary2"
            size="sm"
            onclick={() => {
              openSavedBrowsingParamsList = true;
            }}
          >
            <BookMarkedIcon class="size-4.5" />
            Saved Filters List
          </Button>
        </div>
      </BrowsingParamsForm>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<style>
  #wheel::-webkit-scrollbar {
    height: 2px;
    background-color: var(--color-card);
  }
</style>
