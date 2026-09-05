export const browsingParamsDialogState = $state({
  isOpen: false,
});

export function openBrowsingParamsDialog() {
  browsingParamsDialogState.isOpen = true;
}

export function setBrowsingParamsDialogState(newState: boolean) {
  browsingParamsDialogState.isOpen = newState;
}

export function getBrowsingParamsDialogState() {
  return browsingParamsDialogState.isOpen;
}
