<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import Input from "$lib/components/shadcn/input/input.svelte";
  import type { Snippet } from "svelte";

  let {
    prefix = $bindable(),
    start = $bindable(),
    end = $bindable(),
    limit = $bindable(),
    children,
  }: BrowsingParams & { children: Snippet } = $props();
</script>

<div class="grid w-full items-start gap-2 mt-2">
  <div class="flex gap-3 justify-between items-end">
    <p class="font-bold text-lg">Limit</p>
    <Input type="number" bind:value={limit} class="w-18" placeholder="Limit" />
  </div>
  <Separator />
  <div>
    <p class="font-bold text-lg">Prefix</p>
    <CodeEditor
      editorId="prefix-key-editor"
      bind:editorValue={prefix}
      className="w-full max-h-28"
    />
  </div>
  <Separator />
  <div>
    <p class="font-bold text-lg">Start</p>
    <CodeEditor
      editorId="start-key-editor"
      bind:editorValue={start}
      className="w-full max-h-28"
    />
  </div>
  <Separator />
  <div>
    <p class="font-bold text-lg">End</p>
    <CodeEditor
      editorId="end-key-editor"
      bind:editorValue={end}
      className="w-full max-h-28"
    />
  </div>
  <Separator />
  {@render children()}
</div>
