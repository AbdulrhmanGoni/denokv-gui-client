<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import type { Snippet } from "svelte";
  import * as Select from "../shadcn/select";
  import { Checkbox } from "../shadcn/checkbox/index";
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
    batchSize = $bindable(),
    consistency = $bindable(),
    reverse = $bindable(),
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
    <div class="flex gap-2 items-end">
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text class="me-1">Batch Size:</InputGroup.Text>
        </InputGroup.Addon>
        <InputGroup.Input
          type="number"
          bind:value={batchSize}
          class="ps-0.5!"
        />
      </InputGroup.Root>
    </div>
    <div class="flex gap-2 items-end">
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text class="me-1">Consistency:</InputGroup.Text>
        </InputGroup.Addon>
        <Select.Root type="single" bind:value={consistency}>
          <Select.Trigger class="w-fit bg-transparent! border-0">
            {consistency[0].toUpperCase() + consistency.substring(1)}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="strong">Strong (default)</Select.Item>
            <Select.Item value="eventual">Eventual</Select.Item>
          </Select.Content>
        </Select.Root>
      </InputGroup.Root>
    </div>
  </div>
  <div class="flex gap-2 items-start">
    <Checkbox class="mt-1" bind:checked={reverse} />
    <div>
      <p class="font-bold text-base">Reverse?</p>
      <p class="text-sm text-muted-foreground">
        Return the entries in reverse order
      </p>
    </div>
  </div>
  <Separator />
  {@render children()}
</div>
