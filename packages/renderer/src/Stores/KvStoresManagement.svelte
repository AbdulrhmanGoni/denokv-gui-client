<script lang="ts">
  import AddKvStoreForm from "./AddKvStoreForm.svelte";
  import EditKvStoreForm from "./EditKvStoreForm.svelte";
  import KvStoresGrid from "./KvStoresGrid.svelte";
  import { kvStoresState } from "./kvStoresState.svelte";
</script>

{#if kvStoresState.openAddNewStoreForm}
  <AddKvStoreForm />
{:else if kvStoresState.openedStoreToEdit}
  <EditKvStoreForm kvStore={kvStoresState.openedStoreToEdit} />
{:else}
  <KvStoresGrid />
{/if}
