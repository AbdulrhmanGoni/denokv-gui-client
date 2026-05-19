<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import type { AtomicOperationInput } from "@app/bridge-server";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import AtomicOperationCardLayout from "./AtomicOperationCardLayout.svelte";
    import KvValueRenderer from "../entry-renderer/KvValueRenderer.svelte";

    const {
        operation,
        id,
    }: {
        operation: Extract<AtomicOperationInput, { name: "set" }>;
        id: string;
    } = $props();
</script>

<AtomicOperationCardLayout {id} {operation}>
    <div
        class="flex gap-1 items-center flex-1 font-semibold px-1.5 overflow-auto"
    >
        key: <CodeRenderer code={operation.key} />
    </div>
    <Separator orientation="vertical" />
    <div
        class="flex gap-1 items-center flex-1 font-semibold px-1.5 overflow-auto"
    >
        value: <KvValueRenderer value={operation.value} />
    </div>
</AtomicOperationCardLayout>
