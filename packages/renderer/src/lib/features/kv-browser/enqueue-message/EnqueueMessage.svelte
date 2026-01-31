<script lang="ts">
    import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import { cn } from "$lib/shadcn-utils";
    import { buttonVariants } from "$lib/ui/shadcn/button";
    import { kvClient } from "@app/preload";
    import { toast } from "svelte-sonner";
    import EnqueueMessageForm from "./EnqueueMessageForm.svelte";

    let isEnqueuing = $state(false);
    let isDialogOpen = $state(false);

    async function enqueue(
        message: KvEntry["value"],
        options?: EnqueueRequestInput["options"],
        reset?: () => void,
    ) {
        isEnqueuing = true;
        const { error } = await kvClient.enqueue(message, options);
        if (error) {
            toast.error("Failed to enqueue message", { description: error });
        } else {
            toast.success("Message enqueued successfully");
            reset?.();
        }
        isEnqueuing = false;
    }

    function getOpen() {
        return isDialogOpen;
    }

    function setOpen(newState: boolean) {
        isDialogOpen = newState;
    }
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
    <Dialog.Trigger
        class={cn(
            buttonVariants({
                size: "sm",
                variant: "secondary",
            }),
        )}
    >
        Enqueue Message
        <MessageSquarePlusIcon class="size-4" />
    </Dialog.Trigger>
    <Dialog.Content
        class="max-w-2xl w-full max-h-[600px] overflow-auto p-3 gap-2"
    >
        <EnqueueMessageForm onSubmit={enqueue} loading={isEnqueuing} />
    </Dialog.Content>
</Dialog.Root>
