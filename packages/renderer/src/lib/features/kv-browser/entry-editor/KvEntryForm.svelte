<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import KvValueEditor from "$lib/features/kv-browser/entry-editor/KvValueEditor.svelte";
    import KvKeyEditor from "$lib/features/kv-browser/entry-editor/KvKeyEditor.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import XIcon from "@lucide/svelte/icons/x";
    import ValueFileIcon from "@lucide/svelte/icons/file-braces";
    import KvEntryExpirationDate from "$lib/features/kv-browser/entry-editor/KvEntryExpirationDate.svelte";
    import type { Component, Snippet } from "svelte";
    import Checkbox from "$lib/ui/shadcn/checkbox/checkbox.svelte";
    import Label from "$lib/ui/shadcn/label/label.svelte";

    type KvEntryFormProps = {
        defaultValue?: KvEntry["value"];
        kvKeyCodeEditorRef?: KvKeyCodeEditor;
        kvValueEditorRef?: KvValueCodeEditor;
        header?: Snippet;
        onSubmit: (
            key: string,
            value: KvEntry["value"],
            expires: number,
            overwrite: boolean,
        ) => void;
        onClose?: () => void;
        valueEditorIcon?: () => void;
        loading?: boolean;
        submitButtonLabel?: string;
        submitButtonIcon?: Component;
        showOverwriteOption?: boolean;
    };

    let {
        kvKeyCodeEditorRef = $bindable(),
        kvValueEditorRef = $bindable(),
        ...props
    }: KvEntryFormProps = $props();

    let kvKeyCodeEditor: KvKeyCodeEditor | undefined =
        $state(kvKeyCodeEditorRef);

    const defaultValue = props.defaultValue ?? {
        type: "Undefined",
        data: "undefined",
    };
    let kvValueEditorValue: KvEntry["value"] = $state(defaultValue);
    let kvEntryExpirationDateValue: number = $state(NaN);
    let overwrite = $state(true);

    async function submitEntry() {
        props.onSubmit(
            kvKeyCodeEditor!?.toString(),
            $state.snapshot(kvValueEditorValue),
            kvEntryExpirationDateValue,
            overwrite,
        );
    }
</script>

<div class="max-w-3xl! w-full p-3 gap-0">
    {#if props.header}
        {@render props.header()}
        <Separator class="my-2" />
    {/if}
    <KvKeyEditor bind:jar={kvKeyCodeEditor} />
    {#if props.showOverwriteOption}
        <div class="flex items-center space-x-2 mt-2 *:cursor-pointer">
            <Checkbox id="overwrite" bind:checked={overwrite} />
            <Label
                for="overwrite"
                class="text-base font-medium {overwrite ? '' : 'opacity-70'}"
            >
                Overwrite existing entry with this key?
            </Label>
        </div>
    {/if}
    <Separator class="my-2" />
    <KvValueEditor
        bind:editorValue={kvValueEditorValue}
        {defaultValue}
        titleIcon={valueFileIcon}
        bind:jar={kvValueEditorRef}
    />
    <Separator class="my-2" />
    <KvEntryExpirationDate bind:value={kvEntryExpirationDateValue} />
    <Separator class="my-2" />
    <div class="flex flex-row-reverse gap-2">
        <Button
            disabled={props.loading}
            variant="secondary"
            size="sm"
            onclick={submitEntry}
        >
            {props.submitButtonLabel ?? "Add"}
            {#if props.loading}
                <LoaderIcon class="animate-spin" />
            {:else if props.submitButtonIcon}
                <props.submitButtonIcon />
            {:else}
                <PlusIcon />
            {/if}
        </Button>
        <Button
            disabled={props.loading}
            variant="outline"
            size="sm"
            onclick={props.onClose}
        >
            <XIcon />
            Close
        </Button>
    </div>
</div>

{#snippet valueFileIcon()}
    <ValueFileIcon />
{/snippet}
