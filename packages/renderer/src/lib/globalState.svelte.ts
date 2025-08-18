type GlobalState = {
    loadingOverlay: {
        open: boolean,
        text?: string,
    }
    openAddKvEntryForm: boolean,
}

export const globalState: GlobalState = $state({
    loadingOverlay: {
        open: false,
    },
    openAddKvEntryForm: false,
})

export function openAddKvEntryDialog() {
    globalState.openAddKvEntryForm = true
}

export function closeAddKvEntryDialog() {
    globalState.openAddKvEntryForm = false
}
