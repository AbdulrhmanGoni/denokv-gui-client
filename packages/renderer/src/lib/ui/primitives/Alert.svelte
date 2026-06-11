<script lang="ts">
  import type { Component } from "svelte";
  import { cn } from "$lib/shadcn-utils";

  const variants = {
    default: "text-secondary border-secondary/50",
    warning: "text-yellow-600 border-yellow-600/50",
    secondary: "text-secondary border-secondary/50",
  };

  type AlertProps = {
    title: string;
    className?: string;
    iconClassName?: string;
    Icon: Component;
    variant: keyof typeof variants;
  };

  const {
    className,
    title,
    Icon,
    variant = "default",
    iconClassName,
  }: AlertProps = $props();
</script>

<div
  class={cn(
    "flex gap-1.5 items-center border rounded-md bg-transparent px-2.5 py-2 text-sm font-medium ",
    variants[variant],
    className,
  )}
>
  <Icon class={cn("size-4 shrink-0", iconClassName)} />
  <p>{title}</p>
</div>
