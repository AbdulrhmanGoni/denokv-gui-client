<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ButtonVariant, ButtonSize } from "../shadcn/button/index.js";
  import * as Tooltip from "../shadcn/tooltip/index.js";
  import { buttonVariants } from "../shadcn/button/button.svelte";
  import type { TooltipTriggerProps } from "bits-ui";

  type Props = {
    children: Snippet;
    tooltipContent: Snippet | string;
    className?: string;
    tooltipContentClasses?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
  } & Omit<TooltipTriggerProps, "class">;

  const {
    children,
    variant,
    className,
    tooltipContent,
    tooltipContentClasses,
    size,
    ...restProps
  }: Props = $props();
</script>

<Tooltip.Provider delayDuration={0}>
  <Tooltip.Root>
    <Tooltip.Trigger
      {...restProps}
      class={buttonVariants({ variant, className, size })}
    >
      {@render children()}
    </Tooltip.Trigger>
    <Tooltip.Content class={tooltipContentClasses}>
      {#if typeof tooltipContent === "string"}
        {tooltipContent}
      {:else}
        {@render tooltipContent()}
      {/if}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
