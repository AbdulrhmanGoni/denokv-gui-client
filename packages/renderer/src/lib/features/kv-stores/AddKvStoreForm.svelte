<script lang="ts">
  import { kvStoresService } from "@app/preload";
  import DatabaseIcon from "@lucide/svelte/icons/database";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import { toast } from "svelte-sonner";
  import KvStoreForm from "./KvStoreForm.svelte";

  function onSubmitForm(newStore: CreateKvStoreInput, form?: HTMLFormElement) {
    kvStoresService
      .create(newStore)
      .then((res) => {
        if (res) {
          toast.success("The Kv Store was created successfully");
          form?.reset();
          kvStoresState.openAddNewStoreForm = false;
        } else {
          toast.error("Creation Failed", {
            description: "We could not create the Kv Store for unknown reason",
          });
        }
      })
      .catch((error) => {
        toast.error("Creation Failed", {
          description: `${error}`,
        });
      });
  }
</script>

<KvStoreForm
  title="Add KV Store"
  titleIcon={icon}
  {onSubmitForm}
  submitButtonText="Add"
  onBack={() => {
    kvStoresState.openAddNewStoreForm = false;
  }}
/>

{#snippet icon()}
  <DatabaseIcon />
{/snippet}
