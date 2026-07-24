import type { ElementMention } from "@/types/mention.js";
import { mentionPlainLabel, serializeMentionToken } from "@/types/mention.js";
import { parseMentionMessage } from "@/utils/mention/elementMentions.js";

const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
export const MENTION_CARET_GUARD = "\u200B";

export const MENTION_CHIP_CLASS =
    "mx-[1px] inline-flex items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue600)] align-baseline";

export type EditorCaretPoint = {
    node: Node;
    offset: number;
};

function normalizeEditorText(text: string) {
    return text.replace(/\u200B/g, "").replace(/\u00A0/g, " ");
}

function isIgnorableText(node: Node) {
    if (node.nodeType !== Node.TEXT_NODE) {
        return false;
    }

    return !normalizeEditorText(node.textContent ?? "");
}

/** Empty contenteditable blocks often contain only a caret placeholder <br>. */
function isBlockPlaceholder(element: HTMLElement) {
    const children = Array.from(element.childNodes).filter((node) => !isIgnorableText(node));

    if (children.length === 0) {
        return true;
    }

    return children.every((node) => node instanceof HTMLElement && node.tagName === "BR");
}

function appendChip(parent: HTMLElement, mention: ElementMention, chipClassName: string) {
    // ZWSP guards let the caret sit before/after contentEditable=false chips.
    parent.appendChild(document.createTextNode(MENTION_CARET_GUARD));

    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.mentionId = mention.id;
    chip.className = chipClassName;
    chip.textContent = mentionPlainLabel(mention);
    parent.appendChild(chip);

    parent.appendChild(document.createTextNode(MENTION_CARET_GUARD));
}

function serializeEditorTree(root: HTMLElement, mentions: ElementMention[], end: EditorCaretPoint | null) {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const used: ElementMention[] = [];
    let message = "";
    let hasContent = false;
    let stopped = false;

    const visit = (node: Node) => {
        if (stopped) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.textContent ?? "";

            if (end && node === end.node) {
                message += normalizeEditorText(raw.slice(0, Math.max(0, end.offset)));
                hasContent = message.length > 0 || hasContent;
                stopped = true;
                return;
            }

            const text = normalizeEditorText(raw);

            if (!text) {
                return;
            }

            message += text;
            hasContent = true;
            return;
        }

        if (!(node instanceof HTMLElement)) {
            return;
        }

        const mentionId = node.dataset.mentionId;

        if (mentionId) {
            if (end && (node === end.node || node.contains(end.node))) {
                // Caret on/inside a chip → treat as after the token for query/replace.
                const mention = mentionById.get(mentionId);

                if (mention) {
                    message += serializeMentionToken(mention.id);
                    used.push(mention);
                } else {
                    message += normalizeEditorText(node.textContent ?? "");
                }

                hasContent = true;
                stopped = true;
                return;
            }

            const mention = mentionById.get(mentionId);

            if (mention) {
                message += serializeMentionToken(mention.id);
                used.push(mention);
            } else {
                message += normalizeEditorText(node.textContent ?? "");
            }

            hasContent = true;
            return;
        }

        if (node.tagName === "BR") {
            message += "\n";
            hasContent = true;
            return;
        }

        if (BLOCK_TAGS.has(node.tagName)) {
            if (hasContent) {
                message += "\n";
            }

            if (isBlockPlaceholder(node)) {
                hasContent = true;

                if (end && (node === end.node || node.contains(end.node))) {
                    stopped = true;
                }

                return;
            }

            visitChildren(node);
            hasContent = true;
            return;
        }

        visitChildren(node);
    };

    const visitChildren = (element: HTMLElement) => {
        const children = Array.from(element.childNodes);

        for (let index = 0; index < children.length; index += 1) {
            if (stopped) {
                return;
            }

            if (end && end.node === element && end.offset === index) {
                stopped = true;
                return;
            }

            visit(children[index]!);

            if (stopped) {
                return;
            }
        }

        if (end && end.node === element && end.offset >= children.length) {
            stopped = true;
        }
    };

    visitChildren(root);

    const uniqueUsed = Array.from(new Map(used.map((item) => [item.id, item])).values());

    return { message, mentions: uniqueUsed };
}

/**
 * Serialize contentEditable HTML into a plain mention draft.
 * Chrome/Safari often insert Enter as block <div>s instead of <br>, so block boundaries become `\n`.
 * A trailing/empty `<div><br></div>` is a block break only — the inner BR is a caret placeholder, not an extra line.
 */
export function serializeMentionEditor(root: HTMLElement, mentions: ElementMention[]) {
    return serializeEditorTree(root, mentions, null);
}

/** Same rules as full serialize, but only content before the current caret. */
export function serializeMentionEditorBeforeCaret(root: HTMLElement, mentions: ElementMention[], caret: EditorCaretPoint | null) {
    if (!caret) {
        return null;
    }

    return serializeEditorTree(root, mentions, caret);
}

export function getEditorCaretPoint(root: HTMLElement): EditorCaretPoint | null {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.anchorNode || !root.contains(selection.anchorNode)) {
        return null;
    }

    const range = selection.getRangeAt(0);

    return {
        node: range.endContainer,
        offset: range.endOffset,
    };
}

export function getCaretClientRect(root: HTMLElement): DOMRect | null {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.anchorNode || !root.contains(selection.anchorNode)) {
        return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    const rects = range.getClientRects();
    const rect = rects.item(rects.length - 1) ?? range.getBoundingClientRect();

    if (!rect || (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0)) {
        return null;
    }

    return rect;
}

export function renderMentionEditorContent(root: HTMLElement, message: string, mentions: ElementMention[], chipClassName = MENTION_CHIP_CLASS) {
    root.replaceChildren();
    const parts = parseMentionMessage(message, mentions);

    for (const part of parts) {
        if (part.type === "text") {
            const lines = part.value.split("\n");

            lines.forEach((line, index) => {
                if (line) {
                    root.appendChild(document.createTextNode(line));
                }

                if (index < lines.length - 1) {
                    root.appendChild(document.createElement("br"));
                }
            });
            continue;
        }

        appendChip(root, part.mention, chipClassName);
    }
}

export function placeCaretAfterMention(editor: HTMLElement, mentionId: string) {
    const selection = window.getSelection();
    const chip = editor.querySelector(`[data-mention-id="${CSS.escape(mentionId)}"]`);

    if (!selection) {
        return;
    }

    const range = document.createRange();

    if (chip?.nextSibling?.nodeType === Node.TEXT_NODE) {
        const text = chip.nextSibling;
        const offset = Math.min(1, text.textContent?.length ?? 0);
        range.setStart(text, offset);
        range.collapse(true);
    } else if (chip) {
        range.setStartAfter(chip);
        range.collapse(true);
    } else {
        range.selectNodeContents(editor);
        range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
}

/** Remove the nearest mention chip behind a collapsed caret (Backspace). */
export function deleteMentionChipBeforeCaret(editor: HTMLElement, mentions: ElementMention[]) {
    const caret = getEditorCaretPoint(editor);

    if (!caret) {
        return null;
    }

    let probe: Node | null = null;

    if (caret.node.nodeType === Node.TEXT_NODE) {
        const text = caret.node.textContent ?? "";
        const before = normalizeEditorText(text.slice(0, caret.offset));

        if (before.length > 0) {
            return null;
        }

        probe = caret.node.previousSibling;
    } else if (caret.node instanceof HTMLElement) {
        probe = caret.node.childNodes.item(Math.max(0, caret.offset - 1));
    }

    while (probe && probe.nodeType === Node.TEXT_NODE && isIgnorableText(probe)) {
        probe = probe.previousSibling;
    }

    if (!(probe instanceof HTMLElement) || !probe.dataset.mentionId) {
        return null;
    }

    const mentionId = probe.dataset.mentionId;
    const before = probe.previousSibling;
    const after = probe.nextSibling;
    probe.remove();

    if (before?.nodeType === Node.TEXT_NODE && isIgnorableText(before)) {
        before.remove();
    }

    if (after?.nodeType === Node.TEXT_NODE && isIgnorableText(after)) {
        after.remove();
    }

    return serializeMentionEditor(editor, mentions.filter((item) => item.id !== mentionId));
}
