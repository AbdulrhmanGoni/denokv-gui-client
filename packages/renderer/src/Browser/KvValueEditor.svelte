<script lang="ts">
  import { CodeJar } from "codejar";
  import ScanTextIcon from "@lucide/svelte/icons/scan-text";
  import ButtonWithTooltip from "$lib/components/custom/ButtonWithTooltip.svelte";
  import EditFileIcon from "@lucide/svelte/icons/file-pen";
  import KvValueDataTypeSelect from "./KvValueDataTypeSelect.svelte";
  import type { KvDataType } from "./dataTypes";
  import CodeEditor from "./CodeEditor.svelte";
  import codeFormatter from "./codeFormatter";
  import { onMount } from "svelte";

  type ValueEditorProps = {
    defaultValue?: KvEntry["value"];
    jar?: KvValueCodeEditor;
  };

  let { defaultValue, jar = $bindable() }: ValueEditorProps = $props();

  let editorValue = $state(kvValueToEditorValue(defaultValue));
  let dataType: KvDataType | undefined = $state();

  function formatEditorValue() {
    jar?.updateCode(codeFormatter(editorValue));
  }

  function editorValueToKvValue(this: CodeJar) {
    return {
      type: dataType?.type ?? defaultValue?.type ?? "",
      data: this.toString()!,
    };
  }

  function kvValueToEditorValue(defaultValue?: KvEntry["value"]) {
    return defaultValue?.type === "String"
      ? `"${defaultValue.data}"`
      : (defaultValue?.data.toString() ?? "");
  }

  function onDataTypeChange(selectedDataType: KvDataType) {
    if (selectedDataType.type === defaultValue?.type) {
      jar?.updateCode(codeFormatter(kvValueToEditorValue(defaultValue)));
    } else {
      jar?.updateCode(selectedDataType.starter);
    }
  }

  onMount(() => {
    jar && Object.assign(jar, { toKvValue: editorValueToKvValue });
  });
</script>

<div class="space-y-3">
  <div class="flex gap-2 items-center">
    <EditFileIcon />
    <p class="font-bold text-lg">Value</p>
    <div class="flex gap-2 items-center ml-auto">
      <KvValueDataTypeSelect
        bind:selectedDataType={dataType}
        defaultDataType={defaultValue?.type}
        onSelect={onDataTypeChange}
      />
      <ButtonWithTooltip
        tooltipContent="Format"
        size="icon"
        onclick={formatEditorValue}
        variant="outline"
      >
        <ScanTextIcon />
      </ButtonWithTooltip>
    </div>
  </div>
  <CodeEditor
    className="h-[350px]"
    editorId="value-editor"
    bind:jar
    bind:editorValue
  />
</div>
