<script lang="ts">
    import type { AtomicOperationInput } from "@app/bridge-server";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import AtomicOperationCardLayout from "./AtomicOperationCardLayout.svelte";

    const {
        operation,
        id,
    }: {
        operation: Extract<AtomicOperationInput, { name: "enqueue" }>;
        id: string;
    } = $props();
</script>

<AtomicOperationCardLayout {id} {operation}>
    <div class="flex-1 font-semibold px-2 overflow-auto">
        <CodeRenderer
            code={String((operation.value as SerializedKvValue).data)}
        />
    </div>
</AtomicOperationCardLayout>
