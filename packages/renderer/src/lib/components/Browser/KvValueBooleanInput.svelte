<script lang="ts">
    import { cn } from "$lib/shadcn-utils";
    import dataTypesColors from "./dataTypesColors";

    type ValueEditorProps = {
        value: string;
    };

    let { value = $bindable() }: ValueEditorProps = $props();
</script>

<div class="flex gap-2">
    {@render booleanValue(true)}
    {@render booleanValue(false)}
</div>

{#snippet booleanValue(boolean: boolean)}
    <button
        class={cn(
            "flex gap-1 basis-2/4 items-center font-bold bg-card px-3 py-2 rounded-sm cursor-pointer hover:bg-accent border border-transparent",
            dataTypesColors.blue,
            String(boolean) == value ? "border-primary" : "",
        )}
        onclick={() => {
            if (String(boolean) == value) {
                value = "";
            } else {
                value = String(boolean);
            }
        }}
    >
        {String(boolean)}
    </button>
{/snippet}
