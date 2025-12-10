<script lang="ts">
  import * as Dialog from "$lib/components/shadcn/dialog/index.js";
  import { Input } from "$lib/components/shadcn/input/index.js";
  import { Label } from "$lib/components/shadcn/label/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import RenameIcon from "@lucide/svelte/icons/file-type";
  import XIcon from "@lucide/svelte/icons/x";
  import SaveIcon from "@lucide/svelte/icons/save";
  import { toast } from "svelte-sonner";
  import { kvStoresService } from "@app/preload";
  import {
    kvStoresState,
    loadKvStores,
  } from "../../states/kvStoresState.svelte";

  const { kvStore }: { kvStore: KvStore } = $props();

  async function submitHandler(
    e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
  ) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newName = form.get("name");
    if (newName) {
      const res = await kvStoresService.renameDefaultLocalKvStore(
        $state.snapshot(kvStore),
        newName.toString(),
      );

      if (res) {
        toast.success(
          `The "${kvStore.name}" Kv store was renamed successfully`,
        );
        closeEdit();
        loadKvStores();
      } else {
        toast.error("Failed to rename this kv store");
      }
    } else {
      toast.error("Write the new name please");
    }
  }

  function closeEdit() {
    kvStoresState.renameDefaultKvStore = null;
  }
</script>

<Dialog.Root open>
  <Dialog.Content class="max-w-2xl! w-full p-3 gap-0">
    <form class="flex flex-col gap-4 overflow-hidden" onsubmit={submitHandler}>
      <h2 class="text-xl font-bold flex gap-2 items-center">
        <RenameIcon />
        Rename Default KV Store
      </h2>
      <div class="space-y-1.5">
        <Label for="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={kvStore.name}
          placeholder="New Name"
        />
        <p class="text-muted-foreground text-sm">
          Enter a new name for this Kv Store
        </p>
      </div>
      <div class="ms-auto flex gap-2">
        <Button
          variant="outline"
          class="w-fit"
          size="sm"
          type="button"
          onclick={closeEdit}
        >
          Cancel
          <XIcon />
        </Button>
        <Button class="w-fit" size="sm" type="submit">
          Save
          <SaveIcon />
        </Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
