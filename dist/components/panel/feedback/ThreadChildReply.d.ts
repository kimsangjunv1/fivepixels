import type { ReportReply } from "../../../types/report.js";
import type { ReportLocale } from "../../../i18n/types.js";
type ThreadChildReplyProps = {
    reply: ReportReply;
    originalAuthorName: string;
    locale: ReportLocale;
    threadReplyPrefix: string;
};
export declare function ThreadChildReply({ reply, originalAuthorName, locale, threadReplyPrefix }: ThreadChildReplyProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ThreadChildReply.d.ts.map