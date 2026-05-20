import { Tooltip as TooltipPrimitive } from "bits-ui";
import { type Tooltip as $$Tooltip } from "bits-ui";
import type { Component } from "svelte";
import Trigger from "./tooltip-trigger.svelte";
import Content from "./tooltip-content.svelte";

const Root: Component<$$Tooltip.RootProps, {}, "open" | "triggerId"> =
	TooltipPrimitive.Root;
const Provider: Component<$$Tooltip.ProviderProps> = TooltipPrimitive.Provider;
const Portal: Component<$$Tooltip.PortalProps> = TooltipPrimitive.Portal;

export {
	Root,
	Trigger,
	Content,
	Provider,
	Portal,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal,
};
