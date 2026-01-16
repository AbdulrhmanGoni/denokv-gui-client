<script lang="ts">
  import { CodeJar } from "codejar";
  import { onMount } from "svelte";
  import "/src/code-highlight.css";
  import hljs from "highlight.js/lib/core";
  import javascript from "highlight.js/lib/languages/javascript";
  import format from "$lib/helpers/codeFormatter";
  import { cn } from "$lib/shadcn-utils";

  type CodeEditorProps = {
    editorId: string;
    editorValue: string;
    jar?: CodeJar;
    className?: string;
    autoFormat?: boolean;
  };

  let {
    editorId,
    editorValue = $bindable(),
    jar = $bindable(),
    className,
    autoFormat = true,
  }: CodeEditorProps = $props();

  hljs.registerLanguage("javascript", javascript);

  function highlight(editor: HTMLElement) {
    editorValue = editor.textContent;
    editor.innerHTML = hljs.highlight(editor.textContent, {
      language: "javascript",
    }).value;
  }

  onMount(() => {
    jar = CodeJar(document.querySelector(`#${editorId}`)!, highlight, {
      addClosing: false,
    });

    jar?.updateCode(autoFormat ? format(editorValue) : editorValue);
  });
</script>

<div
  id={editorId}
  class={cn("bg-card p-3 overflow-auto font-semibold rounded-md", className)}
></div>
