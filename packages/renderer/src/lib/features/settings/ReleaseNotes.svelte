<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import NotesIcon from "@lucide/svelte/icons/notepad-text";
  import { updateAppState } from "$lib/states/appUpdate.svelte";
  import { metadata } from "@app/preload";

  let openReleaseNotesDialog = $derived(
    !!updateAppState.releaseNotes && updateAppState.releaseNotes.length > 0,
  );
</script>

<Dialog.Root
  open={openReleaseNotesDialog}
  onOpenChange={(open) => {
    if (!open) {
      updateAppState.releaseNotes = null;
    }
  }}
>
  <Dialog.Content class="max-w-3xl! w-full py-1.5 px-3 gap-0">
    <h1 class="flex items-center gap-2 text-2xl font-bold">
      <NotesIcon class="size-6" />
      Release Notes
    </h1>
    <p class="text-muted-foreground">See the changes you will get with this update</p>
    <Separator class="my-2" />
    <div id="release-notes" class="max-h-125 overflow-auto">
      <div>
        {#each updateAppState.releaseNotes as release, i}
          <div>
            {@render ReleaseNotes(
              release.version,
              release.note,
              release.version == metadata.appVersion ? "current" : i == 0 ? "latest" : "",
            )}
          </div>
          {#if i < updateAppState.releaseNotes!.length - 1}
            <Separator class="my-3" />
          {/if}
        {/each}
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

{#snippet ReleaseNotes(version: string, notes: string | null, badge: string)}
  <h2 class="flex gap-1.5 items-center text-2xl mb-2 font-extrabold">
    v{version}
    {#if badge}
      <span class="text-base text-blue-600 dark:text-blue-500 font-bold">({badge})</span>
    {/if}
  </h2>
  {@html notes?.replaceAll("<a href=", '<a target="_blank" href=')}
{/snippet}

<style>
  #release-notes :global {
    h3 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 5px 0;
    }

    ul {
      list-style-type: disc;
      margin: 0 0 16px 28px;
    }

    li {
      margin-bottom: 4px;
    }

    a {
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    a:hover {
      opacity: 0.8;
    }

    code {
      background-color: var(--muted);
      border-radius: calc(var(--radius) - 4px);
      padding-block: calc(var(--spacing) * 0.5);
      padding-inline: var(--spacing);
    }
  }
</style>
