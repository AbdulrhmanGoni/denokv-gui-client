<script lang="ts">
  import { cn } from "$lib/utils";

  const { className }: { className?: string } = $props();
</script>

<img class={cn("size-12", className)} src="icon.png" alt="Logo" />
