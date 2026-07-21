import type { ReportAuthor, ReportIdentify } from "@/types/report.js";

export function resolveDefaultAuthorName(identify: ReportIdentify | undefined, authors: ReportAuthor[], selfName?: string) {
    if (identify?.name) {
        return identify.name;
    }

    return authors[0]?.name ?? selfName ?? "";
}
