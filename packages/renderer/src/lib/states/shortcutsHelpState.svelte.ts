export const shortcutsHelpState = $state({ open: false });

export function openShortcutsHelpDialog() {
  shortcutsHelpState.open = true;
}
