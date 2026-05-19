<script lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ButtonWithTooltip from "$lib/ui/primitives/ButtonWithTooltip.svelte";
  import {
    copyEntryKey,
    copyEntryValue,
    copyEntryVersionStamp,
  } from "../utils/copyKvEntry";

  const {
    entry,
    target,
    className,
  }: {
    entry: KvEntry;
    target: "key" | "Versionstamp" | "Value";
    className?: string;
  } = $props();

  let isCoppied = $state(false);

  function handleCopy() {
    isCoppied = true;
    setTimeout(() => {
      isCoppied = false;
    }, 5000);

    switch (target) {
      case "key":
        copyEntryKey(entry);
        break;

      case "Versionstamp":
        copyEntryVersionStamp(entry);
        break;

      case "Value":
        copyEntryValue(entry);
        break;
    }
  }
</script>

<ButtonWithTooltip
  onclick={handleCopy}
  tooltipContent={isCoppied ? `${target} Coppied` : `Copy ${target}`}
  size="icon"
  variant="ghost"
  {className}
>
  {#if isCoppied}
    <CheckIcon />
  {:else}
    <CopyIcon />
  {/if}
</ButtonWithTooltip>
