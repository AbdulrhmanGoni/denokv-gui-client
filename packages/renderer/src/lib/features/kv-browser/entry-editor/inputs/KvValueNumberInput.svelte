<script lang="ts">
    import * as InputGroup from "$lib/ui/shadcn/input-group/index.js";

    type ValueEditorProps = {
        value: number | string;
        type: "BigInt" | "KvU64";
    };

    let { value = $bindable(), type }: ValueEditorProps = $props();
</script>

<InputGroup.Root>
    <InputGroup.Input
        bind:value
        type="number"
        placeholder="0"
        onchange={(e) => {
            value =
                e.currentTarget.value != ""
                    ? Number(e.currentTarget.value)
                    : "";
        }}
    />
    <InputGroup.Addon class="pl-1">
        <span
            class="dark:bg-green-500/25 bg-green-500/35 p-1 rounded-sm text-foreground"
        >
            {type}
        </span>
    </InputGroup.Addon>
</InputGroup.Root>
