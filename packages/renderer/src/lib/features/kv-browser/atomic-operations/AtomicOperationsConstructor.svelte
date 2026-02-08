<script lang="ts">
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import AtomIcon from "@lucide/svelte/icons/atom";
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import AddAtomicOperationActions from "./AddAtomicOperationActions.svelte";
  import AtomicOperationCard from "./AtomicOperationCard.svelte";
  import ListXIcon from "@lucide/svelte/icons/list-x";
  import {
    operations,
    operationsOrder,
    resetOperations,
  } from "./atomicOperationsState.svelte";
  import PLink from "$lib/ui/primitives/PLink.svelte";
  import { cn } from "$lib/shadcn-utils";
  import { buttonVariants } from "$lib/ui/shadcn/button";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import CheckIcon from "@lucide/svelte/icons/check-check";
  import XIcon from "@lucide/svelte/icons/x";
  import RotateCWIcon from "@lucide/svelte/icons/rotate-cw";
  import type { AtomicOperationInput } from "@app/bridge-server";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";

  function getAtomicOperationsInOrder() {
    let orderedOperations: AtomicOperationInput[] = new Array(
      $operations.length,
    );
    $operations.map((op) => {
      orderedOperations[$operationsOrder.indexOf(op.id)] = op.operation;
    });
    return orderedOperations;
  }

  async function commitAtomicOperations() {
    if (!$operations.length) {
      toast.warning(
        "You need to at least add one operation to be able to commit",
      );
      return;
    }

    const orderedOperations = getAtomicOperationsInOrder();
    const response = await kvClient.atomic(orderedOperations);
    if (response.result) {
      toast.success("The Atomic operations committed successfully");
      resetOperations();
    } else {
      toast.error("Failed to commit the Atomic operations", {
        description: response.error
          ? response.error
          : "The cause might be a failed 'check' operation",
      });
    }
  }

  let openAtomicOperationsFormState = $state(false);
  const getOpenAtomicOperationsFormState = () => openAtomicOperationsFormState;
  const setOpenAtomicOperationsFormState = (state: boolean) => {
    openAtomicOperationsFormState = state;
  };
  function closeAtomicOperationsForm() {
    setOpenAtomicOperationsFormState(false);
  }
</script>

<Dialog.Root
  bind:open={getOpenAtomicOperationsFormState, setOpenAtomicOperationsFormState}
>
  <Dialog.Trigger
    class={cn(buttonVariants({ size: "sm", variant: "secondary2" }))}
  >
    Atomic
    <AtomIcon class="size-4.5" />
  </Dialog.Trigger>
  <Dialog.Content
    class="max-h-[600px] h-full max-w-5xl w-full bg-transparent border-0 py-0 px-2 shadow-none!"
    showCloseButton={false}
  >
    <div
      class="flex flex-col gap-3 p-3 bg-background rounded-lg border shadow-lg"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-bold flex gap-2 items-center">
          <AtomIcon class="size-7" />
          Atomic Operations
        </h1>
        <p class="text-muted-foreground">
          See the
          <PLink href="https://docs.deno.com/deploy/kv/#atomic-transactions">
            offecial documentation
          </PLink>
          of <strong>Deno Kv Atomic Operations</strong> for more information
        </p>
      </div>
      <Separator />
      <AddAtomicOperationActions />
      <Separator />
      {#if $operations.length > 0}
        <div
          id="AtomicOperationList"
          class="flex flex-col max-h-[450px] overflow-y-auto pr-1 flex-1 relative"
        >
          {#each $operations as operationItem}
            <AtomicOperationCard {operationItem} />
          {/each}
        </div>
      {:else}
        <div
          class="flex flex-col gap-3 items-center justify-center flex-1 max-w-96 mx-auto text-center"
        >
          <ListXIcon class="size-10" />
          <p class="font-semibold text-xl">No Atomic Operations</p>
          <p class="text-muted-foreground text-sm">
            You haven't added any atomic operations yet. <br />
            Click on one of the operation buttons to get started
          </p>
        </div>
      {/if}
      <Separator />
      <div class="flex gap-2 flex-row-reverse">
        <Button
          size="sm"
          variant="secondary2"
          onclick={commitAtomicOperations}
          disabled={!$operations.length}
          class="gap-1 {$operations.length
            ? ''
            : 'cursor-not-allowed disabled:pointer-events-auto'}"
        >
          Commit
          <CheckIcon class="size-4.5" />
        </Button>
        <Button
          size="sm"
          variant="default"
          onclick={resetOperations}
          disabled={!$operations.length}
          class="gap-1 {$operations.length
            ? ''
            : 'cursor-not-allowed disabled:pointer-events-auto'}"
        >
          Reset
          <RotateCWIcon class="size-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          class="gap-1"
          onclick={closeAtomicOperationsForm}
        >
          Close
          <XIcon class="size-4.5" />
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
