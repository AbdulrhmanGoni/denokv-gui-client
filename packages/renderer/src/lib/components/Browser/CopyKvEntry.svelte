<script lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ButtonWithTooltip from "$lib/components/custom/ButtonWithTooltip.svelte";

  const { entry, isKey }: { entry: KvEntry; isKey?: boolean } = $props();

  let keyCoppied = $state(false);
  let valueCoppied = $state(false);

  function copyKey() {
    keyCoppied = true;
    setTimeout(() => {
      keyCoppied = false;
    }, 5000);

    navigator.clipboard.writeText(JSON.stringify(entry.key));
  }

  function copyValue() {
    valueCoppied = true;
    setTimeout(() => {
      valueCoppied = false;
    }, 5000);

    navigator.clipboard.writeText(JSON.stringify(entry.value));
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
