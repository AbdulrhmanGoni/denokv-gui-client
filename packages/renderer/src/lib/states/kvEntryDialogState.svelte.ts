
type KvEntryDialogState = {
    entry: KvEntry | null;
    open: boolean;
    openValueEditor: boolean;
}

export const kvEntryDialogState: KvEntryDialogState = $state({
    open: false,
    entry: null,
    openValueEditor: true,
})

export function openKvEntryDialog(entry: KvEntry, edit?: boolean) {
    kvEntryDialogState.entry = entry
    kvEntryDialogState.open = true
    kvEntryDialogState.openValueEditor = !!edit
}

export const openAddKvEntryFormState = $state({ open: false });

export function openAddKvEntryDialog() {
    openAddKvEntryFormState.open = true
}

export function closeAddKvEntryDialog() {
    openAddKvEntryFormState.open = false
}
