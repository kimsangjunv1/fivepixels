import React from "react";
import { createRoot } from "react-dom/client";
import { Report } from "stitchable";

const e = React.createElement;

function App() {
    return e(
        React.Fragment,
        null,
        e(Report, {
            appearance: "light",
            pathname: "/examples/basic",
            fields: [
                { key: "message", type: "textarea", label: "메시지", required: true },
                { key: "isBug", type: "checkbox", label: "버그인가요?" },
                { key: "isImportant", type: "checkbox", label: "중요한가요?" },
            ],
        }),
        e(
            "div",
            { className: "example-shell" },
            e(
                "aside",
                { className: "example-panel" },
                e("p", { className: "example-eyebrow" }, "stitchable example"),
                e("h1", { className: "example-title" }, "기본 생성 · 조회 · 수정 흐름 데모"),
                e(
                    "ol",
                    { className: "example-steps" },
                    e("li", null, "우측 상단의 Report 버튼을 눌러 리포트 모드로 전환합니다."),
                    e("li", null, "아래 카드나 버튼을 클릭해서 피드백을 생성합니다."),
                    e("li", null, "생성된 마커를 눌러 목록과 수정 흐름을 확인합니다."),
                ),
                e(
                    "p",
                    { className: "example-note" },
                    "예제는 /dist 엔트리를 직접 사용하므로 라이브러리 수정 후 npm run build 뒤 새로고침하면 됩니다.",
                ),
            ),
            e(
                "main",
                { className: "example-content" },
                e(
                    "section",
                    { className: "hero-card", "data-report-id": "hero", "data-report-type": "group" },
                    e("span", { className: "hero-badge" }, "group target"),
                    e("h2", null, "팀 피드백을 수집하는 프로덕트 화면"),
                    e(
                        "p",
                        null,
                        "카드 전체는 group, 각 액션은 item target으로 연결되어 마커 복원 동작을 함께 확인할 수 있습니다.",
                    ),
                    e(
                        "div",
                        { className: "hero-actions" },
                        e(
                            "button",
                            {
                                className: "primary-button",
                                type: "button",
                                "data-report-id": "hero-primary-cta",
                                "data-report-type": "item",
                            },
                            "무료로 시작하기",
                        ),
                        e(
                            "button",
                            {
                                className: "ghost-button",
                                type: "button",
                                "data-report-id": "hero-secondary-cta",
                                "data-report-type": "item",
                            },
                            "데모 보기",
                        ),
                    ),
                ),
                e(
                    "section",
                    { className: "feature-grid", "data-report-id": "feature-grid", "data-report-type": "group" },
                    e(
                        "article",
                        { className: "feature-card" },
                        e("span", { className: "feature-label" }, "item target"),
                        e("h3", null, "설정 없이 시작"),
                        e("p", null, "로컬 저장소 기반으로 빠르게 동작 확인이 가능합니다."),
                        e(
                            "button",
                            {
                                className: "text-button",
                                type: "button",
                                "data-report-id": "feature-setup-link",
                                "data-report-type": "item",
                            },
                            "가이드 보기",
                        ),
                    ),
                    e(
                        "article",
                        { className: "feature-card" },
                        e("span", { className: "feature-label" }, "item target"),
                        e("h3", null, "안정적인 마커 복원"),
                        e("p", null, "dataset 기준으로 DOM을 다시 찾아 피드백 위치를 계산합니다."),
                        e(
                            "button",
                            {
                                className: "text-button",
                                type: "button",
                                "data-report-id": "feature-anchor-link",
                                "data-report-type": "item",
                            },
                            "복원 방식 보기",
                        ),
                    ),
                ),
            ),
        ),
    );
}

createRoot(document.getElementById("root")).render(e(App));
