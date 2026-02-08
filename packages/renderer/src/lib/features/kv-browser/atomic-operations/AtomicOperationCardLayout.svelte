<script lang="ts">
    import { cn } from "$lib/shadcn-utils";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import XIcon from "@lucide/svelte/icons/x";
    import type { AtomicOperationInput } from "@app/bridge-server";
    import { atomicOperationActions } from "./atomicOperationActions";
    import {
        operationsOrder,
        rearrangeAtomicOperation,
        removeAtomicOperation,
    } from "./atomicOperationsState.svelte";
    import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { type Snippet } from "svelte";
    import { calcAtomicOperationCardPosition } from "./calcAtomicOperationCardPosition";

    type AtomicOperationCardLayoutProps = {
        operation: AtomicOperationInput;
        id: string;
        children: Snippet;
    };

    const { operation, id, children }: AtomicOperationCardLayoutProps =
        $props();

    let order = $derived($operationsOrder.indexOf(id));
    let cardRef: HTMLDivElement | undefined = $state();
    let Icon = atomicOperationActions[operation.name].icon;
</script>

<div
    class="top-0 left-0 w-full h-[42px] absolute transition-all flex items-center gap-1"
    bind:this={cardRef}
    style="top: {calcAtomicOperationCardPosition(order)}px;"
    data-order={order}
>
    <button class="cursor-pointer" onclick={() => removeAtomicOperation(id)}>
        <XIcon class="size-4" />
    </button>
    <div
        class="flex items-center bg-card rounded-md border h-full w-full shadow-lg"
    >
        <div
            class={cn(
                "flex gap-1.5 items-center px-2 py-2 rounded-s-md",
                atomicOperationActions[operation.name].titleClass,
            )}
        >
            <Icon class="size-4.5" />
            <p>{operation.name}:</p>
        </div>
        <Separator orientation="vertical" />
        {@render children()}
        <Separator orientation="vertical" />
        <div class="flex flex-col justify-center h-full">
            <button
                class="px-1.5 py-0.5 hover:bg-muted cursor-pointer transition-colors"
                onclick={() => rearrangeAtomicOperation(cardRef!, "up")}
            >
                <ChevronUpIcon class="size-4" />
            </button>
            <Separator orientation="horizontal" />
            <button
                class="px-1.5 py-0.5 hover:bg-muted cursor-pointer transition-colors"
                onclick={() => rearrangeAtomicOperation(cardRef!, "down")}
            >
                <ChevronDownIcon class="size-4" />
            </button>
        </div>
    </div>
</div>
