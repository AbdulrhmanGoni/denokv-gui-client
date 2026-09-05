export const atomicOperationsDialogState = $state({
  isOpen: false,
});

export function openAtomicOperationsDialog() {
  atomicOperationsDialogState.isOpen = true;
}

export function setAtomicOperationsDialogState(newState: boolean) {
  atomicOperationsDialogState.isOpen = newState;
}

export function getAtomicOperationsDialogState() {
  return atomicOperationsDialogState.isOpen;
}
