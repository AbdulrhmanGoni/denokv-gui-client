import { renderComponent, renderSnippet } from "$lib/components/shadcn/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { Checkbox } from "$lib/components/shadcn/checkbox";
import KvKeyRenderer from "./KvKeyRenderer.svelte";
import KvValueRenderer from "./KvValueRenderer.svelte";
import KvEntriesTableActions from "./KvEntriesTableActions.svelte";

export const columns: ColumnDef<KvEntry>[] = [
    {
        id: "select",
        header: ({ table }) => (
            renderComponent(Checkbox, {
                checked: table.getIsAllPageRowsSelected(),
                indeterminate:
                    table.getIsSomePageRowsSelected() &&
                    !table.getIsAllPageRowsSelected(),
                onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
                "aria-label": "Select all",
            })
        ),
        cell: ({ row }) => (
            renderComponent(Checkbox, {
                checked: row.getIsSelected(),
                onCheckedChange: (value) => row.toggleSelected(!!value),
                "aria-label": "Select row",
            })
        ),
    },
    {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
            renderComponent(
                KvKeyRenderer,
                { entry: row.original, className: "max-w-40 md:max-w-46 xl:max-w-52 2xl:max-w-60" }
            )
        ),
    },
    {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
            renderComponent(KvValueRenderer, { entry: row.original, className: "max-w-80 md:max-w-[500px] xl:max-w-2xl" })
        ),
    },
    {
        accessorKey: "versionstamp",
        maxSize: 175,
        header: () => (
            renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-right">Versionstamp</div>`
                })),
                ""
            )
        ),
        cell: ({ row }) => (
            renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-right line-clamp-1 max-w-[175px] overflow-auto py-1">${row.getValue("versionstamp")}</div>`
                })),
                ""
            )
        ),
    },
    {
        accessorKey: "action",
        header: () => (
            renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-right">Action</div>`
                })),
                ""
            )
        ),
        cell: ({ row }) => {
            return renderComponent(KvEntriesTableActions, { entry: row.original });
        },
    },
];