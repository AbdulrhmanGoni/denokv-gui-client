<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import type { Snippet } from "svelte";
  import * as InputGroup from "../shadcn/input-group/index";
  import type { CodeJar } from "codejar";

  type Props = BrowsingParams & {
    children: Snippet;
    prefixRef?: CodeJar;
    startRef?: CodeJar;
    endRef?: CodeJar;
  };

  let {
    prefix = $bindable(),
    prefixRef = $bindable(),
    start = $bindable(),
    startRef = $bindable(),
    end = $bindable(),
    endRef = $bindable(),
    limit = $bindable(),
    children,
  }: Props = $props();
</script>

<div class="grid w-full items-start gap-2 mt-2">
  <div>
    <p class="font-bold text-lg">Prefix</p>
    <CodeEditor
      editorId="prefix-key-editor"
      bind:editorValue={prefix}
      bind:jar={prefixRef}
      className="w-full max-h-28 py-2 px-3"
    />
  </div>
  <Separator />
  <div>
    <p class="font-bold text-lg">Start</p>
    <CodeEditor
      editorId="start-key-editor"
      bind:editorValue={start}
      bind:jar={startRef}
      className="w-full max-h-28 py-2 px-3"
    />
  </div>
  <Separator />
  <div>
    <p class="font-bold text-lg">End</p>
    <CodeEditor
      editorId="end-key-editor"
      bind:editorValue={end}
      bind:jar={endRef}
      className="w-full max-h-28 py-2 px-3"
    />
  </div>
  <Separator />
  <div class="flex gap-3">
    <div class="flex gap-2 items-end">
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text class="me-1">Limit:</InputGroup.Text>
        </InputGroup.Addon>
        <InputGroup.Input type="number" bind:value={limit} class="ps-0.5!" />
      </InputGroup.Root>
    </div>
  </div>
  <Separator />
  {@render children()}
</div>
