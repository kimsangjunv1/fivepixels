import { describe, expect, it } from "vitest";
import { createMentionId, serializeMentionToken } from "@/types/mention.js";
import { parseMentionMessage, mentionMessageToPlainText, stripMentionTokensForEmptyCheck } from "@/utils/mention/elementMentions.js";

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
});
