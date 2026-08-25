import type { SerializedKvEntry } from "@app/bridge-server";
import { isSameKvKey } from "@app/bridge-server/kv-utils";

type KvEntryDialogState = {
  entry: SerializedKvEntry | null;
  open: boolean;
  openValueEditor: boolean;
};

export const kvEntryDialogState: KvEntryDialogState = $state({
  open: false,
  entry: null,
  openValueEditor: false,
});

export function openKvEntryDialog(entry: SerializedKvEntry, openEditor?: boolean) {
  kvEntryDialogState.entry = entry;
  kvEntryDialogState.open = true;
  kvEntryDialogState.openValueEditor = !!openEditor;
}

export function updateOpenKvEntry(updatedEntry: SerializedKvEntry) {
  if (
    kvEntryDialogState.entry &&
    isSameKvKey(kvEntryDialogState.entry.key, updatedEntry.key)
  ) {
    kvEntryDialogState.entry = updatedEntry;
  }
}

export const openAddKvEntryFormState = $state({ open: false });

export function openAddKvEntryDialog() {
  openAddKvEntryFormState.open = true;
}

export function closeAddKvEntryDialog() {
  openAddKvEntryFormState.open = false;
}

export const openLookUpKeyDialogState = $state({ open: false });

export function openLookUpKeyDialog() {
  openLookUpKeyDialogState.open = true;
}

export function closeLookUpKeyDialog() {
  openLookUpKeyDialogState.open = false;
}
