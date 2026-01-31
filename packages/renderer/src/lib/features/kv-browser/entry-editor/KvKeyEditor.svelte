<script lang="ts">
  import KeyFileIcon from "@lucide/svelte/icons/file-key";
  import CodeEditor from "$lib/features/kv-browser/entry-editor/CodeEditor.svelte";

  type KeyEditorProps = {
    jar?: KvKeyCodeEditor;
  };

  let { jar = $bindable() }: KeyEditorProps = $props();

  let editorValue = $state("[]");
</script>

<div class="space-y-1.5">
  <p class="flex gap-2 items-center font-bold text-lg">
    <KeyFileIcon /> Key
  </p>
  <CodeEditor editorId="key-editor" bind:editorValue bind:jar />
</div>
