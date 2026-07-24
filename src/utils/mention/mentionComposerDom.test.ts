import { describe, expect, it } from "vitest";
import { serializeMentionToken } from "@/types/mention.js";
import { getAtQuery, replaceActiveMentionQuery } from "@/utils/mention/elementMentions.js";
import {
    MENTION_CARET_GUARD,
    renderMentionEditorContent,
    serializeMentionEditor,
    serializeMentionEditorBeforeCaret,
} from "@/utils/mention/mentionComposerDom.js";

function createEditor(html: string) {
    const root = document.createElement("div");
    root.innerHTML = html;
    return root;
}

function placeCaret(root: HTMLElement, node: Node, offset: number) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    return { node, offset };
}

describe("mentionComposerDom", () => {
    it("preserves newlines from block divs used by contentEditable Enter", () => {
        const root = createEditor("첫줄<div>둘째줄</div><div>셋째줄</div>");

        expect(serializeMentionEditor(root, []).message).toBe("첫줄\n둘째줄\n셋째줄");
    });

    it("treats empty div+br placeholders as a single trailing newline", () => {
        const root = createEditor("첫줄<div><br></div>");

        expect(serializeMentionEditor(root, []).message).toBe("첫줄\n");
    });

    it("preserves blank lines between block divs", () => {
        const root = createEditor("첫줄<div><br></div><div>셋째줄</div>");

        expect(serializeMentionEditor(root, []).message).toBe("첫줄\n\n셋째줄");
    });

    it("still serializes soft breaks from br tags", () => {
        const root = createEditor("첫줄<br>둘째줄");

        expect(serializeMentionEditor(root, []).message).toBe("첫줄\n둘째줄");
    });

    it("keeps newlines when a mention chip is present in a multiline draft", () => {
        const mention = {
            id: "m_hero",
            label: "Hero",
            targetSelector: null,
            reportId: "edge-hero",
            suggestedReportId: null,
        };
        const editor = createEditor("");
        editor.appendChild(document.createTextNode("첫줄"));
        const line2 = document.createElement("div");
        line2.appendChild(document.createTextNode("체크 "));
        const chip = document.createElement("span");
        chip.dataset.mentionId = mention.id;
        chip.textContent = "@Hero";
        line2.appendChild(chip);
        editor.appendChild(line2);

        expect(serializeMentionEditor(editor, [mention]).message).toBe(`첫줄\n체크 ${serializeMentionToken(mention.id)}`);
    });

    it("round-trips newlines through render then serialize", () => {
        const mention = {
            id: "m_hero",
            label: "Hero",
            targetSelector: null,
            reportId: "edge-hero",
            suggestedReportId: null,
        };
        const message = `첫줄\n둘째 ${serializeMentionToken(mention.id)}\n셋째`;
        const root = document.createElement("div");

        renderMentionEditorContent(root, message, [mention]);
        expect(serializeMentionEditor(root, [mention]).message).toBe(message);
    });

    it("detects @query at the start of a new block line before caret", () => {
        const root = createEditor("이전줄<div>@필</div>");
        const line = root.lastChild as HTMLElement;
        const text = line.firstChild as Text;
        const caret = placeCaret(root, text, text.textContent?.length ?? 0);
        const before = serializeMentionEditorBeforeCaret(root, [], caret);

        expect(before?.message).toBe("이전줄\n@필");
        expect(getAtQuery(before!.message)).toEqual({ query: "필", atOffsetInBefore: "이전줄\n".length });
    });

    it("detects a second @query after an existing mention chip on a prior line", () => {
        const mention = {
            id: "m_filter",
            label: "Filter",
            targetSelector: null,
            reportId: "filter",
            suggestedReportId: null,
        };
        const root = document.createElement("div");
        renderMentionEditorContent(root, `${serializeMentionToken(mention.id)} 벅킹\nㅂㅈ입ㅈ @이`, [mention]);

        // After render, last text node holds the active query line (may be split by br).
        const full = serializeMentionEditor(root, [mention]).message;
        expect(full).toBe(`${serializeMentionToken(mention.id)} 벅킹\nㅂㅈ입ㅈ @이`);

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let queryNode: Text | null = null;

        while (walker.nextNode()) {
            const current = walker.currentNode as Text;

            if ((current.textContent ?? "").includes("@이")) {
                queryNode = current;
            }
        }

        expect(queryNode).not.toBeNull();
        const caret = placeCaret(root, queryNode!, queryNode!.textContent!.length);
        const before = serializeMentionEditorBeforeCaret(root, [mention], caret);

        expect(before?.message).toBe(`${serializeMentionToken(mention.id)} 벅킹\nㅂㅈ입ㅈ @이`);
        expect(getAtQuery(before!.message)?.query).toBe("이");
    });

    it("renders caret guards so text can be typed before a leading chip", () => {
        const mention = {
            id: "m_filter",
            label: "Filter",
            targetSelector: null,
            reportId: "filter",
            suggestedReportId: null,
        };
        const root = document.createElement("div");
        renderMentionEditorContent(root, serializeMentionToken(mention.id), [mention]);

        expect(root.firstChild?.nodeType).toBe(Node.TEXT_NODE);
        expect(root.firstChild?.textContent).toBe(MENTION_CARET_GUARD);
        expect((root.childNodes[1] as HTMLElement).dataset.mentionId).toBe(mention.id);
        expect(root.childNodes[2]?.textContent).toBe(MENTION_CARET_GUARD);
    });

    it("replaces only the caret @query when multiple @ appear in the draft", () => {
        const mention = {
            id: "m_hero",
            label: "Hero",
            targetSelector: null,
            reportId: "edge-hero",
            suggestedReportId: null,
        };
        const message = "체크 @a 그리고 @b";
        const atOffset = "체크 @a 그리고 ".length;

        expect(replaceActiveMentionQuery(message, "b", mention, atOffset)).toBe(`체크 @a 그리고 ${serializeMentionToken("m_hero")} `);
    });
});
