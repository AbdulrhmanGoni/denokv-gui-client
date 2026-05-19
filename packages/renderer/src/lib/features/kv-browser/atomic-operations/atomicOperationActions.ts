import LockIcon from "@lucide/svelte/icons/lock-keyhole";
import FilePlusIcon from "@lucide/svelte/icons/file-plus";
import PlusIcon from "@lucide/svelte/icons/plus";
import ArrowDown1_0Icon from "@lucide/svelte/icons/arrow-down-1-0";
import ArrowUp1_0Icon from "@lucide/svelte/icons/arrow-up-1-0";
import TrashIcon from "@lucide/svelte/icons/trash";
import MessageIcon from "@lucide/svelte/icons/message-square-plus";
import type { Component } from "svelte";

type AtomicOperationAction = {
    icon: Component;
    borderClass: string;
    titleClass: string;
}

export const atomicOperationActions: Record<string, AtomicOperationAction> = {
    check: {
        icon: LockIcon,
        borderClass: "border-sky-500/30!",
        titleClass: "bg-sky-500/30!",
    },
    set: {
        icon: FilePlusIcon,
        borderClass: "border-purple-500/30!",
        titleClass: "bg-purple-500/30!",
    },
    sum: {
        icon: PlusIcon,
        borderClass: "border-green-500/30!",
        titleClass: "bg-green-500/30!",
    },
    min: {
        icon: ArrowDown1_0Icon,
        borderClass: "border-orange-500/30!",
        titleClass: "bg-orange-500/30!",
    },
    max: {
        icon: ArrowUp1_0Icon,
        borderClass: "border-yellow-500/30!",
        titleClass: "bg-yellow-500/30!",
    },
    delete: {
        icon: TrashIcon,
        borderClass: "border-red-500/30!",
        titleClass: "bg-red-500/30!",
    },
    enqueue: {
        icon: MessageIcon,
        borderClass: "border-secondary/30!",
        titleClass: "bg-secondary/30!",
    },
};