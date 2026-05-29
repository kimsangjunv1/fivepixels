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

type BasicContextValue = {
    steps: string[];
    note: string;
    heroActions: HeroAction[];
    features: FeatureItem[];
};

const BasicContext = createContext<BasicContextValue | null>(null);

const basicValue: BasicContextValue = {
    steps: [
        "우측 상단의 Report 버튼을 눌러 리포트 모드로 전환합니다.",
        "아래 카드나 버튼을 클릭해서 피드백을 생성합니다.",
        "생성된 마커를 눌러 목록과 수정 흐름을 확인합니다.",
    ],
    note: "Vite 개발 서버가 src 엔트리를 직접 불러오므로 라이브러리 수정 후 바로 새로고침해서 확인할 수 있습니다.",
    heroActions: [
        { id: "hero-primary-cta", label: "무료로 시작하기", variant: "primary-button" },
        { id: "hero-secondary-cta", label: "데모 보기", variant: "ghost-button" },
    ],
    features: [
        {
            id: "feature-setup-link",
            title: "설정 없이 시작",
            description: "로컬 저장소 기반으로 빠르게 동작 확인이 가능합니다.",
            cta: "가이드 보기",
        },
        {
            id: "feature-anchor-link",
            title: "안정적인 마커 복원",
            description: "dataset 기준으로 DOM을 다시 찾아 피드백 위치를 계산합니다.",
            cta: "복원 방식 보기",
        },
    ],
};

export function BasicPageProvider({ children }: PropsWithChildren) {
    return <BasicContext.Provider value={basicValue}>{children}</BasicContext.Provider>;
}

export function useBasicProvider() {
    const context = useContext(BasicContext);

    if (!context) {
        throw new Error("useBasicProvider must be used within BasicPageProvider");
    }

    return context;
}
