<script lang="ts">
    import PLink from "$lib/ui/primitives/PLink.svelte";
    import NumberAtomicOperation from "./NumberAtomicOperation.svelte";
    import PlusIcon from "@lucide/svelte/icons/plus";

    let { close }: { close?: () => void } = $props();
</script>

<NumberAtomicOperation
    operationName="sum"
    Icon={PlusIcon}
    {close}
    {description}
/>

{#snippet description()}
    <p class="text-muted-foreground">
        Adds the value of the key to the sum. If the key does not exist, it is
        created with the value of the sum. For more information, see the
        <PLink href="https://docs.deno.com/deploy/kv/operations/#sum">
            official documentation
        </PLink>
    </p>
{/snippet}
