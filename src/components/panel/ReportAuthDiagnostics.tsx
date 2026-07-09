import { useMemo, useState } from "react";
import { useReport } from "@/providers/reportContext.js";

const FIELD_LABELS: Record<"projectId" | "environment" | "authorId" | "authorName" | "publicKey", string> = {
    projectId: "projectId",
    environment: "environment",
    authorId: "authorId",
    authorName: "name",
    publicKey: "publicKey",
};

function maskValue(value: string | null, field: "projectId" | "environment" | "authorId" | "authorName" | "publicKey") {
    if (!value) {
        return "-";
    }

    if (field !== "publicKey") {
        return value;
    }

    if (value.length <= 32) {
        return value;
    }

    return `${value.slice(0, 24)}...${value.slice(-12)}`;
}

function reasonToDescription(reason: string) {
    const reasonMap: Record<string, string> = {
        "reviewer-key-not-enforced": "team.reviewers 공개키 강제가 꺼져 있습니다.",
        "missing-personal-key": "로컬 개인키가 없습니다.",
        "invalid-personal-key-format": "개인키 포맷이 손상되었거나 잘못되었습니다.",
        "project-mismatch": "개인키의 projectId가 현재 프로젝트와 다릅니다.",
        "environment-mismatch": "개인키의 environment가 현재 환경과 다릅니다.",
        "missing-team-author": "team.reviewers에서 개인키 authorId에 해당하는 작성자를 찾지 못했습니다.",
        "author-id-mismatch": "개인키 authorId와 team reviewer id가 다릅니다.",
        "author-name-mismatch": "개인키 이름과 team reviewer name이 다릅니다.",
        "missing-team-public-key": "team reviewer에 공개키가 비어 있습니다.",
        "public-key-mismatch": "team 공개키와 개인키에서 계산한 공개키가 다릅니다.",
        matched: "인증이 정상적으로 일치합니다.",
    };

    return reasonMap[reason] ?? reason;
}

export function ReportAuthDiagnostics() {
    const { messages, authDiagnostics } = useReport();
    const diagnostics = messages.authDiagnostics;
    const [copied, setCopied] = useState(false);
    const reasonText = useMemo(() => reasonToDescription(authDiagnostics.reason), [authDiagnostics.reason]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(authDiagnostics, null, 2));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
        } catch {
            setCopied(false);
        }
    };

    if (!authDiagnostics) {
        return (
            <section className="flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black600)]">{diagnostics.noData}</p>
            </section>
        );
    }

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] p-[12px]">
            <div className="flex items-center justify-between gap-[8px]">
                <h6 className="text-[13px] font-bold text-[var(--adaptive-black900)]">{diagnostics.title}</h6>
                <span
                    className={`rounded-full px-[8px] py-[2px] text-[11px] font-semibold ${
                        authDiagnostics.status === "matched"
                            ? "bg-[color-mix(in_srgb,var(--adaptive-green500)_18%,transparent)] text-[var(--adaptive-green500)]"
                            : authDiagnostics.status === "disabled"
                              ? "bg-[var(--adaptive-black200)] text-[var(--adaptive-black600)]"
                              : "bg-rose-100 text-rose-700"
                    }`}
                >
                    {authDiagnostics.status === "matched"
                        ? diagnostics.statusMatched
                        : authDiagnostics.status === "disabled"
                          ? "키 강제 꺼짐"
                          : diagnostics.statusFailed}
                </span>
            </div>
            <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{diagnostics.description}</p>

            <div className="mt-[10px] rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[10px]">
                <p className="text-[11px] font-semibold text-[var(--adaptive-black500)]">{diagnostics.reason}</p>
                <p className="mt-[4px] break-all text-[12px] text-[var(--adaptive-black800)]">{reasonText}</p>
                <p className="mt-[2px] break-all text-[11px] text-[var(--adaptive-black500)]">{authDiagnostics.reason}</p>
            </div>

            <div className="mt-[10px] overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)]">
                <div className="grid grid-cols-[112px_1fr_1fr_52px] border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[8px] py-[6px] text-[11px] font-semibold text-[var(--adaptive-black600)]">
                    <p>{diagnostics.field}</p>
                    <p>{diagnostics.expected}</p>
                    <p>{diagnostics.actual}</p>
                    <p className="text-right">OK</p>
                </div>
                {authDiagnostics.items.map((item) => (
                    <div
                        key={item.field}
                        className="grid grid-cols-[112px_1fr_1fr_52px] items-start gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[8px] py-[8px] text-[12px] last:border-b-0"
                    >
                        <p className="font-semibold text-[var(--adaptive-black700)]">{FIELD_LABELS[item.field]}</p>
                        <p className="break-all text-[var(--adaptive-black800)]">{maskValue(item.expected, item.field)}</p>
                        <p className="break-all text-[var(--adaptive-black800)]">{maskValue(item.actual, item.field)}</p>
                        <p className={`text-right font-semibold ${item.matched ? "text-[var(--adaptive-green500)]" : "text-rose-700"}`}>{item.matched ? "✓" : "✗"}</p>
                    </div>
                ))}
            </div>

            <div className="mt-[10px] flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                >
                    {copied ? diagnostics.copiedJson : diagnostics.copyJson}
                </button>
            </div>
        </section>
    );
}
