<script lang="ts">
  import type { AtomicOperationUIInput } from "./atomicOperationsState.svelte";
  import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
  import AtomicOperationCardLayout from "./AtomicOperationCardLayout.svelte";

  const {
    operation,
    id,
  }: {
    operation: Extract<AtomicOperationUIInput, { name: "delete" }>;
    id: string;
  } = $props();
</script>

<AtomicOperationCardLayout {id} {operation}>
  <div class="flex-1 font-semibold px-1.5 overflow-auto">
    <CodeRenderer code={operation.key} />
  </div>
</AtomicOperationCardLayout>
