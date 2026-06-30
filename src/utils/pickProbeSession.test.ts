import { describe, expect, it } from "vitest";
import {
    captureProbeOriginalSnapshot,
    createSavedProbeEntry,
    restoreProbeElementOriginal,
} from "./pickProbeSession.js";

const probeColors = {
    textColor: "#111111",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
};

describe("pickProbeSession", () => {
    it("keeps the original baseline when committing subsequent edits", () => {
        const first = createSavedProbeEntry(
            "selector:button",
            {
                textContent: "Before",
                fontSize: "16px",
                padding: "8px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            {
                textContent: "After",
                fontSize: "14px",
                padding: "8px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            null,
            "Before",
            undefined,
            "<span>Before</span>",
            null,
        );

        const second = createSavedProbeEntry(
            "selector:button",
            {
                textContent: "After",
                fontSize: "14px",
                padding: "8px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            {
                textContent: "After 2",
                fontSize: "12px",
                padding: "8px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            null,
            "Before 2",
            first,
            "<span>Before 2</span>",
            null,
        );

        expect(second.baseline.fontSize).toBe("16px");
        expect(second.applied.fontSize).toBe("12px");
        expect(second.originalTextContent).toBe("Before");
        expect(second.originalInnerHTML).toBe("<span>Before</span>");
    });

    it("restores innerHTML and text when reverting a saved edit", () => {
        document.body.innerHTML = `<h3 id="title"><span>Original</span> title</h3>`;
        const element = document.getElementById("title") as HTMLElement;
        const snapshot = captureProbeOriginalSnapshot(element);

        element.textContent = "Edited";

        restoreProbeElementOriginal(element, createSavedProbeEntry(
            "selector:#title",
            {
                textContent: "Original title",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            {
                textContent: "Edited",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            null,
            snapshot.textContent,
            undefined,
            snapshot.innerHTML,
            null,
        ));

        expect(element.innerHTML).toBe('<span>Original</span> title');
        expect(element.textContent).toBe("Original title");
    });

    it("restores input value when reverting a saved edit", () => {
        document.body.innerHTML = `<input id="search" value="Original" />`;
        const element = document.getElementById("search") as HTMLInputElement;
        const snapshot = captureProbeOriginalSnapshot(element);

        element.value = "Edited";

        restoreProbeElementOriginal(element, createSavedProbeEntry(
            "selector:#search",
            {
                textContent: "Original",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            {
                textContent: "Edited",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            null,
            snapshot.textContent,
            undefined,
            snapshot.innerHTML,
            snapshot.inputValue,
        ));

        expect(element.value).toBe("Original");
    });

    it("falls back to baseline text when original text metadata is missing", () => {
        document.body.innerHTML = `<p id="copy">Original</p>`;
        const element = document.getElementById("copy") as HTMLElement;

        element.textContent = "Edited";

        restoreProbeElementOriginal(element, createSavedProbeEntry(
            "selector:#copy",
            {
                textContent: "Original",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            {
                textContent: "Edited",
                fontSize: "16px",
                padding: "0px",
                margin: "0px",
                lineHeight: "20px",
                ...probeColors,
            },
            null,
            null,
            undefined,
            null,
            null,
        ));

        expect(element.textContent).toBe("Original");
    });
});
