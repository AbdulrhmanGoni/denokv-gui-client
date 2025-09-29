<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import CheckIcon from "@lucide/svelte/icons/check";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	type CheckboxVariant =
		| "primary"
		| "secondary"
		| "secondary-1"
		| "secondary-2"
		| "secondary-3";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		variant = "primary",
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> & {
		variant?: CheckboxVariant;
	} = $props();

	const variants = {
		primary:
			"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary",
		secondary:
			"data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground dark:data-[state=checked]:bg-secondary data-[state=checked]:border-secondary",
		"secondary-1":
			"data-[state=checked]:bg-secondary-1 data-[state=checked]:text-secondary-1-foreground dark:data-[state=checked]:bg-secondary-1 data-[state=checked]:border-secondary-1",
		"secondary-2":
			"data-[state=checked]:bg-secondary-2 data-[state=checked]:text-secondary-2-foreground dark:data-[state=checked]:bg-secondary-2 data-[state=checked]:border-secondary-2",
		"secondary-3":
			"data-[state=checked]:bg-secondary-3 data-[state=checked]:text-secondary-3-foreground dark:data-[state=checked]:bg-secondary-3 data-[state=checked]:border-secondary-3",
	};
</script>

<CheckboxPrimitive.Root
	bind:ref
	data-slot="checkbox"
	class={cn(
		"border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
		className,
		variants[variant],
	)}
	bind:checked
	bind:indeterminate
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<div
			data-slot="checkbox-indicator"
			class="text-current transition-none"
		>
			{#if checked}
				<CheckIcon class="size-3.5" />
			{:else if indeterminate}
				<MinusIcon class="size-3.5" />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
