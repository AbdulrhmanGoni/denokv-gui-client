<script lang="ts">
  import * as Select from "$lib/components/shadcn/select";
  import { dataTypes, type KvDataType } from "./dataTypes";

  type Props = {
    selectedDataType: KvDataType;
    onSelect?: (selectedDataType: KvDataType) => void;
  };

  let { selectedDataType = $bindable(), onSelect }: Props = $props();
</script>

<Select.Root
  type="single"
  required
  name="type"
  value={selectedDataType.type}
  onValueChange={(value) => {
    selectedDataType = dataTypes.find((dt) => dt.type === value)!;
    onSelect?.(selectedDataType);
  }}
>
  <Select.Trigger class="w-full text-foreground bg-transparent h-7! py-1">
    {selectedDataType.type}
  </Select.Trigger>
  <Select.Content>
    {#each dataTypes as dataType}
      <Select.Item value={dataType.type}>{dataType.type}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
