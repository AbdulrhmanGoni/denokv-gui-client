<script lang="ts">
  import CheckAtomicOperationCard from "./CheckAtomicOperationCard.svelte";
  import NumberAtomicOperationCard from "./NumberAtomicOperationCard.svelte";
  import SetAtomicOperationCard from "./SetAtomicOperationCard.svelte";
  import DeleteAtomicOperationCard from "./DeleteAtomicOperationCard.svelte";
  import EnqueueAtomicOperationCard from "./EnqueueAtomicOperationCard.svelte";
  import type { AtomicOperationItem } from "./atomicOperationsState.svelte";

  let { operationItem }: { operationItem: AtomicOperationItem } = $props();
</script>

{#if operationItem.operation.name == "check"}
  <CheckAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "set"}
  <SetAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "sum"}
  <NumberAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "min"}
  <NumberAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "max"}
  <NumberAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "delete"}
  <DeleteAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{:else if operationItem.operation.name == "enqueue"}
  <EnqueueAtomicOperationCard
    operation={operationItem.operation}
    id={operationItem.id}
  />
{/if}
