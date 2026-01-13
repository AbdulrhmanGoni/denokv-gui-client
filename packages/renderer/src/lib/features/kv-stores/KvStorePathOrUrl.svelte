<script lang="ts">
    import LinkIcon from "@lucide/svelte/icons/link";
    import FileLinkIcon from "@lucide/svelte/icons/file-symlink";
    import { openPath } from "@app/preload";

    const { kvStore }: { kvStore: KvStore } = $props();
    const isLocal = $derived(
        kvStore.type == "local" || kvStore.type == "default",
    );
</script>

<p class="flex items-center gap-2 text-sm overflow-x-hidden">
    {#if isLocal}
        <FileLinkIcon class="shrink-0 size-4" />
        Path:
    {:else}
        <LinkIcon class="shrink-0 size-4" />
        Url:
    {/if}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
        onclick={() => {
            if (isLocal) {
                openPath(kvStore.url);
            }
        }}
        class="line-clamp-1 {isLocal ? 'hover:underline cursor-pointer' : ''}"
        ondblclick={(e) => e.stopPropagation()}
    >
        {kvStore.url}
    </span>
</p>
