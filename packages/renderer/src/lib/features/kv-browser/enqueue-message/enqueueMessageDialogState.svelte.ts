export const enqueueMessageDialogState = $state({
  isOpen: false,
});

export function openEnqueueMessageDialog() {
  enqueueMessageDialogState.isOpen = true;
}

export function setEnqueueMessageDialogState(newState: boolean) {
  enqueueMessageDialogState.isOpen = newState;
}

export function getEnqueueMessageDialogState() {
  return enqueueMessageDialogState.isOpen;
}
