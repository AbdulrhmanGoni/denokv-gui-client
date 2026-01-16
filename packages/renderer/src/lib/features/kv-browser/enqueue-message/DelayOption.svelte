<script lang="ts">
    import * as InputGroup from "$lib/ui/shadcn/input-group/index";

    let { value = $bindable() }: { value: number } = $props();
</script>

<InputGroup.Root class="max-w-52">
    <InputGroup.Addon>
        <InputGroup.Text class="me-1 text-foreground font-semibold">
            Delay?:
        </InputGroup.Text>
    </InputGroup.Addon>
    <InputGroup.Input type="number" bind:value class="ps-0.5!" />
    <InputGroup.Addon align="inline-end">
        <InputGroup.Text>ms</InputGroup.Text>
    </InputGroup.Addon>
</InputGroup.Root>
