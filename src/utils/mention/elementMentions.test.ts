import { describe, expect, it } from "vitest";
import { createMentionId, serializeMentionToken } from "@/types/mention.js";
import {
    parseMentionMessage,
    mentionMessageToPlainText,
    stripMentionTokensForEmptyCheck,
    getAtQuery,
    resolveActiveMentionQuery,
    replaceActiveMentionQuery,
} from "@/utils/mention/elementMentions.js";

describe("elementMentions", () => {
    it("parses mention tokens into message parts", () => {
        const mention = {
            id: "m_test",
            label: "컨테이너",
            targetSelector: "#box",
            reportId: null,
            suggestedReportId: "suggested-1",
        };

        const message = `혹시 ${serializeMentionToken(mention.id)} 확인해줘`;
        const parts = parseMentionMessage(message, [mention]);

        expect(parts).toEqual([
            { type: "text", value: "혹시 " },
            { type: "mention", mention },
            { type: "text", value: " 확인해줘" },
        ]);
        expect(mentionMessageToPlainText(message, [mention])).toBe("혹시 @컨테이너 확인해줘");
    });

    it("treats mention-only drafts as non-empty", () => {
        const mentionId = createMentionId();
        const message = serializeMentionToken(mentionId);

        expect(stripMentionTokensForEmptyCheck(message, [{ id: mentionId, label: "버튼", targetSelector: null, reportId: "btn", suggestedReportId: null }])).toBe("@버튼");
        expect(stripMentionTokensForEmptyCheck("   ", [])).toBe("");
    });

    it("detects @query at the end of text", () => {
        expect(getAtQuery("@")).toEqual({ query: "", atOffsetInBefore: 0 });
        expect(getAtQuery("안녕 @")).toEqual({ query: "", atOffsetInBefore: 3 });
        expect(getAtQuery("안녕 @hero")).toEqual({ query: "hero", atOffsetInBefore: 3 });
        expect(getAtQuery("안녕")).toBeNull();
        expect(getAtQuery(`안녕 ${serializeMentionToken("m_1")}`)).toBeNull();
        expect(getAtQuery(`안녕 ${serializeMentionToken("m_1")} @`)).toEqual({ query: "", atOffsetInBefore: `안녕 ${serializeMentionToken("m_1")} `.length });
    });

    it("falls back to serialized message when caret text is unavailable", () => {
        expect(resolveActiveMentionQuery({ textBeforeCaret: null, serializedMessage: "hello @" })).toEqual({
            query: "",
            atOffsetInBefore: 6,
        });
        expect(resolveActiveMentionQuery({ textBeforeCaret: "hello", serializedMessage: "hello @" })).toBeNull();
        expect(resolveActiveMentionQuery({ textBeforeCaret: "hello @x", serializedMessage: "stale" })).toEqual({
            query: "x",
            atOffsetInBefore: 6,
        });
    });

    it("replaces the active @query with a mention token", () => {
        const mention = {
            id: "m_hero",
            label: "Hero banner",
            targetSelector: null,
            reportId: "edge-hero-banner",
            suggestedReportId: null,
        };

        expect(replaceActiveMentionQuery("체크 @hero", "hero", mention)).toBe(`체크 ${serializeMentionToken("m_hero")} `);
        expect(replaceActiveMentionQuery("체크 @", "", mention)).toBe(`체크 ${serializeMentionToken("m_hero")} `);
        expect(replaceActiveMentionQuery("체크", "hero", mention)).toBeNull();
    });
});
