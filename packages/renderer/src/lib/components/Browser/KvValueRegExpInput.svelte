<script lang="ts">
    import { CodeJar } from "codejar";
    import { onMount } from "svelte";
    import dataTypesColors from "./dataTypesColors";

    type ValueEditorProps = {
        value: string;
    };
    let { value = $bindable() }: ValueEditorProps = $props();

    let regexpJar: CodeJar | null = $state(null);
    let flagsJar: CodeJar | null = $state(null);

    let currentRegExp: { source: string; flags: string } = $state(
        JSON.parse(value),
    );

    onMount(() => {
        regexpJar = CodeJar(
            document.querySelector("#regexp-editorId")!,
            () => {},
        );

        flagsJar = CodeJar(
            document.querySelector("#flags-editorId")!,
            () => {},
        );

        regexpJar?.updateCode(currentRegExp.source);
        flagsJar?.updateCode(currentRegExp.flags);

        regexpJar?.onUpdate((source) => (currentRegExp.source = source));
        flagsJar?.onUpdate((flags) => (currentRegExp.flags = flags));
    });

    $effect(() => {
        value = JSON.stringify(currentRegExp);
    });
</script>

<div
    class="bg-card p-3 overflow-auto font-semibold rounded-md flex items-center"
>
    <span class={`${dataTypesColors.blue} me-1`}>new</span>
    <span class="dark:text-[#06a606] text-[#038703]">RegExp</span>
    <span class="text-foreground">(</span>
    {@render stringQuote()}
    <span
        class={`${dataTypesColors.regexp} bg-muted px-1 rounded-sm min-w-5`}
        id="regexp-editorId"
    ></span>
    {@render stringQuote()}
    <span class="text-foreground">, </span>
    {@render stringQuote()}
    <span
        class={`${dataTypesColors.blue} bg-muted px-1 rounded-sm min-w-3`}
        id="flags-editorId"
    ></span>
    {@render stringQuote()}
    <span class="text-foreground">)</span>
</div>

{#snippet stringQuote()}
    <span class={dataTypesColors.string}>"</span>
{/snippet}
