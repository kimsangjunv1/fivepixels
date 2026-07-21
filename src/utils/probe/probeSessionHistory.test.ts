import { describe, expect, it } from "vitest";
import type { SavedProbeDeletion, SavedProbeEntry } from "@/types/report-ui.js";
import { applyProbeSessionActionBackward, applyProbeSessionActionForward } from "./probeSessionHistory.js";
import { captureSavedProbeDeletion } from "./pickProbeSession.js";

const probeColors = {
    textColor: "#111111",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
};

function createEntry(elementKey: string, textContent: string): SavedProbeEntry {
    const values = {
        textContent,
        fontSize: "16px",
        padding: "0px",
        margin: "0px",
        lineHeight: "1.5",
        ...probeColors,
    };

    return {
        elementKey,
        baseline: values,
        applied: { ...values, textContent: `${textContent}-edited` },
        originalStyle: null,
        originalTextContent: textContent,
        originalInnerHTML: null,
        originalInputValue: null,
    };
}

describe("probeSessionHistory", () => {
    it("undoes and redoes a style apply", () => {
        document.body.innerHTML = `<main><p id="target">Original</p></main>`;
        const elementKey = "selector:#target";
        const entry = createEntry(elementKey, "Original");
        const maps = { edits: {}, deletions: [] as SavedProbeDeletion[] };

        const afterApply = applyProbeSessionActionForward(
            { kind: "style-apply", elementKey, previousEntry: null, nextEntry: entry },
            maps,
        );

        expect(document.getElementById("target")?.textContent).toBe("Original-edited");

        const afterUndo = applyProbeSessionActionBackward(
            { kind: "style-apply", elementKey, previousEntry: null, nextEntry: entry },
            afterApply,
        );

        expect(document.getElementById("target")?.textContent).toBe("Original");
        expect(Object.keys(afterUndo.edits)).toHaveLength(0);

        const afterRedo = applyProbeSessionActionForward(
            { kind: "style-apply", elementKey, previousEntry: null, nextEntry: entry },
            afterUndo,
        );

        expect(document.getElementById("target")?.textContent).toBe("Original-edited");
        expect(afterRedo.edits[elementKey]).toBeDefined();
    });

    it("undoes and redoes a delete", () => {
        document.body.innerHTML = `<main><p id="target">Remove me</p></main>`;
        const element = document.getElementById("target") as HTMLElement;
        const deletion = captureSavedProbeDeletion(element, "selector:#target");

        expect(deletion).not.toBeNull();

        element.remove();

        const action = {
            kind: "delete" as const,
            deletion: deletion!,
            previousStyleEntry: null,
        };
        const maps = { edits: {}, deletions: [] as SavedProbeDeletion[] };
        const afterDelete = applyProbeSessionActionForward(action, maps);

        expect(document.getElementById("target")).toBeNull();
        expect(afterDelete.deletions).toHaveLength(1);

        const afterUndo = applyProbeSessionActionBackward(action, afterDelete);

        expect(document.getElementById("target")?.textContent).toBe("Remove me");
        expect(afterUndo.deletions).toHaveLength(0);

        const afterRedo = applyProbeSessionActionForward(action, afterUndo);

        expect(document.getElementById("target")).toBeNull();
        expect(afterRedo.deletions).toHaveLength(1);
    });

    it("restores deleted siblings when undoing in reverse order", () => {
        document.body.innerHTML = `<main><ul><li>one</li><li>two</li><li>three</li></ul></main>`;
        const list = document.querySelector("ul")!;
        const deletions: SavedProbeDeletion[] = [];
        let maps = { edits: {}, deletions: [] as SavedProbeDeletion[] };

        while (list.children.length > 0) {
            const item = list.querySelector("li") as HTMLElement;
            const deletion = captureSavedProbeDeletion(item, `selector:${item.textContent}`)!;

            deletions.push(deletion);
            item.remove();
            maps = applyProbeSessionActionForward(
                { kind: "delete", deletion, previousStyleEntry: null },
                maps,
            );
        }

        expect(list.children).toHaveLength(0);
        expect(deletions).toHaveLength(3);

        for (let index = deletions.length - 1; index >= 0; index -= 1) {
            maps = applyProbeSessionActionBackward(
                { kind: "delete", deletion: deletions[index]!, previousStyleEntry: null },
                maps,
            );
        }

        expect(list.children).toHaveLength(3);
        expect(Array.from(list.children).map((child) => child.textContent)).toEqual(["one", "two", "three"]);
    });
});
