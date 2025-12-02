<script lang="ts">
    import dataTypesColors from "./dataTypesColors";

    let { regExpValue }: { regExpValue: string } = $props();
    const regExp: { source: string; flags: string } = $derived(
        JSON.parse(regExpValue),
    );
</script>

{@render fSlash()}{regExp.source}{@render fSlash()}<!--
--><span
    class={dataTypesColors.blue}
>
    {regExp.flags}
</span>

{#snippet fSlash()}
    <span class="text-foreground">/</span>
{/snippet}
