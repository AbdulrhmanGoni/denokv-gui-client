<script lang="ts">
  import {
    settingsPageState,
    setHardwareAccelerationMode,
    settingsState,
  } from "$lib/states/settingsState.svelte";
  import { Switch } from "$lib/ui/shadcn/switch/index";
  import GPUIcon from "@lucide/svelte/icons/gpu";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import OctagonAlert from "@lucide/svelte/icons/octagon-alert";
  import Alert from "$lib/ui/primitives/Alert.svelte";
  import { restartApp } from "@app/preload";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";

  let hardwareAccelerationEnabled = $derived(
    !settingsState.disableHardwareAcceleration,
  );
  let hardwareAccelerationModeChanged = $derived(
    hardwareAccelerationEnabled ===
      settingsPageState.isHardwareAccelerationCurrentlyDisabled,
  );
</script>

<div class="space-y-2">
  <h3 class="font-semibold text-xl flex gap-2 items-center">
    <GPUIcon />
    Hardware Acceleration
  </h3>
  <p class="text-muted-foreground text-sm">
    When enabled, the app will use your computer's graphics hardware (if
    available) to improve visual performance for smoother experience
  </p>
  <div class="flex items-center gap-1.5 bg-card p-2 rounded-md">
    <Switch
      class="data-[state=checked]:bg-secondary-3!"
      thumbClassName="bg-white!"
      checked={hardwareAccelerationEnabled}
      onCheckedChange={(checked) => setHardwareAccelerationMode(!checked)}
    />
    <span class="font-semibold"
      >{hardwareAccelerationEnabled ? "Enabled" : "Disabled"}</span
    >
    {#if hardwareAccelerationModeChanged}
      <Alert
        variant="warning"
        className="p-0 border-0 ms-2"
        title="Re-start the app so the change can be applied."
        Icon={OctagonAlert}
      />
      <button
        type="button"
        onclick={restartApp}
        class="text-sm flex items-center gap-1 cursor-pointer"
      >
        <RotateCw class="size-4 -translate-y-px" />
        Restart
      </button>
    {/if}
  </div>
  <Alert
    variant="secondary"
    className={hardwareAccelerationEnabled ? "visible" : "invisible"}
    title="Disable this if you noticed display issues or unexpected crashes"
    Icon={CircleAlert}
  />
</div>
