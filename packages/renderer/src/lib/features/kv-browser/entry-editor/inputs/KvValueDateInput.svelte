<script lang="ts">
    import type { Snippet } from "svelte";
    import { Checkbox } from "$lib/ui/shadcn/checkbox";
    import { Input } from "$lib/ui/shadcn/input";
    import KvValueDateRenderer from "$lib/features/kv-browser/entry-renderer/KvValueDateRenderer.svelte";

    type ValueEditorProps = {
        value: string;
    };

    type CreateDateMethod = "Timestamp" | "DatePicker" | "CurrentDate";

    let { value = $bindable() }: ValueEditorProps = $props();

    const currentValue = value ? new Date(value).toISOString() : "";

    let timestamp = $state("");
    let datePicker = $state("");
    let nowDate = $state(new Date().toISOString());

    let selectedMethod: CreateDateMethod | null = $state(null);

    type InputOptionLayoutParams = {
        title: string;
        input?: Snippet;
        method: CreateDateMethod;
        data: string;
        onChecked?: () => void;
        placeholder?: string;
    };
</script>

<div class="space-y-2">
    <KvValueDateRenderer
        {value}
        className="bg-card px-4 py-3 rounded-sm font-bold"
    />
    <p class="text-muted-foreground">
        Pick one of the following methods to create a Date value:
    </p>
    {@render inputOptionLayout({
        title: "Date Picker",
        data: datePicker,
        input: datePickerInput,
        method: "DatePicker",
    })}
    {@render inputOptionLayout({
        title: "Timestamp",
        data: timestamp,
        input: timestampInput,
        method: "Timestamp",
    })}
    {@render inputOptionLayout({
        title: "Current Date",
        data: nowDate,
        method: "CurrentDate",
        onChecked() {
            nowDate = new Date().toISOString();
        },
    })}
</div>

{#snippet datePickerInput()}
    <Input
        type="datetime-local"
        class={selectedMethod == "DatePicker" ? "" : "opacity-70"}
        defaultValue={datePicker}
        oninput={(e) => {
            const date = new Date(e.currentTarget.value);

            if (String(date) == "Invalid Date") {
                datePicker = "";
                if (selectedMethod == "DatePicker") value = "";
                return;
            }
            datePicker = date.toISOString();
            if (selectedMethod == "DatePicker") {
                value = datePicker;
            }
        }}
    />
{/snippet}

{#snippet timestampInput()}
    <Input
        type="number"
        class={selectedMethod == "Timestamp" ? "" : "opacity-70"}
        defaultValue={timestamp}
        min={0}
        oninput={(e) => {
            const date = new Date(Number(e.currentTarget.value));

            if (e.currentTarget.value == "" || String(date) == "Invalid Date") {
                timestamp = "";
                if (selectedMethod == "Timestamp") value = "";
                return;
            }

            timestamp = date.toISOString();
            if (selectedMethod == "Timestamp") {
                value = timestamp;
            }
        }}
        placeholder={`e.g., ${Date.now()}`}
    />
{/snippet}

{#snippet inputOptionLayout(params: InputOptionLayoutParams)}
    <div class="space-y-1">
        <div class="flex gap-2 items-center">
            <Checkbox
                checked={selectedMethod == params.method}
                onCheckedChange={(checked) => {
                    if (checked) {
                        params.onChecked?.();
                        selectedMethod = params.method;
                        value = params.data;
                    } else if (selectedMethod == params.method) {
                        selectedMethod = null;
                        value = currentValue;
                    }
                }}
            />
            <p class="font-medium">{params.title}</p>
        </div>
        {@render params.input?.()}
    </div>
{/snippet}
