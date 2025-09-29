type GlobalState = {
    loadingOverlay: {
        open: boolean,
        text?: string,
    }
    openAddKvEntryForm: boolean,
    openSettings: boolean,
}

export const globalState: GlobalState = $state({
    loadingOverlay: {
        open: false,
    },
    openAddKvEntryForm: false,
    openSettings: false,
})

export function openAddKvEntryDialog() {
    globalState.openAddKvEntryForm = true
}

export function closeAddKvEntryDialog() {
    globalState.openAddKvEntryForm = false
}
