import { toggleMode } from "mode-watcher";

export function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.altKey && e.key === "s") {
        e.preventDefault();
        toggleMode();
    }
}