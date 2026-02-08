import type { AtomicOperationInput } from "@app/bridge-server";
import { writable } from "svelte/store";
import { calcAtomicOperationCardPosition } from "./calcAtomicOperationCardPosition";

export type AtomicOperationItem = {
    id: string;
    operation: AtomicOperationInput;
}

export const operations = writable<AtomicOperationItem[]>([]);
export const operationsOrder = writable<string[]>([]);

export function addAtomicOperation(operation: AtomicOperationInput) {
    const newOperation = { id: crypto.randomUUID(), operation }
    operations.update((ops) => {
        ops.push(newOperation)
        return ops
    })
    operationsOrder.update((ops) => {
        ops.push(newOperation.id)
        return ops
    })
}

export function removeAtomicOperation(id: string) {
    operations.update((ops) => ops.filter((op) => op.id !== id))
    operationsOrder.update((opsIds) => opsIds.filter((opId) => opId !== id))
}

export function rearrangeAtomicOperation(cardRef: HTMLDivElement, direction: "up" | "down") {
    const AtomicOperationList = document.getElementById("AtomicOperationList")!

    const currentOrder = Number(cardRef.dataset.order)
    const distOrder = currentOrder + (direction == "up" ? -1 : 1)

    for (let i = 0; i < AtomicOperationList?.children.length; i++) {
        const card = AtomicOperationList?.children[i] as HTMLDivElement
        if (parseInt(String(card.dataset.order)) === distOrder) {
            card.style.top = `${calcAtomicOperationCardPosition(currentOrder)}px`;
            card.dataset.order = String(currentOrder)

            cardRef.style.top = `${calcAtomicOperationCardPosition(distOrder)}px`;
            cardRef.dataset.order = String(distOrder)
            break
        }
    }

    operationsOrder.update((ops) => {
        const distIndex = currentOrder + (direction == "up" ? -1 : 1)
        const movingOperation = ops[currentOrder]
        const distOperation = ops[distIndex]
        if (!movingOperation || !distOperation) return ops

        ops[currentOrder] = distOperation
        ops[distIndex] = movingOperation
        return ops
    })
}

export function resetOperations() {
    operations.set([]);
    operationsOrder.set([]);
}