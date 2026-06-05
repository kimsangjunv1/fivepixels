import { createContext, useContext, type PropsWithChildren } from "react";

type HeroAction = {
    id: string;
    label: string;
    variant: "primary-button" | "ghost-button";
};

type FeatureItem = {
    id: string;
    title: string;
    description: string;
    cta: string;
};

type LandingContextValue = {
    heroActions: HeroAction[];
    features: FeatureItem[];
    bottomCta: {
        id: string;
        title: string;
        description: string;
        primaryLabel: string;
        secondaryLabel: string;
        secondaryPath: string;
    };
};

const LandingContext = createContext<LandingContextValue | null>(null);

const landingValue: LandingContextValue = {
    heroActions: [
        { id: "landing-hero-start", label: "무료로 시작하기", variant: "primary-button" },
        { id: "landing-hero-demo", label: "데모 보기", variant: "ghost-button" },
    ],
    features: [
        {
            id: "landing-feature-collect",
            title: "DOM 기반 피드백 수집",
            description: "클릭한 요소에 마커를 남기고 팀과 바로 공유할 수 있습니다.",
            cta: "수집 방식 보기",
        },
        {
            id: "landing-feature-restore",
            title: "안정적인 마커 복원",
            description: "dataset 기준으로 DOM을 다시 찾아 피드백 위치를 계산합니다.",
            cta: "복원 방식 보기",
        },
        {
            id: "landing-feature-local",
            title: "설정 없이 시작",
            description: "로컬 저장소 기반으로 빠르게 동작 확인이 가능합니다.",
            cta: "가이드 보기",
        },
        {
            id: "landing-feature-team",
            title: "팀 협업 워크플로",
            description: "생성 · 조회 · 수정 흐름을 한 화면에서 확인할 수 있습니다.",
            cta: "워크플로 보기",
        },
    ],
    bottomCta: {
        id: "landing-bottom-cta",
        title: "팀 피드백을 더 빠르게",
        description: "요금제를 확인하고 바로 시작하거나 문의를 남겨보세요.",
        primaryLabel: "요금제 보기",
        secondaryLabel: "문의하기",
        secondaryPath: "/contact",
    },
};

export function LandingPageProvider({ children }: PropsWithChildren) {
    return <LandingContext.Provider value={landingValue}>{children}</LandingContext.Provider>;
}

export function useLandingProvider() {
    const context = useContext(LandingContext);

    if (!context) {
        throw new Error("useLandingProvider must be used within LandingPageProvider");
    }

    return context;
}
