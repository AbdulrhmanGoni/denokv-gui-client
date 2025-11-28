type GlobalState = {
    loadingOverlay: {
        open: boolean,
        text?: string,
    }
    openSettings: boolean,
}

export const globalState: GlobalState = $state({
    loadingOverlay: {
        open: false,
    },
    openSettings: false,
})
