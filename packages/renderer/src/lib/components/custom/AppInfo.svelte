<script lang="ts">
  import * as Tooltip from "$lib/components/shadcn/tooltip/index.js";
  import { openExternalLink } from "@app/preload";
  import Separator from "../shadcn/separator/separator.svelte";
  import { versions } from "@app/preload";
  import AppLogo from "./AppLogo.svelte";
</script>

<Tooltip.Provider delayDuration={0}>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <AppLogo />
    </Tooltip.Trigger>
    <Tooltip.Content
      side="left"
      align="center"
      arrowClasses="hidden"
      class="bg-transparent"
    >
      <div class="flex gap-2 items-center h-8">
        <button
          class="cursor-pointer"
          onclick={() => {
            openExternalLink(versions.appGithubRepo);
          }}
        >
          <img
            class="size-6 dark:size-0"
            src="GitHub_Invertocat_Dark.svg"
            alt="Logo"
          />
          <img
            class="size-0 dark:size-6"
            src="GitHub_Invertocat_Light.svg"
            alt="Logo"
          />
        </button>
        <Separator orientation="vertical" />
        <p class="font-bold text-lg text-foreground">{versions.appVersion}v</p>
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
