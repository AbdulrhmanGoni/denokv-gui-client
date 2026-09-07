<script lang="ts">
  import PLink from "$lib/ui/primitives/PLink.svelte";
  import NumberAtomicOperation from "./NumberAtomicOperation.svelte";
  import ArrowUp0_1Icon from "@lucide/svelte/icons/arrow-up-0-1";
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";

  let { close }: { close?: () => void } = $props();
</script>

<NumberAtomicOperation operationName="max" Icon={ArrowUp0_1Icon} {close} {description} />

{#snippet description()}
  <Dialog.Description class="text-base">
    Sets the value of the key to the maximum of its current value and a given value. If
    the key does not exist, it is created with the given value. For more information, see
    the
    <PLink href="https://docs.deno.com/deploy/kv/operations/#max"
      >official documentation</PLink
    >
  </Dialog.Description>
{/snippet}
