<script lang="ts">
    import PLink from "$lib/ui/primitives/PLink.svelte";
    import NumberAtomicOperation from "./NumberAtomicOperation.svelte";
    import ArrowDown1_0Icon from "@lucide/svelte/icons/arrow-down-1-0";

    let { close }: { close?: () => void } = $props();
</script>

<NumberAtomicOperation
    operationName="min"
    Icon={ArrowDown1_0Icon}
    {close}
    {description}
/>

{#snippet description()}
    <p class="text-muted-foreground">
        Sets the value of the key to the minimum of its current value and a
        given value. If the key does not exist, it is created with the given
        value. For more information, see the
        <PLink href="https://docs.deno.com/deploy/kv/operations/#min">
            official documentation
        </PLink>
    </p>
{/snippet}
