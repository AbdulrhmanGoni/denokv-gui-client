<script lang="ts">
    import { cn } from "$lib/shadcn-utils";
    import { Checkbox } from "$lib/ui/shadcn/checkbox";
    import dataTypesColors from "$lib/features/kv-browser/utils/dataTypesColors";
    import * as InputGroup from "$lib/ui/shadcn/input-group/index.js";

    type ValueEditorProps = {
        value: number | string;
    };

    let { value = $bindable() }: ValueEditorProps = $props();
    let numberInput = $state(value);
    let numberInputChecked = $state(typeof value == "number");
</script>

<div class="space-y-2">
    <div class="flex items-center gap-2">
        <InputGroup.Root>
            <InputGroup.Input
                bind:value={numberInput}
                type="number"
                placeholder="Number"
                onchange={(e) => {
                    if (numberInputChecked) {
                        const number =
                            e.currentTarget.value != ""
                                ? Number(e.currentTarget.value)
                                : "";
                        value = number;
                    }
                }}
            />
            <InputGroup.Addon>
                <Checkbox
                    bind:checked={numberInputChecked}
                    class="ml-1 cursor-pointer"
                    onCheckedChange={(checked) => {
                        if (checked) {
                            value = numberInput;
                        } else {
                            value = "";
                        }
                    }}
                />
            </InputGroup.Addon>
        </InputGroup.Root>
    </div>
    <div class="flex gap-2">
        {@render specialNumber("NaN", dataTypesColors.number)}
        {@render specialNumber("Infinity", dataTypesColors.blue)}
        {@render specialNumber("-Infinity", dataTypesColors.blue)}
    </div>
</div>

{#snippet specialNumber(
    specialNumber: "NaN" | "Infinity" | "-Infinity",
    color: string,
)}
    <button
        class={cn(
            "flex gap-1 flex-1 justify-center font-bold bg-card px-3 py-2 rounded-sm text-sm cursor-pointer hover:bg-accent border border-transparent",
            color,
            value == specialNumber ? "border-primary" : "",
        )}
        onclick={() => {
            if (value == specialNumber) {
                value = "";
            } else {
                value = specialNumber;
            }
            numberInputChecked = false;
        }}
    >
        {specialNumber}
    </button>
{/snippet}
