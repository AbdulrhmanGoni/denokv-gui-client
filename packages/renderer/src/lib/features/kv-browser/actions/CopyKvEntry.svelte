<script lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ButtonWithTooltip from "$lib/ui/primitives/ButtonWithTooltip.svelte";
  import { copyEntryKey, copyEntryValue } from "../utils/copyKvEntry";

  const { entry, isKey }: { entry: KvEntry; isKey?: boolean } = $props();

  let keyCoppied = $state(false);
  let valueCoppied = $state(false);

  function copyKey() {
    keyCoppied = true;
    setTimeout(() => {
      keyCoppied = false;
    }, 5000);

    copyEntryKey(entry);
  }

  function copyValue() {
    valueCoppied = true;
    setTimeout(() => {
      valueCoppied = false;
    }, 5000);

    copyEntryValue(entry);
  }
</script>

<ButtonWithTooltip
  onclick={isKey ? copyKey : copyValue}
  tooltipContent={(isKey ? keyCoppied : valueCoppied)
    ? `${isKey ? "Key" : "Value"} Coppied`
    : `Copy ${isKey ? "Key" : "Value"} `}
  size="icon"
  variant="ghost"
  className={isKey ? "ml-auto" : ""}
>
  {#if isKey ? keyCoppied : valueCoppied}
    <CheckIcon />
  {:else}
    <CopyIcon />
  {/if}
</ButtonWithTooltip>
