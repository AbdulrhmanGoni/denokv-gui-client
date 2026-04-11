<script lang="ts">
  import { Input } from "$lib/ui/shadcn/input/index.js";
  import { Label } from "$lib/ui/shadcn/label/index.js";
  import { Button } from "$lib/ui/shadcn/button/index.js";
  import { selectDirectory, selectFile, pathUtils } from "@app/preload";
  import Loader from "@lucide/svelte/icons/loader";
  import * as Select from "$lib/ui/shadcn/select";
  import type { Snippet } from "svelte";
  import { Checkbox } from "$lib/ui/shadcn/checkbox/index.js";
  import * as InputGroup from "$lib/ui/shadcn/input-group";

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
    defaultValues?.type == "local" && defaultValues?.url
      ? pathUtils.dirname(defaultValues.url)
      : "",
  );
  let localKvFileName = $state(
    defaultValues?.type == "local" && defaultValues?.url
      ? pathUtils.basename(defaultValues.url)
      : "kv.sqlite3",
  );
  let localKvUrl = $derived(pathUtils.join(localKvDirectory, localKvFileName));
  let replaceExisting = $state(defaultValues?.replaceExisting ?? false);
  let selectedStoreType: KvStore["type"] | undefined = $state(
    defaultValues?.type ||
      (localStorage.getItem("default-kv-store-type") as KvStore["type"]) ||
      undefined,
  );
  let isRemoteStore = $derived(selectedStoreType == "remote");
  let isLocalStore = $derived(selectedStoreType == "local");
  let isBridgedStore = $derived(selectedStoreType == "bridge");

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

  async function pickFile() {
    const selectedFile = await selectFile(localKvDirectory);
    if (selectedFile) {
      localKvDirectory = selectedFile.directory;
      localKvFileName = selectedFile.fileName;
    }
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
      value={selectedStoreType}
      onValueChange={(value) => {
        if (value === selectedStoreType) return;
        selectedStoreType = value as KvStore["type"];
        localStorage.setItem("default-kv-store-type", value);
      }}
    >
      <Select.Trigger class="w-full bg-background">
        {selectedStoreType ? selectedStoreType : "Select Type"}
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
    <input type="hidden" name="url" value={localKvUrl} />
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="space-y-1.5 flex-2">
        <Label for="localKvFileName">Kv Store File Name</Label>
        <InputGroup.Root>
          <InputGroup.Input
            type="text"
            id="localKvFileName"
            required
            disabled={isLoading}
            placeholder="kv.sqlite3"
            class="flex-1"
            bind:value={localKvFileName}
          />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Button
              onclick={pickFile}
              variant="default"
              disabled={isLoading}
            >
              Pick
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup.Root>
        <p class="text-muted-foreground text-sm">
          Name of the file that contains the kv store data.
        </p>
      </div>
      <div class="space-y-1.5 flex-2">
        <Label for="localKvDirectory" class="gap-1">
          Kv Store Directory
          <span class="font-normal text-muted-foreground">(absolute path)</span>
        </Label>
        <InputGroup.Root>
          <InputGroup.Input
            type="text"
            id="localKvDirectory"
            required
            disabled={isLoading}
            placeholder="/path/to/directory/"
            class="flex-1"
            bind:value={localKvDirectory}
          />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Button
              onclick={pickDirectory}
              variant="default"
              disabled={isLoading}
            >
              Pick
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup.Root>
        <p class="text-muted-foreground text-sm">
          The directory of your local Deno KV store database file.
        </p>
      </div>
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
          If there is already an existing database file with the same name in
          the picked directory, replace it with a new empty database file.
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
