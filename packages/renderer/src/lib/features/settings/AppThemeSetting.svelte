<script lang="ts">
  import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import MonitorCogIcon from "@lucide/svelte/icons/monitor-cog";
  import { setMode, userPrefersMode, type UserPrefersMode } from "mode-watcher";
  import * as Tabs from "$lib/ui/shadcn/tabs/index.js";
  import PaletteIcon from "@lucide/svelte/icons/palette";

  function onThemeChange(mode: UserPrefersMode["current"]) {
    return () => setMode(mode);
  }
</script>

<div class="space-y-4">
  <h3 class="font-semibold text-xl flex gap-2 items-center">
    <PaletteIcon />
    Theme
  </h3>
  <div class="flex max-w-100 w-full flex-col gap-6">
    <Tabs.Root value={userPrefersMode.current}>
      <Tabs.List class="w-full">
        <Tabs.Trigger onclick={onThemeChange("dark")} value="dark">
          <MoonIcon class="size-4.5" />
          Dark
        </Tabs.Trigger>
        <Tabs.Trigger onclick={onThemeChange("light")} value="light">
          <SunIcon class="size-4.5" />
          Light
        </Tabs.Trigger>
        <Tabs.Trigger onclick={onThemeChange("system")} value="system">
          <MonitorCogIcon class="size-4.5" />
          System
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  </div>
</div>
