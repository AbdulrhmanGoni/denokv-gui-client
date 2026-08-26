<script lang="ts">
  import { kvStoresService } from "@app/preload";
  import DatabaseIcon from "@lucide/svelte/icons/database";
  import DatabasePlusIcon from "@lucide/svelte/icons/database-plus";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import { toast } from "svelte-sonner";
  import KvStoreForm from "./KvStoreForm.svelte";
  import type { CreateKvStoreInput } from "@app/main";

  function onSubmitForm(newStore: CreateKvStoreInput, form?: HTMLFormElement) {
    kvStoresService.create(newStore).then(({ result, error }) => {
      if (error) {
        toast.error("Creation Failed", { description: error });
      } else if (result) {
        toast.success("The Kv Store was created successfully");
        form?.reset();
        kvStoresState.openAddNewStoreForm = false;
      } else {
        toast.error("Creation Failed", {
          description: "We could not create the Kv Store for unknown reason",
        });
      }
    });
  }
</script>

<KvStoreForm
  title="Add KV Store"
  titleIcon={databaseIcon}
  {onSubmitForm}
  submitButtonText="Add"
  submitButtonIcon={databasePlusIcon}
  backButtonIcon={backIcon}
  onBack={() => {
    kvStoresState.openAddNewStoreForm = false;
  }}
/>

{#snippet databaseIcon()}
  <DatabaseIcon />
{/snippet}

{#snippet databasePlusIcon()}
  <DatabasePlusIcon />
{/snippet}

{#snippet backIcon()}
  <ArrowLeft />
{/snippet}
