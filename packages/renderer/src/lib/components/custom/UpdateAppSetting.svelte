<script lang="ts">
    import {
        updateAppState,
        startCheckingForUpdates,
        startDownloadingUpdate,
        cancelDownloadingUpdate,
        quitAndInstallTheUpdate,
    } from "$lib/states/appUpdate.svelte";
    import { versions } from "@app/preload";
    import Progress from "../shadcn/progress/progress.svelte";
    import Button from "../shadcn/button/button.svelte";
    import DownloadIcon from "@lucide/svelte/icons/download";
    import HardDriveDownload from "@lucide/svelte/icons/hard-drive-download";
    import SearchCheckIcon from "@lucide/svelte/icons/search-check";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import XIcon from "@lucide/svelte/icons/x";
    import CheckFileIcon from "@lucide/svelte/icons/file-check";
    import MonitorDownIcon from "@lucide/svelte/icons/monitor-down";
    import { formatTimeAgo } from "$lib/helpers/formatTimeAgo";

    const KILO_BYTE = 1024;
    const MEGA_BYTE = KILO_BYTE * KILO_BYTE;
</script>

<div class="w-full space-y-2">
    <h3 class="font-semibold text-xl flex gap-2 items-center mb-4">
        <HardDriveDownload />
        App Update
        {#if updateAppState.newUpdate?.isUpdateAvailable}
            <div
                class="!size-2 bg-red-500 rounded-full -ms-1 mt-1 self-start"
            ></div>
        {/if}
    </h3>

    {#if updateAppState.newUpdate}
        <p>
            Current Version:
            <span class="font-semibold">v{versions.appVersion}</span>
            <br />
            New update is available:
            <span class="font-semibold">
                v{updateAppState.newUpdate.updateInfo.version}
            </span>
            (<span>
                {formatTimeAgo(
                    new Date(updateAppState.newUpdate.updateInfo.releaseDate),
                )}
            </span>)
        </p>
        {#if updateAppState.downloadingUpdates}
            {#if updateAppState.downloadUpdateProgress}
                {@render downloadUpdateProgress(
                    updateAppState.downloadUpdateProgress,
                )}
            {:else}
                {@render downloadUpdateProgress({
                    total: 0,
                    bytesPerSecond: 0,
                    transferred: 0,
                    percent: 0,
                    delta: 0,
                })}
            {/if}
            <Button
                variant="destructive"
                size="sm"
                onclick={cancelDownloadingUpdate}
            >
                Cancel Update
                <XIcon />
            </Button>
        {:else if updateAppState.downloadingUpdatesDone}
            <p
                class="dark:text-green-500 text-green-600 flex items-center gap-2"
            >
                <CheckFileIcon class="size-4.5" />
                The update was downloaded
            </p>
            <Button
                variant="default"
                size="sm"
                onclick={quitAndInstallTheUpdate}
            >
                Quit and install the update
                <MonitorDownIcon />
            </Button>
        {:else}
            {#if updateAppState.downloadingUpdatesError}
                <p class="text-destructive">
                    {#if updateAppState.downloadingUpdatesError.includes("net::")}
                        Network connectivity Error
                    {:else}
                        {updateAppState.downloadingUpdatesError}
                    {/if}
                </p>
            {/if}
            <Button
                variant="secondary"
                size="sm"
                onclick={startDownloadingUpdate}
            >
                Download Update
                <DownloadIcon />
            </Button>
        {/if}
    {:else}
        <p>
            Current Version:
            <span class="font-semibold">v{versions.appVersion}</span>
            <br />
            {#if updateAppState.checkingForUpdatesError}
                {#if updateAppState.checkingForUpdatesError}
                    <span class="text-destructive">
                        {#if updateAppState.checkingForUpdatesError.includes("net::")}
                            Network connectivity Error
                        {:else}
                            {updateAppState.checkingForUpdatesError}
                        {/if}
                    </span>
                {/if}
            {:else if updateAppState.checkingForUpdatesDone}
                <span class="text-muted-foreground">
                    No new update available
                </span>
            {/if}
        </p>
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
    {/if}
</div>

{#snippet downloadUpdateProgress(progressInfo: DownloadUpdateProgressInfo)}
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
            <Progress
                value={progressInfo.percent}
                max={100}
                class="w-full flex-1"
            />
            <span>
                {progressInfo.percent.toFixed(1)}%
            </span>
        </div>
    </div>
{/snippet}
