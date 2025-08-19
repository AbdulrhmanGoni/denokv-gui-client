<script lang="ts">
  import SunIcon from "@lucide/svelte/icons/sun";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/shadcn/button/index.js";
</script>

<Button
  onclick={toggleMode}
  variant="outline"
  size="icon"
  class="p-1.5 size-10"
>
  <SunIcon
    class="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
  />
  <MoonIcon
    class="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
  />
</Button>
