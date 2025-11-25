<script lang="ts">
    import dataTypesColors from "./dataTypesColors";

    let { regExpValue }: { regExpValue: string } = $props();
    const regExp: RegExp = $derived(new RegExp(eval(regExpValue)));
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
