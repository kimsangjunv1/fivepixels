import { createMentionId, MENTION_TOKEN_PATTERN, mentionPlainLabel, serializeMentionToken } from "../../types/mention.js";
import { isFeedbackTargetVisible, toPickSnapshot } from "../../utils/shared/dom.js";
const REPORT_HOST_ID = "fivepixels-root";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "SVG", "PATH"]);
const MAX_LABEL_LENGTH = 48;
const MAX_CANDIDATES = 12;
function normalizeLabel(text) {
    return text.replace(/\s+/g, " ").trim();
}
function truncateLabel(text) {
    if (text.length <= MAX_LABEL_LENGTH) {
        return text;
    }
    return `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`;
}
function isInsideFivePixelsHost(element) {
    const host = document.getElementById(REPORT_HOST_ID);
    return Boolean(host && (host === element || host.contains(element)));
}
function isUsefulMentionElement(element) {
    if (SKIP_TAGS.has(element.tagName)) {
        return false;
    }
    if (element.isContentEditable) {
        return false;
    }
    if (element.closest("[data-fivepixels-interactive], [data-fivepixels-host]")) {
        return false;
    }
    if (isInsideFivePixelsHost(element)) {
        return false;
    }
    if (!isFeedbackTargetVisible(element)) {
        return false;
    }
    return true;
}
function collectDirectText(element) {
    let text = "";
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent ?? "";
        }
    }
    return normalizeLabel(text);
}
export function buildElementMentionFromElement(element, labelOverride) {
    if (!isUsefulMentionElement(element)) {
        return null;
    }
    const snapshot = toPickSnapshot(element);
    if (!snapshot) {
        return null;
    }
    const label = truncateLabel(labelOverride ?? collectDirectText(element) ?? normalizeLabel(element.innerText || element.textContent || ""));
    if (!label) {
        return null;
    }
    return {
        id: createMentionId(),
        label,
        targetSelector: snapshot.targetSelector ?? null,
        reportId: snapshot.isTagged ? snapshot.id : null,
        suggestedReportId: snapshot.suggestedReportId ?? null,
        element,
        snapshot,
    };
}
export function findElementMentionCandidates(query, limit = MAX_CANDIDATES) {
    const normalizedQuery = normalizeLabel(query).toLowerCase();
    const matches = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
        const element = node;
        const directText = collectDirectText(element);
        if (directText) {
            const candidate = buildElementMentionFromElement(element, directText);
            if (candidate) {
                const key = `${candidate.targetSelector ?? ""}::${candidate.reportId ?? ""}::${candidate.label}`;
                if (!seen.has(key) && (!normalizedQuery || candidate.label.toLowerCase().includes(normalizedQuery))) {
                    seen.add(key);
                    matches.push(candidate);
                    if (matches.length >= limit * 3) {
                        break;
                    }
                }
            }
        }
        node = walker.nextNode();
    }
    const ranked = matches.sort((left, right) => {
        const leftLabel = left.label.toLowerCase();
        const rightLabel = right.label.toLowerCase();
        const leftStarts = normalizedQuery && leftLabel.startsWith(normalizedQuery) ? 0 : 1;
        const rightStarts = normalizedQuery && rightLabel.startsWith(normalizedQuery) ? 0 : 1;
        if (leftStarts !== rightStarts) {
            return leftStarts - rightStarts;
        }
        return leftLabel.length - rightLabel.length;
    });
    return ranked.slice(0, limit);
}
export function resolveMentionElement(mention) {
    if (mention.reportId) {
        try {
            const tagged = document.querySelector(`[data-report-id="${CSS.escape(mention.reportId)}"]`);
            if (tagged) {
                return tagged;
            }
        }
        catch {
            // ignore invalid selectors
        }
    }
    if (mention.targetSelector) {
        try {
            return document.querySelector(mention.targetSelector);
        }
        catch {
            return null;
        }
    }
    return null;
}
export function resolveMentionSnapshot(mention) {
    const element = resolveMentionElement(mention);
    if (!element) {
        return null;
    }
    return toPickSnapshot(element);
}
export function parseMentionMessage(message, mentions = []) {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const parts = [];
    let lastIndex = 0;
    for (const match of message.matchAll(MENTION_TOKEN_PATTERN)) {
        const index = match.index ?? 0;
        const mentionId = match[1];
        const mention = mentionById.get(mentionId);
        if (index > lastIndex) {
            parts.push({ type: "text", value: message.slice(lastIndex, index) });
        }
        if (mention) {
            parts.push({ type: "mention", mention });
        }
        else {
            parts.push({ type: "text", value: match[0] });
        }
        lastIndex = index + match[0].length;
    }
    if (lastIndex < message.length) {
        parts.push({ type: "text", value: message.slice(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: "text", value: message }];
}
export function mentionMessageToPlainText(message, mentions = []) {
    return parseMentionMessage(message, mentions)
        .map((part) => (part.type === "text" ? part.value : mentionPlainLabel(part.mention)))
        .join("");
}
export function stripMentionTokensForEmptyCheck(message, mentions = []) {
    return mentionMessageToPlainText(message, mentions).trim();
}
export function toStoredMention(candidate) {
    return {
        id: candidate.id,
        label: candidate.label,
        targetSelector: candidate.targetSelector,
        reportId: candidate.reportId,
        suggestedReportId: candidate.suggestedReportId,
    };
}
export function insertMentionToken(message, cursor, atStart, mention) {
    const token = serializeMentionToken(mention.id);
    const nextMessage = `${message.slice(0, atStart)}${token} ${message.slice(cursor)}`;
    return {
        message: nextMessage,
        cursor: atStart + token.length + 1,
    };
}
//# sourceMappingURL=elementMentions.js.map