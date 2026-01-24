<script lang="ts">
    import { cn } from "$lib/shadcn-utils";
    import type { Snippet } from "svelte";

    let {
        href,
        children,
        className,
    }: { href: string; children: Snippet; className?: string } = $props();
</script>

<a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class={cn("dark:text-blue-500 text-blue-600 hover:underline", className)}
>
    {@render children()}
</a>
