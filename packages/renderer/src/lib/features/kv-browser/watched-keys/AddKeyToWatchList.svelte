<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import KvKeyEditor from "$lib/features/kv-browser/entry-editor/KvKeyEditor.svelte";
  import Button, { buttonVariants } from "$lib/ui/shadcn/button/button.svelte";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { watchKvEntries } from "$lib/states/watchedKvEntriesState.svelte";
  import { isValidKvKey } from "@app/bridge-server/kv-utils";
  import { bridgeServer } from "@app/preload";
  import { toast } from "svelte-sonner";

  let kvKeyCodeEditor: KvKeyCodeEditor | undefined = $state();
  let openDialog = $state(false);

  async function watchKey() {
    let key;
    try {
      key = (0, eval)(`(${kvKeyCodeEditor?.toString()})`);
    } catch (err) {
      toast.error("Failed to parse the key", {
        description: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    const isArray = Array.isArray(key);

    if (isArray && isValidKvKey(key)) {
      await watchKvEntries([
        {
          key: bridgeServer.utils.serializeKvKey(key as any),
          value: { type: "Null", data: "null" },
          versionstamp: null,
        },
      ]);
      openDialog = false;
    } else {
      toast.error(
        isArray && !key.length
          ? "A valid Deno KV Key cannot be an empty array."
          : "Invalid Deno KV Key",
      );
    }
  }
</script>

<Dialog.Root bind:open={openDialog}>
  <Dialog.Trigger class={buttonVariants({ size: "sm", class: "ms-auto" })}>
    Add Key
    <PlusIcon class="size-4 shrink-0" />
  </Dialog.Trigger>
  <Dialog.Content class="max-w-3xl w-full p-3 gap-0">
    <h1 class="flex items-center gap-2 text-2xl font-bold">
      <EyeIcon class="size-7" />
      Add a Key to the Watch List
    </h1>
    <p class="py-1.5 text-muted-foreground">
      Enter a specific Deno KV Key to add it to the watch list and receive
      updates when it changes.
    </p>
    <Separator class="my-3" />
    <KvKeyEditor bind:jar={kvKeyCodeEditor} />
    <Separator class="my-3" />
    <div class="flex flex-row-reverse gap-2">
      <Button variant="secondary" size="sm" onclick={watchKey}>
        Add to Watch List
        <PlusIcon class="rotate-90" />
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
