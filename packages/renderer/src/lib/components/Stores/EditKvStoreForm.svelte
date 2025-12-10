<script lang="ts">
  import { kvStoresService } from "@app/preload";
  import PenIcon from "@lucide/svelte/icons/square-pen";
  import SaveIcon from "@lucide/svelte/icons/save";
  import XIcon from "@lucide/svelte/icons/x";
  import { kvStoresState } from "../../states/kvStoresState.svelte";
  import { toast } from "svelte-sonner";
  import KvStoreForm from "./KvStoreForm.svelte";

  const { kvStore }: { kvStore: KvStore } = $props();

  async function onSubmitForm(
    store: CreateKvStoreInput,
    form?: HTMLFormElement,
  ) {
    const changes = getChanges(store);
    if (!changes) {
      toast.warning("No changes to save");
      return;
    }

    kvStoresService
      .update($state.snapshot(kvStore), changes)
      .then((result) => {
        if (result) {
          toast.success("The kv store has been edited successfully");
          form?.reset();
          kvStoresState.openedStoreToEdit = null;
        } else {
          toast.error("Update Failed", {
            description: "We could not update the Kv Store for unknown reason",
          });
        }
      })
      .catch((error) => {
        toast.error("Update Failed", {
          description: String(error),
        });
      });
  }

  function getChanges(kvStoreForm: CreateKvStoreInput) {
    const { url, ...restKvStoreForm } = kvStoreForm;

    const changes: EditKvStoreInput = {
      accessToken: kvStoreForm.accessToken,
      authToken: kvStoreForm.authToken,
    };

    let isChanged = false;

    Object.entries(restKvStoreForm).forEach(([key, value]) => {
      const fieldChanged =
        $state.snapshot(kvStore)[key as keyof KvStore] !== value;

      if (fieldChanged) {
        Object.assign(changes, { [key]: value });
        isChanged = fieldChanged;
      }
    });

    const urlChanged = kvStore.type != "local" && kvStore.url !== url;
    const localKvPathChanged =
      kvStore.type == "local" &&
      kvStore.url?.replace(/kv.sqlite3$/gi, "") !== url;

    if (localKvPathChanged || urlChanged) {
      Object.assign(changes, { url });
      if (!isChanged) {
        isChanged = true;
      }
    }

    if (isChanged) {
      return changes;
    }

    return null;
  }
</script>

<KvStoreForm
  title="Edit KV Store"
  titleIcon={icon}
  {onSubmitForm}
  defaultValues={kvStore}
  submitButtonText="Save"
  backButtonText="Cancel"
  submitButtonIcon={saveIcon}
  backButtonIcon={xIcon}
  onBack={() => {
    kvStoresState.openedStoreToEdit = null;
  }}
/>

{#snippet icon()}
  <PenIcon />
{/snippet}

{#snippet saveIcon()}
  <SaveIcon />
{/snippet}

{#snippet xIcon()}
  <XIcon />
{/snippet}
