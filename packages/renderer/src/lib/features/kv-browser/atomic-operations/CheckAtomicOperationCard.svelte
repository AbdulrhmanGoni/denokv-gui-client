<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import type { AtomicOperationInput } from "@app/bridge-server";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import TagIcon from "@lucide/svelte/icons/tag";
    import AtomicOperationCardLayout from "./AtomicOperationCardLayout.svelte";
    import dataTypesColors from "../utils/dataTypesColors";

    const {
        operation,
        id,
    }: {
        operation: Extract<AtomicOperationInput, { name: "check" }>;
        id: string;
    } = $props();
</script>

<AtomicOperationCardLayout {id} {operation}>
    <div
        class="flex gap-1 items-center flex-1 font-semibold px-1.5 overflow-auto"
    >
        <CodeRenderer code={operation.key} />
    </div>
    <Separator orientation="vertical" />
    <div class="flex items-center gap-0.5 font-semibold px-1.5">
        <TagIcon class="size-4.5" />:
        <span
            class="ms-1 {!operation.versionstamp ? dataTypesColors.null : ''}"
        >
            {String(operation.versionstamp)}
        </span>
    </div>
</AtomicOperationCardLayout>
