
type KvEntryDialogState = {
    entry: KvEntry | null;
    open: boolean;
    openValueEditor: boolean;
}

export const kvEntryDialogState: KvEntryDialogState = $state({
    open: false,
    entry: null,
    openValueEditor: false,
})

export function openKvEntryDialog(entry: KvEntry, openEditor?: boolean) {
    kvEntryDialogState.entry = entry
    kvEntryDialogState.open = true
    kvEntryDialogState.openValueEditor = !!openEditor
}

export const openAddKvEntryFormState = $state({ open: false });

export function openAddKvEntryDialog() {
    openAddKvEntryFormState.open = true
}

export function closeAddKvEntryDialog() {
    openAddKvEntryFormState.open = false
}

export const openLookUpKeyDialogState = $state({ open: false });

export function openLookUpKeyDialog() {
    openLookUpKeyDialogState.open = true
}

export function closeLookUpKeyDialog() {
    openLookUpKeyDialogState.open = false
}
