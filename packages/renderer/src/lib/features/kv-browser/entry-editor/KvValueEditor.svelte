<script lang="ts">
  import { CodeJar } from "codejar";
  import ScanTextIcon from "@lucide/svelte/icons/scan-text";
  import ButtonWithTooltip from "$lib/ui/primitives/ButtonWithTooltip.svelte";
  import KvValueDataTypeSelect from "$lib/features/kv-browser/entry-editor/inputs/KvValueDataTypeSelect.svelte";
  import {
    dataTypes,
    type KvDataType,
  } from "$lib/features/kv-browser/utils/dataTypes";
  import CodeEditor from "$lib/features/kv-browser/entry-editor/CodeEditor.svelte";
  import codeFormatter from "$lib/helpers/codeFormatter";
  import { type Snippet } from "svelte";
  import { Input } from "$lib/ui/shadcn/input";
  import dataTypesColors from "$lib/features/kv-browser/utils/dataTypesColors";
  import KvValueNumberInput from "$lib/features/kv-browser/entry-editor/inputs/KvValueNumberInput.svelte";
  import KvValueBooleanInput from "$lib/features/kv-browser/entry-editor/inputs/KvValueBooleanInput.svelte";
  import KvValueDateInput from "$lib/features/kv-browser/entry-editor/inputs/KvValueDateInput.svelte";
  import KvValueNumberInputWithSpecials from "$lib/features/kv-browser/entry-editor/inputs/KvValueNumberInputWithSpecials.svelte";
  import KvValueRegExpInput from "$lib/features/kv-browser/entry-editor/inputs/KvValueRegExpInput.svelte";

  type ValueEditorProps = {
    defaultValue: KvEntry["value"];
    editorValue: KvEntry["value"];
    titleIcon: Snippet;
    title?: string;
    jar?: CodeJar;
  };

  let {
    defaultValue,
    editorValue = $bindable(),
    titleIcon,
    title,
    jar = $bindable(),
  }: ValueEditorProps = $props();

  let dataType: KvDataType = $state(
    dataTypes.find((dt) => editorValue?.type == dt.type) ??
      (dataTypes.find((dt) => dt.type == defaultValue.type) as KvDataType),
  );

  const isFormattableValue = $derived(
    ["Object", "Array", "Set", "Map", "Uint8Array"].includes(dataType.type),
  );

  function formatEditorValue() {
    if (isFormattableValue) {
      jar?.updateCode(codeFormatter(String(editorValue.data)));
    }
  }

  function kvValueToEditorValue(defaultValue?: KvEntry["value"]) {
    return defaultValue?.data.toString() ?? "";
  }

  function onDataTypeChange(selectedDataType: KvDataType) {
    if (selectedDataType.type == defaultValue?.type) {
      editorValue.data = String(defaultValue.data);
      isFormattableValue &&
        jar?.updateCode(codeFormatter(kvValueToEditorValue(defaultValue)));
    } else {
      editorValue.data = selectedDataType.starter;
      isFormattableValue &&
        jar?.updateCode(codeFormatter(selectedDataType.starter));
    }

    editorValue.type = selectedDataType.type;
  }
</script>

<div class="space-y-3">
  <div class="flex gap-2 items-center">
    {@render titleIcon()}
    <p class="font-bold text-lg">{title ?? "Value"}</p>
    <div class="flex gap-2 items-center ml-auto">
      {#if isFormattableValue}
        <ButtonWithTooltip
          tooltipContent="Format"
          size="icon"
          onclick={formatEditorValue}
          variant="outline"
          disabled={!isFormattableValue}
        >
          <ScanTextIcon />
        </ButtonWithTooltip>
      {/if}
      <KvValueDataTypeSelect
        bind:selectedDataType={dataType}
        onSelect={onDataTypeChange}
      />
    </div>
  </div>
  <div class="h-[270px]">
    {#if editorValue.type == "Number"}
      <KvValueNumberInputWithSpecials bind:value={editorValue.data as string} />
    {:else if editorValue.type == "BigInt" || editorValue.type == "KvU64"}
      <KvValueNumberInput
        bind:value={editorValue.data as string}
        type={editorValue.type}
      />
    {:else if editorValue.type == "String"}
      <Input
        type="text"
        bind:value={editorValue.data}
        placeholder="String..."
      />
    {:else if editorValue.type == "Boolean"}
      <KvValueBooleanInput bind:value={editorValue.data as boolean} />
    {:else if editorValue.type == "Date"}
      <KvValueDateInput bind:value={editorValue.data as string} />
    {:else if editorValue.type == "RegExp"}
      <KvValueRegExpInput bind:value={editorValue.data as string} />
    {:else if editorValue.type == "Null" || editorValue.type == "Undefined"}
      <div
        class="flex gap-1 items-center font-bold bg-card px-3 py-2.5 rounded-sm"
      >
        <span class={dataTypesColors[editorValue.type.toLowerCase()]}>
          {editorValue.type.toLowerCase()}
        </span>
      </div>
    {:else}
      <CodeEditor
        className="h-full"
        editorId="value-editor"
        bind:jar
        bind:editorValue={editorValue.data as string}
      />
    {/if}
  </div>
</div>
