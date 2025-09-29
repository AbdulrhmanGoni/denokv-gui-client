<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import {
    fetchEntries,
    kvEntriesState,
    kvEntriesStateDefaultValues,
    resetBrowsingParamsState,
  } from "../../states/kvEntriesState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import SaveIcon from "@lucide/svelte/icons/save";
  import RotateCwIcon from "@lucide/svelte/icons/rotate-cw";
  import FunnelPlusIcon from "@lucide/svelte/icons/funnel-plus";
  import FunnelIcon from "@lucide/svelte/icons/funnel";
  import XIcon from "@lucide/svelte/icons/x";
  import CodeRenderer from "./CodeRenderer.svelte";
  import Input from "$lib/components/shadcn/input/input.svelte";

  let prefixKeyEditorValue = $state("[]");
  let startKeyEditorValue = $state("[]");
  let endKeyEditorValue = $state("[]");
  let limitValue = $state(kvEntriesState.params.limit);

  let openBrowseParamsForm = $state(false);

  function onSaveParams() {
    kvEntriesState.params = {
      ...kvEntriesStateDefaultValues.params,
      prefix: prefixKeyEditorValue,
      start: startKeyEditorValue,
      end: endKeyEditorValue,
      limit: limitValue,
    };
    fetchEntries();
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
</script>

<div class="flex gap-2 flex-1">
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
    <h1 class="flex gap-2 items-center text-2xl font-bold mb-">
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
      works.
    </p>
    <div class="grid w-full items-start gap-2 mt-2">
      <div class="flex gap-3 justify-between items-end">
        <p class="font-bold text-lg">Limit</p>
        <Input
          type="number"
          bind:value={limitValue}
          class="w-18"
          placeholder="Limit"
        />
      </div>
      <Separator />
      <div>
        <p class="font-bold text-lg">Prefix</p>
        <CodeEditor
          editorId="prefix-key-editor"
          bind:editorValue={prefixKeyEditorValue}
          className="w-full max-h-28"
        />
      </div>
      <Separator />
      <div>
        <p class="font-bold text-lg">Start</p>
        <CodeEditor
          editorId="start-key-editor"
          bind:editorValue={startKeyEditorValue}
          className="w-full max-h-28"
        />
      </div>
      <Separator />
      <div>
        <p class="font-bold text-lg">End</p>
        <CodeEditor
          editorId="end-key-editor"
          bind:editorValue={endKeyEditorValue}
          className="w-full max-h-28"
        />
      </div>
      <Separator />
      <div class="flex flex-row-reverse gap-2">
        <Button onclick={onSaveParams} variant="secondary" size="sm">
          Apply
          <SaveIcon />
        </Button>
        <Button variant="outline" size="sm" onclick={closeDialog}>
          <XIcon />
          Close
        </Button>
      </div>
    </div>
  </AlertDialog.Content>
</AlertDialog.Root>
