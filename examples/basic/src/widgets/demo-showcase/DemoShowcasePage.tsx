import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FIVE_PIXELS_DEMO_SCENES, FivePixelsDemo, type FivePixelsDemoScene } from "@fivepixels-js/react/demo";

type Locale = "ko" | "en";

type SceneCopy = {
    title: string;
    where: string;
    how: string;
};

type ShowcaseCopy = {
    language: string;
    header: { badge: string; title: string; description: string };
    labels: { where: string; how: string; usage: string };
    features: Record<FivePixelsDemoScene, SceneCopy>;
    footer: string;
};

const LOCALES = ["ko", "en"] as const;

const COPY: Record<Locale, ShowcaseCopy> = {
    ko: {
        language: "언어",
        header: {
            badge: "Demo catalog",
            title: "FivePixels 데모 UI 카탈로그",
            description: "제품에 들어가는 인터랙티브 데모 장면을 한눈에 보고, 사용처와 임베드 방법을 확인하세요.",
        },
        labels: { where: "어디에 쓰이나요", how: "어떻게 쓰나요", usage: "사용 코드" },
        features: {
            "marker-tooltip": {
                title: "마커 툴팁",
                where: "화면 위 피드백 마커를 눌렀을 때 요약 정보를 보여주는 오버레이",
                how: "마커를 눌러 열고 닫으며, 케이스 요약과 상태를 확인합니다.",
            },
            "feedback-composer": {
                title: "피드백 작성기",
                where: "새 피드백 케이스를 만들 때 쓰는 작성 툴팁",
                how: "메시지를 입력하고 카테고리를 고른 뒤 케이스를 생성합니다.",
            },
            "memo-composer": {
                title: "메모 작성기",
                where: "정식 피드백 전에 화면 위에 가볍게 남기는 메모 작성 UI",
                how: "메모를 입력하고 저장해 페이지 맥락에 붙입니다.",
            },
            "panel-overview": {
                title: "패널 개요",
                where: "우측/하단 패널의 기본 개요 화면",
                how: "상단 탭과 필터를 전환하며 현재 페이지 활동을 살펴봅니다.",
            },
            "network-monitor": {
                title: "네트워크 모니터",
                where: "패널의 API 흐름 탭",
                how: "성공/실패 필터를 바꾸고 요청 상세를 열어 응답을 확인합니다.",
            },
            "memo-list": {
                title: "메모 목록",
                where: "패널의 메모 리스트 탭",
                how: "메모를 검색하고 항목을 선택해 해당 화면 맥락으로 돌아갑니다.",
            },
            "element-inspector": {
                title: "UI Edit 인스펙터",
                where: "요소를 집어 수정 요청을 남길 때 쓰는 비교/편집 툴팁",
                how: "여백·색상 값을 바꾸고 Before/After를 비교합니다.",
            },
            "device-preview": {
                title: "디바이스 프리뷰",
                where: "모바일 기기 프레임으로 같은 화면을 검토하는 플로팅 윈도우",
                how: "iPhone과 Galaxy 프레임을 전환하며 레이아웃을 확인합니다.",
            },
            "feedback-thread": {
                title: "피드백 스레드",
                where: "케이스 대화·담당·답변을 관리하는 피드백 윈도우",
                how: "대화를 선택하고 답변을 남겨 상태를 이어갑니다.",
            },
            settings: {
                title: "설정",
                where: "패널 설정 탭의 기본 프로젝트 설정",
                how: "테마와 마커 모양·크기를 바꿔 팀 표현을 맞춥니다.",
            },
            "settings-customization": {
                title: "커스터마이징 설정",
                where: "설정 > 외형 카테고리의 세부 커스터마이징",
                how: "테마, 스레드, 피드백 점, 마커 형태·색상·글꼴을 조정합니다.",
            },
            notifications: {
                title: "알림 센터",
                where: "편집 모드·오류·숨겨진 마커·새 활동을 모은 알림 윈도우",
                how: "알림 항목을 선택해 관련 상태로 이동합니다.",
            },
        },
        footer: "실제 FivePixels 컴포넌트와 격리된 데모 데이터로 구성된 카탈로그입니다.",
    },
    en: {
        language: "Language",
        header: {
            badge: "Demo catalog",
            title: "FivePixels demo UI catalog",
            description: "Browse every interactive demo scene at a glance, with where it appears and how to embed it.",
        },
        labels: { where: "Where it’s used", how: "How to use it", usage: "Usage" },
        features: {
            "marker-tooltip": {
                title: "Marker tooltip",
                where: "Overlay summary that opens when a feedback marker is pressed on the page",
                how: "Press the marker to open and close it, then review the case summary.",
            },
            "feedback-composer": {
                title: "Feedback composer",
                where: "Composer tooltip used when creating a new feedback case",
                how: "Type a message, pick a category, and create the case in place.",
            },
            "memo-composer": {
                title: "Memo composer",
                where: "Lightweight memo UI for notes before formal feedback",
                how: "Write a memo and save it onto the page context.",
            },
            "panel-overview": {
                title: "Panel overview",
                where: "Default overview surface inside the product panel",
                how: "Switch tabs and filters to scan current page activity.",
            },
            "network-monitor": {
                title: "Network monitor",
                where: "API flow tab inside the panel",
                how: "Filter success/failure requests and open details.",
            },
            "memo-list": {
                title: "Memo list",
                where: "Memo list tab inside the panel",
                how: "Search memos and select an item to return to its context.",
            },
            "element-inspector": {
                title: "UI Edit inspector",
                where: "Compare/edit tooltip used when requesting UI changes on a picked element",
                how: "Change spacing or color values, then compare Before and After.",
            },
            "device-preview": {
                title: "Device preview",
                where: "Floating window for reviewing the same page in mobile frames",
                how: "Switch between iPhone and Galaxy frames.",
            },
            "feedback-thread": {
                title: "Feedback thread",
                where: "Feedback window for cases, replies, and ownership",
                how: "Select a thread and leave a reply to continue the conversation.",
            },
            settings: {
                title: "Settings",
                where: "Base project settings in the panel settings tab",
                how: "Change theme, marker shape, and size.",
            },
            "settings-customization": {
                title: "Customization settings",
                where: "Appearance category under settings for finer visual control",
                how: "Adjust theme, thread behavior, dots, marker form, colors, and typography.",
            },
            notifications: {
                title: "Notification center",
                where: "Notification window for edit mode, errors, hidden markers, and new activity",
                how: "Select a notification item to jump to the related state.",
            },
        },
        footer: "Built with real FivePixels components and isolated demo data.",
    },
};

function ScaleToFit({ children }: { children: ReactNode }) {
    const frameRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const frame = frameRef.current;
        const content = contentRef.current;
        if (!frame || !content) return;

        const update = () => {
            const frameWidth = frame.clientWidth;
            const frameHeight = frame.clientHeight;
            const contentWidth = content.offsetWidth;
            const contentHeight = content.offsetHeight;
            if (frameWidth < 2 || frameHeight < 2 || contentWidth < 2 || contentHeight < 2) return;

            const nextScale = Math.min(1, frameWidth / contentWidth, frameHeight / contentHeight);
            setScale((current) => (Math.abs(current - nextScale) < 0.001 ? current : nextScale));
        };

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(update);
        });
        observer.observe(frame);
        observer.observe(content);
        update();
        const raf = requestAnimationFrame(update);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div className="demo-showcase__card-stage">
            <div ref={frameRef} className="demo-showcase__card-frame">
                <div
                    ref={contentRef}
                    className="demo-showcase__card-scale"
                    style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export function DemoShowcasePage() {
    const [locale, setLocale] = useState<Locale>("ko");
    const copy = COPY[locale];

    return (
        <main className="demo-showcase" id="top">
            <div className="demo-showcase__shell">
                <header className="demo-showcase__header">
                    <div className="demo-showcase__header-copy">
                        <span className="demo-showcase__badge">
                            <span aria-hidden="true" />
                            {copy.header.badge}
                        </span>
                        <h1>{copy.header.title}</h1>
                        <p>{copy.header.description}</p>
                    </div>
                    <div className="demo-showcase__locale" role="group" aria-label={copy.language}>
                        {LOCALES.map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={locale === option}
                                onClick={() => setLocale(option)}
                            >
                                {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </header>

                <section className="demo-showcase__grid" aria-label={copy.header.title}>
                    {FIVE_PIXELS_DEMO_SCENES.map((scene) => {
                        const feature = copy.features[scene];

                        return (
                            <article key={scene} className="demo-showcase__card" id={scene}>
                                <div className="demo-showcase__card-inner">
                                    <ScaleToFit>
                                        <FivePixelsDemo scene={scene} locale={locale} />
                                    </ScaleToFit>
                                    <div className="demo-showcase__card-meta">
                                        <div className="demo-showcase__card-title">
                                            <h2>{feature.title}</h2>
                                            <code>{scene}</code>
                                        </div>
                                        <dl>
                                            <div>
                                                <dt>{copy.labels.where}</dt>
                                                <dd>{feature.where}</dd>
                                            </div>
                                            <div>
                                                <dt>{copy.labels.how}</dt>
                                                <dd>{feature.how}</dd>
                                            </div>
                                            <div>
                                                <dt>{copy.labels.usage}</dt>
                                                <dd>
                                                    <code>{`<FivePixelsDemo scene="${scene}" locale="${locale}" />`}</code>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <footer className="demo-showcase__footer">
                    <a className="demo-showcase__brand" href="#top">
                        <span>fp.</span>fivepixels
                    </a>
                    <p>{copy.footer}</p>
                </footer>
            </div>
        </main>
    );
}
