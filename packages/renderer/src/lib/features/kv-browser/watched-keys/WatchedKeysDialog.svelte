<script lang="ts">
  import {
    unwatchKvEntries,
    watchedKvEntriesState,
  } from "$lib/states/watchedKvEntriesState.svelte";
  import Button, { buttonVariants } from "$lib/ui/shadcn/button/button.svelte";
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import PLink from "$lib/ui/primitives/PLink.svelte";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import WatchedKeyEntryCard from "./WatchedKeyEntryCard.svelte";
  import { isSameKvKey } from "@app/bridge-server/kv-utils";
</script>

<Dialog.Root bind:open={watchedKvEntriesState.openDialog}>
  <Dialog.Trigger class={buttonVariants({ variant: "outline", size: "sm" })}>
    <EyeIcon class="size-4" />
    Watched Keys ({watchedKvEntriesState.keys.length})
  </Dialog.Trigger>
  <Dialog.Content class="max-w-3xl w-full p-3 gap-0 overflow-hidden">
    <Dialog.Title class="flex gap-2 items-center text-2xl mb-1">
      <EyeIcon class="size-7" />
      Watched Keys
    </Dialog.Title>
    <p class="text-muted-foreground">
      All your watched keys in
      <strong class="font-bold">
        "{kvStoresState.openedStore?.name}"
      </strong>
      Store will be listed here.<br /> See the
      <PLink href="https://docs.deno.com/deploy/kv/operations/#watch">
        offecial documentation
      </PLink>
      of the <strong>watch</strong> operation for more information.
    </p>
    <Separator class="my-2" />
    {#if watchedKvEntriesState.keysEntries.length}
      <div class="flex flex-col gap-2 max-h-[360px] overflow-auto pr-1">
        {#each watchedKvEntriesState.keysEntries as entry (entry.key)}
          <WatchedKeyEntryCard {entry} />
        {/each}
      </div>
    {:else}
      <div
        class="flex flex-col gap-2 items-center justify-center flex-1 max-w-96 mx-auto text-center py-4"
      >
        <EyeOffIcon class="size-10" />
        <p class="font-semibold text-xl">No Watched Keys</p>
        <p class="text-muted-foreground text-sm">
          You haven't watched any keys in this KV store yet.
        </p>
      </div>
    {/if}
    <Separator class="my-2" />
    <div class="flex items-center gap-2 h-7">
      {#if watchedKvEntriesState.keysEntries.length}
        <p class="text-sm">
          {watchedKvEntriesState.selectedKeys.length} keys selected
        </p>
      {/if}
      {#if watchedKvEntriesState.selectedKeys.length}
        <Button
          size="sm"
          variant="outline"
          class="h-fit py-0.5 px-1.5! text-destructive {watchedKvEntriesState
            .selectedKeys.length
            ? ''
            : 'invisible'}"
          disabled={!watchedKvEntriesState.selectedKeys.length}
          onclick={() =>
            unwatchKvEntries(
              watchedKvEntriesState.keysEntries.filter((entry) =>
                watchedKvEntriesState.selectedKeys.some((key) =>
                  isSameKvKey(entry.key, key),
                ),
              ),
            )}
        >
          <EyeOffIcon class="size-4 shrink-0" />
          Unwatch ({watchedKvEntriesState.selectedKeys.length})
        </Button>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
