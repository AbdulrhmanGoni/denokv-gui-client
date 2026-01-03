type GlobalState = {
    loadingOverlay: {
        open: boolean,
        text?: string,
    }
}

export const globalState: GlobalState = $state({
    loadingOverlay: {
        open: false,
    },
})
