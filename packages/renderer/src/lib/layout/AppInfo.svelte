<script lang="ts">
  import * as Tooltip from "$lib/ui/shadcn/tooltip/index.js";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import { versions } from "@app/preload";
  import AppLogo from "$lib/ui/primitives/AppLogo.svelte";
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
        <a
          class="cursor-pointer"
          href={versions.appGithubRepo}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            class="size-5 dark:size-0"
            src="GitHub_Invertocat_Dark.svg"
            alt="Logo"
          />
          <img
            class="size-0 dark:size-5"
            src="GitHub_Invertocat_Light.svg"
            alt="Logo"
          />
        </a>
        <Separator orientation="vertical" />
        <p class="font-bold text-lg text-foreground">v{versions.appVersion}</p>
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
