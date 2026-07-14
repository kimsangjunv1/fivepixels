import { describe, expect, it } from "vitest";
import {
    captureProbeOriginalSnapshot,
    createSavedProbeEntry,
    restoreProbeElementFromSnapshot,
    restoreProbeElementOriginal,
    restoreSavedProbeDeletion,
    captureSavedProbeDeletion,
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

    it("restores a deleted element back into the DOM", () => {
        document.body.innerHTML = `<main><p id="target">Remove me</p></main>`;
        const element = document.getElementById("target") as HTMLElement;
        const deletion = captureSavedProbeDeletion(element, "selector:#target");

        expect(deletion).not.toBeNull();
        expect(deletion?.id).toBeTruthy();

        element.remove();

        const restored = restoreSavedProbeDeletion(deletion!);

        expect(restored?.textContent).toBe("Remove me");
        expect(document.getElementById("target")).not.toBeNull();
    });

    it("restores container innerHTML instead of flattening text nodes", () => {
        document.body.innerHTML = `
            <article id="card" data-report-id="edge-search-field">
                <h3 class="title">Filter input</h3>
                <p class="desc">태깅된 입력 필드입니다.</p>
                <button type="button">Tagged action</button>
            </article>
        `;
        const element = document.getElementById("card") as HTMLElement;
        const snapshot = captureProbeOriginalSnapshot(element);

        element.textContent = "broken flat text";

        restoreProbeElementFromSnapshot(element, snapshot);

        expect(element.querySelector("h3.title")?.textContent).toBe("Filter input");
        expect(element.querySelector("p.desc")?.textContent).toBe("태깅된 입력 필드입니다.");
        expect(element.querySelector("button")?.textContent).toBe("Tagged action");
        expect(element.getAttribute("style")).toBeNull();
    });

    it("does not add inline styles when restoring a container with no original style", () => {
        document.body.innerHTML = `<article id="card"><p>Content</p></article>`;
        const element = document.getElementById("card") as HTMLElement;
        const snapshot = captureProbeOriginalSnapshot(element);

        element.style.padding = "16px";
        element.style.gridTemplateColumns = "repeat(1, minmax(0px, 1fr))";

        restoreProbeElementFromSnapshot(element, snapshot);

        expect(element.getAttribute("style")).toBeNull();
        expect(element.querySelector("p")?.textContent).toBe("Content");
    });
});
