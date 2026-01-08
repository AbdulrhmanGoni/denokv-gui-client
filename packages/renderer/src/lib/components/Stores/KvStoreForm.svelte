<script lang="ts">
  import { Input } from "$lib/components/shadcn/input/index.js";
  import { Label } from "$lib/components/shadcn/label/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { selectDirectory } from "@app/preload";
  import Loader from "@lucide/svelte/icons/loader";
  import * as Select from "$lib/components/shadcn/select";
  import type { Snippet } from "svelte";
  import { Checkbox } from "$lib/components/shadcn/checkbox/index.js";

  type KvStoreFormProps = {
    defaultValues?: Partial<CreateKvStoreInput>;
    title: string;
    titleIcon: Snippet;
    onSubmitForm: (store: CreateKvStoreInput, form?: HTMLFormElement) => void;
    submitButtonText?: string;
    backButtonText?: string;
    submitButtonIcon?: Snippet;
    backButtonIcon?: Snippet;
    onBack: () => void;
    isLoading?: boolean;
  };

  const {
    defaultValues,
    title,
    titleIcon,
    onSubmitForm,
    submitButtonText,
    backButtonText,
    submitButtonIcon,
    backButtonIcon,
    onBack,
    isLoading,
  }: KvStoreFormProps = $props();

  let localKvDirectory = $state(
    defaultValues?.type == "local"
      ? defaultValues?.url?.replace(/kv.sqlite3$/gi, "")
      : "",
  );
  let replaceExisting = $state(defaultValues?.replaceExisting ?? false);
  let openedStoreType: KvStore["type"] | undefined = $state(
    defaultValues?.type,
  );
  let isRemoteStore = $derived(openedStoreType == "remote");
  let isLocalStore = $derived(openedStoreType == "local");
  let isBridgedStore = $derived(openedStoreType == "bridge");

  async function handleSubmit(
    event: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const kvStoreName = formData.get("name")?.toString() as string;
    const kvStoreUrl = formData.get("url")?.toString() as string;
    const type = formData.get("type")?.toString() as string;
    const accessToken = formData.get("accessToken")?.toString() ?? null;
    const authToken = formData.get("authToken")?.toString() ?? null;

    const store: CreateKvStoreInput = {
      name: kvStoreName,
      url: kvStoreUrl,
      type: type as CreateKvStoreInput["type"],
      accessToken: isRemoteStore ? accessToken : null,
      authToken: isBridgedStore ? authToken : null,
      replaceExisting: isLocalStore ? replaceExisting : undefined,
    };

    onSubmitForm(store, form);
  }

  async function pickDirectory() {
    localKvDirectory = await selectDirectory();
  }
</script>

<form
  onsubmit={handleSubmit}
  class="flex w-full flex-col gap-4 bg-card text-card-foreground rounded-md border p-3 h-full shadow-sm"
>
  <h1 class="text-2xl font-bold flex items-center gap-2">
    {@render titleIcon()}
    {title}
  </h1>
  <div class="space-y-1.5">
    <Label for="name">Kv Store Name</Label>
    <Input
      type="text"
      id="name"
      name="name"
      disabled={isLoading}
      required
      placeholder="Name"
      defaultValue={defaultValues?.name}
    />
    <p class="text-muted-foreground text-sm">
      Enter the name of the new kv store.
    </p>
  </div>
  <div class="space-y-1.5">
    <Label for="name">Kv Store Type</Label>
    <Select.Root
      type="single"
      required
      disabled={isLoading}
      name="type"
      value={openedStoreType}
      onValueChange={(value) => {
        openedStoreType = value as KvStore["type"];
      }}
    >
      <Select.Trigger class="w-full bg-background">
        {openedStoreType ? openedStoreType : "Select Type"}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="remote">remote</Select.Item>
        <Select.Item value="bridge">bridge</Select.Item>
        <Select.Item value="local">local</Select.Item>
      </Select.Content>
    </Select.Root>
    <p class="text-muted-foreground text-sm">
      Select the type of the kv store you want to create a connection to.
    </p>
  </div>
  {#if isLocalStore}
    <div class="space-y-1.5">
      <Label for="url">Kv Store Directory (absolute path)</Label>
      <div class="flex gap-2 items-center">
        <Input
          type="text"
          id="url"
          name="url"
          required
          disabled={isLoading}
          placeholder="/path/to/directory"
          class="flex-1"
          bind:value={localKvDirectory}
        />
        <Button onclick={pickDirectory}>Pick Directory</Button>
      </div>
      <p class="text-muted-foreground text-sm">
        Select the directory where you want to create your local Deno KV store.
      </p>
    </div>
    <div class="items-top flex gap-x-2 my-2">
      <Checkbox
        id="replaceExisting"
        name="replaceExisting"
        bind:checked={replaceExisting}
      />
      <div class="grid gap-1.5">
        <Label
          for="replaceExisting"
          class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Replace Existing?
        </Label>
        <p class="text-sm text-muted-foreground">
          If there is already existing Deno kv database (<code
            class="font-mono bg-muted px-1 py-0.5 rounded">kv.sqlite3</code
          >
          file) in the picked directory, replace it with a new empty database file.
        </p>
      </div>
    </div>
  {:else}
    <div class="space-y-1.5">
      <Label for="url">Kv Store URL</Label>
      <Input
        type="url"
        id="url"
        name="url"
        required
        disabled={isLoading}
        defaultValue={defaultValues?.url}
        placeholder="http://"
      />
      <p class="text-muted-foreground text-sm">Enter URL of the kv Store.</p>
    </div>
  {/if}
  {#if isRemoteStore}
    <div class="space-y-1.5">
      <Label for="accessToken">Access Token</Label>
      <Input
        type="text"
        id="accessToken"
        name="accessToken"
        placeholder="ddp_..."
        disabled={isLoading}
        defaultValue={defaultValues?.accessToken ?? ""}
        required={isRemoteStore}
      />
      <p class="text-muted-foreground text-sm">
        Enter the access token of your remote kv store.
      </p>
    </div>
  {/if}
  {#if isBridgedStore}
    <div class="space-y-1.5">
      <Label for="authToken">Auth Token</Label>
      <Input
        type="text"
        id="authToken"
        name="authToken"
        placeholder="Token..."
        disabled={isLoading}
        defaultValue={defaultValues?.authToken ?? ""}
      />
      <p class="text-muted-foreground text-sm">
        Enter the auth token of bridge server if it's required to access the
        server.
      </p>
    </div>
  {/if}
  <div class="flex gap-2 items-end mt-auto justify-end">
    <Button
      onclick={onBack}
      type="button"
      variant="outline"
      class={isLoading ? "cursor-progress" : ""}
      disabled={isLoading}
    >
      {#if backButtonIcon}
        {@render backButtonIcon()}
      {/if}
      {backButtonText ? backButtonText : "Back"}
    </Button>
    <Button
      type="submit"
      class={isLoading ? "cursor-progress" : ""}
      disabled={isLoading}
    >
      {submitButtonText ? submitButtonText : "Submit"}
      {#if isLoading}
        <Loader class="animate-spin" />
      {:else if submitButtonIcon}
        {@render submitButtonIcon()}
      {/if}
    </Button>
  </div>
</form>
