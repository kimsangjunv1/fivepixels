import type { CSSProperties } from "react";

/** Default atmosphere when no custom media is applied. */
export const CONCEPT_SHOT_STAGE_STYLE: CSSProperties = {
    backgroundColor: "#dbeafe",
    backgroundImage: [
        "radial-gradient(ellipse 70% 55% at 12% 30%, rgba(125, 211, 252, 0.95), transparent 60%)",
        "radial-gradient(ellipse 55% 50% at 78% 18%, rgba(196, 181, 253, 0.75), transparent 55%)",
        "radial-gradient(ellipse 60% 45% at 55% 85%, rgba(253, 230, 138, 0.7), transparent 55%)",
        "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 48%, #fef9c3 100%)",
    ].join(", "),
};

export type ConceptShotTab = {
    id: ConceptShotSceneId;
    label: string;
    caption: string;
    activeTargetId: string;
};

export type ConceptShotSceneId = "checkout" | "analytics" | "landing" | "mobile" | "incident" | "agent";

export const CONCEPT_SHOT_TABS: ConceptShotTab[] = [
    {
        id: "checkout",
        label: "Checkout review",
        caption: "Review conversion-critical checkout details with product, design, and engineering.",
        activeTargetId: "checkout-brand",
    },
    {
        id: "analytics",
        label: "Dashboard QA",
        caption: "Pin metric, chart, filter, and table issues directly to a live analytics dashboard.",
        activeTargetId: "analytics-revenue",
    },
    {
        id: "landing",
        label: "Landing review",
        caption: "Discuss copy, CTA hierarchy, social proof, and pricing in their visual context.",
        activeTargetId: "landing-primary-cta",
    },
    {
        id: "mobile",
        label: "Mobile check",
        caption: "Capture responsive UI feedback around balance, actions, chart, and navigation.",
        activeTargetId: "mobile-header",
    },
    {
        id: "incident",
        label: "Incident triage",
        caption: "Connect an API failure, latency spike, deploy, and logs in one debugging frame.",
        activeTargetId: "incident-status",
    },
    {
        id: "agent",
        label: "Campaign brief",
        caption: "Review an AI campaign analysis panel with sources and executive summary.",
        activeTargetId: "agent-thought",
    },
];

export function detectConceptMediaKind(source: string, mimeType?: string): "image" | "video" {
    if (mimeType?.startsWith("video/")) {
        return "video";
    }
    if (mimeType?.startsWith("image/")) {
        return "image";
    }

    const normalized = source.split("?")[0]?.toLowerCase() ?? "";
    if (/\.(mp4|webm|ogg|mov|m4v)$/.test(normalized)) {
        return "video";
    }
    return "image";
}
