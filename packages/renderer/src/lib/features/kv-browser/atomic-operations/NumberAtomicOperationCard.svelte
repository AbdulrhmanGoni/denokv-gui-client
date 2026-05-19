<script lang="ts">
    import type { AtomicOperationInput } from "@app/bridge-server";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import dataTypesColors from "../utils/dataTypesColors";
    import AtomicOperationCardLayout from "./AtomicOperationCardLayout.svelte";

    const {
        operation,
        id,
    }: {
        operation: Extract<
            AtomicOperationInput,
            { name: "sum" | "min" | "max" }
        >;
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
    <div class="flex gap-1 items-center font-semibold px-1.5">
        value:
        <span class={dataTypesColors.number}>{String(operation.value)}</span>
    </div>
</AtomicOperationCardLayout>
