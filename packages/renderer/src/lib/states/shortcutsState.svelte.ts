import { globalState } from "$lib/states/globalState.svelte";
import { onDestroy } from "svelte";
import { SvelteMap } from "svelte/reactivity";

export type ShortcutOptions = {
  allowInInputs?: boolean;
};

type ShortcutDefinition = {
  combo: string;
  handler: (event: KeyboardEvent) => void;
  description: string;
  options?: ShortcutOptions;
};

export type ShortcutScope = {
  id: string;
  label: string;
  shortcuts: ShortcutDefinition[];
};

type ShortcutsRegistry = {
  scopes: Map<string, ShortcutScope>;
};

type ParsedCombo = {
  alt: boolean;
  ctrl: boolean;
  key: string;
};
export const shortcutsRegistry: ShortcutsRegistry = $state({ scopes: new SvelteMap() });

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  plus: "+",
  minus: "-",
};

function parseCombo(combo: string): ParsedCombo {
  const parsed: ParsedCombo = {
    alt: false,
    ctrl: false,
    key: "",
  };

  const parts = combo
    .trim()
    .split("+")
    .map((part) => part.trim().toLowerCase());
  const lastPart = parts.at(-1) ?? "";
  parsed.key = KEY_ALIASES[lastPart] ?? lastPart;

  for (const part of parts.slice(0, -1)) {
    if (part === "alt" || part === "option") parsed.alt = true;
    if (part === "ctrl" || part === "control") parsed.ctrl = true;
  }

  return parsed;
}

function eventMatchesCombo(event: KeyboardEvent, combo: ParsedCombo): boolean {
  if (event.shiftKey) return false;
  if (combo.ctrl !== event.ctrlKey) return false;
  if (combo.alt !== event.altKey) return false;
  if (event.key.toLowerCase() !== combo.key.toLowerCase()) return false;
  return true;
}

function isEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }
  return target.isContentEditable;
}

function isShortcutContextBlocked(
  event: KeyboardEvent,
  options?: ShortcutOptions,
): boolean {
  if (globalState.loadingOverlay.open) return true;
  if (options?.allowInInputs) return false;
  return isEditableTarget(event);
}

export function registerShortcuts(scope: ShortcutScope) {
  shortcutsRegistry.scopes.set(scope.id, scope);
  onDestroy(() => shortcutsRegistry.scopes.delete(scope.id));
}

export function handleShortcutKeydown(event: KeyboardEvent) {
  for (const scope of shortcutsRegistry.scopes.values().toArray().reverse()) {
    for (const shortcut of scope.shortcuts) {
      const combo = parseCombo(shortcut.combo);
      if (eventMatchesCombo(event, combo)) {
        if (isShortcutContextBlocked(event, shortcut.options)) return;
        event.preventDefault();
        shortcut.handler(event);
        return;
      }
    }
  }
}
