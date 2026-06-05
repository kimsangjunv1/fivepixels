import { createContext, useContext, type PropsWithChildren } from "react";

type PricingPlan = {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    highlights: string[];
    cta: string;
    featured?: boolean;
};

type ComparisonRow = {
    id: string;
    label: string;
    free: string;
    pro: string;
    team: string;
};

type PricingContextValue = {
    plans: PricingPlan[];
    comparison: ComparisonRow[];
    billingNote: string;
};

const PricingContext = createContext<PricingContextValue | null>(null);

const pricingValue: PricingContextValue = {
    plans: [
        {
            id: "pricing-plan-free",
            name: "Free",
            price: "₩0",
            period: "영구 무료",
            description: "개인 프로젝트와 빠른 PoC에 적합합니다.",
            highlights: ["로컬 저장", "기본 마커", "단일 프로젝트"],
            cta: "무료로 시작",
        },
        {
            id: "pricing-plan-pro",
            name: "Pro",
            price: "₩19,000",
            period: "월 / 사용자",
            description: "소규모 팀의 피드백 수집과 공유에 최적화되어 있습니다.",
            highlights: ["팀 공유", "커스텀 필드", "우선 지원"],
            cta: "Pro 시작하기",
            featured: true,
        },
        {
            id: "pricing-plan-team",
            name: "Team",
            price: "₩49,000",
            period: "월 / 5명 이상",
            description: "여러 프로덕트를 운영하는 팀을 위한 확장형 플랜입니다.",
            highlights: ["다중 프로젝트", "역할 기반 접근", "전담 온보딩"],
            cta: "영업팀 문의",
        },
    ],
    comparison: [
        { id: "compare-projects", label: "프로젝트 수", free: "1", pro: "5", team: "무제한" },
        { id: "compare-markers", label: "마커 복원", free: "기본", pro: "고급", team: "고급" },
        { id: "compare-fields", label: "커스텀 필드", free: "—", pro: "5개", team: "무제한" },
        { id: "compare-support", label: "지원", free: "커뮤니티", pro: "이메일", team: "전담" },
    ],
    billingNote: "모든 요금은 VAT 별도이며, 연간 결제 시 2개월 할인이 적용됩니다.",
};

export function PricingPageProvider({ children }: PropsWithChildren) {
    return <PricingContext.Provider value={pricingValue}>{children}</PricingContext.Provider>;
}

export function usePricingProvider() {
    const context = useContext(PricingContext);

    if (!context) {
        throw new Error("usePricingProvider must be used within PricingPageProvider");
    }

    return context;
}
