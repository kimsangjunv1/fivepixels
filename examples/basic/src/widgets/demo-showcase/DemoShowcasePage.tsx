import { useState } from "react";
import { FIVE_PIXELS_DEMO_SCENES, FivePixelsDemo, type FivePixelsDemoScene } from "@fivepixels-js/react/demo";

type Locale = "ko" | "en";

const COPY: Record<Locale, { eyebrow: string; title: string; description: string; language: string; features: Record<FivePixelsDemoScene, { title: string; description: string }> }> = {
    ko: {
        eyebrow: "Interactive UI",
        title: "FivePixels의 모든 순간을 직접 확인하세요",
        description: "배경 화면 없이 실제 제품 UI와 대표 상태만 모았습니다. 버튼과 탭, 입력창을 직접 조작해보세요.",
        language: "언어",
        features: {
            "marker-tooltip": { title: "맥락 위에 남는 마커", description: "마커를 눌러 피드백 요약을 열고 닫을 수 있습니다." },
            "feedback-composer": { title: "빠르게 작성하는 피드백", description: "내용과 카테고리를 선택하고 작성 흐름을 체험합니다." },
            "panel-overview": { title: "한눈에 보는 프로젝트 상태", description: "활동 통계와 네트워크 요청을 탭으로 전환합니다." },
            "element-inspector": { title: "말 대신 보여주는 UI Edit", description: "선택 요소의 정보와 여백, 색상 변경을 확인합니다." },
            "device-preview": { title: "기기별로 바로 확인", description: "iPhone과 Galaxy 프레임을 즉시 전환합니다." },
            "feedback-thread": { title: "맥락이 이어지는 대화", description: "케이스, 답변, 담당 상태를 하나의 창에서 관리합니다." },
            settings: { title: "프로젝트에 맞는 표현", description: "테마와 마커 모양, 크기를 직접 선택합니다." },
            notifications: { title: "놓치지 않는 상태 변화", description: "편집 모드, 오류, 숨겨진 마커와 알림을 보여줍니다." },
        },
    },
    en: {
        eyebrow: "Interactive UI",
        title: "Explore every moment of FivePixels",
        description: "Real product surfaces and representative states, without a background app. Try the controls, tabs, and inputs.",
        language: "Language",
        features: {
            "marker-tooltip": { title: "Markers that keep context", description: "Open and close the feedback summary from its marker." },
            "feedback-composer": { title: "Fast, focused feedback", description: "Write a message, choose a category, and try the creation flow." },
            "panel-overview": { title: "Project status at a glance", description: "Switch between activity stats and network requests." },
            "element-inspector": { title: "Show changes with UI Edit", description: "Inspect an element and adjust spacing or color." },
            "device-preview": { title: "Review across devices", description: "Switch instantly between iPhone and Galaxy frames." },
            "feedback-thread": { title: "Conversations with context", description: "Manage cases, replies, and ownership in one window." },
            settings: { title: "Make it fit your project", description: "Choose the theme, marker shape, and marker size." },
            notifications: { title: "Stay on top of changes", description: "See edit mode, errors, hidden markers, and activity alerts." },
        },
    },
};

export function DemoShowcasePage() {
    const [locale, setLocale] = useState<Locale>("ko");
    const copy = COPY[locale];

    return (
        <main className="demo-showcase">
            <header className="demo-showcase__hero">
                <div>
                    <span className="demo-showcase__eyebrow">{copy.eyebrow}</span>
                    <h1>{copy.title}</h1>
                    <p>{copy.description}</p>
                </div>
                <div className="demo-showcase__locale" role="group" aria-label={copy.language}>
                    {(["ko", "en"] as const).map((option) => (
                        <button key={option} type="button" aria-pressed={locale === option} onClick={() => setLocale(option)}>
                            {option.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="demo-showcase__features">
                {FIVE_PIXELS_DEMO_SCENES.map((scene, index) => {
                    const feature = copy.features[scene];

                    return (
                        <section key={scene} className={`demo-showcase__feature ${index % 2 === 1 ? "demo-showcase__feature--reverse" : ""}`}>
                            <div className="demo-showcase__copy">
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h2>{feature.title}</h2>
                                <p>{feature.description}</p>
                                <code>{`<FivePixelsDemo scene="${scene}" locale="${locale}" />`}</code>
                            </div>
                            <div className="demo-showcase__demo">
                                <FivePixelsDemo scene={scene} locale={locale} />
                            </div>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}
