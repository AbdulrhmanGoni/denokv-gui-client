<script lang="ts">
    import type { Component } from "svelte";

    const { option, isSelected, onclick } = $props<{
        option: { label: string; icon: Component<any>; color: string };
        isSelected: boolean;
        onclick: () => void;
    }>();

    const colorMap: Record<string, { border: string; icon: string }> = {
        secondary: {
            border: "border-secondary/35",
            icon: "text-secondary",
        },
        "secondary-1": {
            border: "border-secondary-1/35",
            icon: "text-secondary-1",
        },
        "secondary-2": {
            border: "border-secondary-2/35",
            icon: "text-secondary-2",
        },
        "secondary-3": {
            border: "border-secondary-3/35",
            icon: "text-secondary-3",
        },
    };

    const borderColor = $derived(colorMap[option.color]?.border);
    const iconColor = $derived(colorMap[option.color]?.icon);
</script>

<button
    {onclick}
    class="flex items-center gap-1.5 px-2 py-1 rounded-md border text-sm font-medium transition-all hover:bg-accent/50 {isSelected
        ? `bg-accent ${borderColor} shadow-sm text-foreground`
        : 'bg-background border-input text-muted-foreground'}"
>
    <option.icon class="size-4 {iconColor}" />
    {option.label}
</button>
