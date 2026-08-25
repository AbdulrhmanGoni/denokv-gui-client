<script lang="ts">
  import {
    updateAppState,
    startCheckingForUpdates,
    startDownloadingUpdate,
    cancelDownloadingUpdate,
    quitAndInstallTheUpdate,
    openNewUpdateReleaseNotes,
    openCurrentVersionReleaseNotes,
  } from "$lib/states/appUpdate.svelte";
  import { setAutoCheckForUpdate, settingsState } from "$lib/states/settingsState.svelte";
  import { metadata } from "@app/preload";
  import Progress from "$lib/ui/shadcn/progress/progress.svelte";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import DownloadIcon from "@lucide/svelte/icons/download";
  import HardDriveDownload from "@lucide/svelte/icons/hard-drive-download";
  import SearchCheckIcon from "@lucide/svelte/icons/search-check";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import XIcon from "@lucide/svelte/icons/x";
  import CheckFileIcon from "@lucide/svelte/icons/file-check";
  import MonitorDownIcon from "@lucide/svelte/icons/monitor-down";
  import NotesIcon from "@lucide/svelte/icons/notepad-text";
  import { Label } from "$lib/ui/shadcn/label/index";
  import { Checkbox } from "$lib/ui/shadcn/checkbox/index";
  import { formatTimeAgo } from "$lib/helpers/formatTimeAgo";
  import ReleaseNotes from "./ReleaseNotes.svelte";
  import type { Snippet } from "svelte";
  import type { ProgressInfo } from "@app/main";

  const KILO_BYTE = 1024;
  const MEGA_BYTE = KILO_BYTE * KILO_BYTE;

  let errorMessage = $derived(
    updateAppState.downloadingUpdatesError ||
      updateAppState.checkingForUpdatesError ||
      "",
  );
</script>

<div class="w-full flex flex-col gap-2">
  <h3 class="font-semibold text-xl flex gap-2 items-center mb-2">
    <HardDriveDownload />
    App Update
    {#if updateAppState.newUpdate?.isUpdateAvailable}
      <div class="size-2! bg-red-500 rounded-full -ms-1 mt-1 self-start"></div>
    {/if}
  </h3>
  <div class="flex items-center bg-card rounded-md border">
    <div class="px-2 py-1 flex gap-1 items-center">
      <p>Current Version:</p>
      <span class="font-semibold">v{metadata.appVersion}</span>
    </div>
    <Button
      class="cursor-pointer flex ms-auto items-center gap-1 rounded-s-none"
      onclick={openCurrentVersionReleaseNotes}
      variant="default"
      size="sm"
    >
      <NotesIcon class="size-4 inline-block" />
      Notes
    </Button>
  </div>

  {#if errorMessage}
    <p class="text-destructive">
      {#if errorMessage.includes("net::")}
        Network connectivity Error
      {:else if errorMessage.includes("cancelled")}
        {""}
      {:else}
        {errorMessage}
      {/if}
    </p>
  {:else if updateAppState.newUpdate?.isUpdateAvailable}
    <p>
      New version is available:
      <span class="font-semibold">
        v{updateAppState.newUpdate.updateInfo.version}
      </span>
      (<span>
        {formatTimeAgo(new Date(updateAppState.newUpdate.updateInfo.releaseDate))}
      </span>)
    </p>
  {:else if updateAppState.checkingForUpdatesDone}
    <p class="text-muted-foreground italic">No new version is available</p>
  {/if}

  {#if updateAppState.newUpdate?.isUpdateAvailable}
    {#if updateAppState.downloadingUpdates}
      {@render downloadUpdateProgress(updateAppState.downloadUpdateProgress)}
      {@render actionsButtons(cancelUpdateButton)}
    {:else if updateAppState.downloadingUpdatesDone}
      <p class="dark:text-green-500 text-green-600 flex items-center gap-2">
        <CheckFileIcon class="size-4.5" />
        The update was downloaded
      </p>
      {@render actionsButtons(quitAndInstallButton)}
    {:else}
      {@render actionsButtons(downloadButton)}
    {/if}
  {:else}
    {@render actionsButtons(checkForUpdateButton)}
  {/if}

  <div class="flex items-center gap-2">
    <Checkbox
      id="auto-check-for-updates"
      checked={!!settingsState.autoCheckForUpdate}
      onCheckedChange={setAutoCheckForUpdate}
      class="cursor-pointer"
    />
    <Label for="auto-check-for-updates" class="cursor-pointer">
      Always check for new updates automatically
    </Label>
  </div>
</div>

<ReleaseNotes />

{#snippet actionsButtons(anotherButton: () => ReturnType<Snippet>)}
  <div class="flex gap-2.5 flex-wrap">
    {@render anotherButton()}
    {#if updateAppState.newUpdate?.isUpdateAvailable}
      <Button variant="outline" size="sm" onclick={openNewUpdateReleaseNotes}>
        See Release Notes
        <NotesIcon class="size-4" />
      </Button>
    {/if}
  </div>
{/snippet}

{#snippet downloadButton()}
  <Button variant="secondary" size="sm" onclick={startDownloadingUpdate}>
    Download Update
    <DownloadIcon />
  </Button>
{/snippet}

{#snippet checkForUpdateButton()}
  <Button
    variant="secondary2"
    size="sm"
    onclick={startCheckingForUpdates}
    disabled={updateAppState.checkingForUpdates}
  >
    {#if updateAppState.checkingForUpdates}
      Checking for update
      <LoaderIcon class="animate-spin" />
    {:else}
      Check for update
      <SearchCheckIcon />
    {/if}
  </Button>
{/snippet}

{#snippet cancelUpdateButton()}
  <Button variant="destructive" size="sm" onclick={cancelDownloadingUpdate}>
    Cancel Update
    <XIcon />
  </Button>
{/snippet}

{#snippet quitAndInstallButton()}
  <Button variant="default" size="sm" onclick={quitAndInstallTheUpdate}>
    Quit and install the update
    <MonitorDownIcon />
  </Button>
{/snippet}

{#snippet downloadUpdateProgress(downloadProgress: ProgressInfo | null)}
  {@const progressInfo: ProgressInfo = downloadProgress ?? {
    total: 0,
    bytesPerSecond: 0,
    transferred: 0,
    percent: 0,
    delta: 0,
  }}
  <div>
    <div class="flex justify-between gap-2">
      <p>
        Downloading...
        {#if progressInfo.total}
          ({(progressInfo.total / MEGA_BYTE).toFixed(1)}MB)
        {/if}
      </p>
      <p class="ms-auto w-fit">
        {#if progressInfo.bytesPerSecond >= MEGA_BYTE}
          {(progressInfo.bytesPerSecond / MEGA_BYTE).toFixed(1)} MB/s
        {:else if progressInfo.bytesPerSecond >= KILO_BYTE}
          {(progressInfo.bytesPerSecond / KILO_BYTE).toFixed(1)} KB/s
        {:else}
          {progressInfo.bytesPerSecond} B/s
        {/if}
      </p>
    </div>
    <div class="flex gap-1 items-center">
      <Progress value={progressInfo.percent} max={100} class="w-full flex-1" />
      <span>
        {progressInfo.percent.toFixed(1)}%
      </span>
    </div>
  </div>
{/snippet}
