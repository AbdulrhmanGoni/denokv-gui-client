<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import KeyboardIcon from "@lucide/svelte/icons/keyboard";
  import { shortcutsRegistry } from "$lib/states/shortcutsState.svelte";
  import { shortcutsHelpState } from "$lib/states/shortcutsHelpState.svelte";
</script>

<Dialog.Root bind:open={shortcutsHelpState.open}>
  <Dialog.Content class="max-w-lg w-full p-3 gap-0">
    <Dialog.Title class="flex gap-2 items-center text-2xl mb-1">
      <KeyboardIcon class="size-7" />
      Keyboard Shortcuts
    </Dialog.Title>
    <Dialog.Description class="text-base">
      Shortcuts available on the current page.
    </Dialog.Description>
    <Separator class="my-2" />
    <div class="flex flex-col gap-3 max-h-105 overflow-auto pr-1">
      {#each shortcutsRegistry.scopes as [id, scope] (id)}
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold text-muted-foreground">{scope.label}</p>
          <div
            class="flex flex-col divide-y divide-border rounded-md border border-border"
          >
            {#each scope.shortcuts as shortcut (shortcut.combo)}
              <div class="flex items-center justify-between gap-4 px-2.5 py-1.5">
                <span class="text-sm">{shortcut.description}</span>
                <kbd
                  class="text-xs tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-muted/50 whitespace-nowrap"
                >
                  {shortcut.combo}
                </kbd>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
