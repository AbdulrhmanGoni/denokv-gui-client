type GlobalState = {
    openLoadingOverlay: boolean
}

export const globalState: GlobalState = $state({
    openLoadingOverlay: false
})
