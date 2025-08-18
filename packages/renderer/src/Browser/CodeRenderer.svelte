<script lang="ts">
  import codeFormatter from "./codeFormatter";
  import "/src/code-highlight.css";
  import hljs from "highlight.js/lib/core";
  import javascript from "highlight.js/lib/languages/javascript";

  hljs.registerLanguage("javascript", javascript);

  const { code, format }: { code: string; format?: boolean } = $props();

  function highlightValues(data: string) {
    return hljs.highlight(format ? codeFormatter(data) : data, {
      language: "javascript",
    }).value;
  }
</script>

{@html `<pre><code class="language-javascript">${highlightValues(code)}</code></pre>`}
