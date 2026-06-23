import { useLocation } from "react-router-dom";

const guideByPath: Record<string, { title: string; steps: string[]; note: string }> = {
    "/": {
        title: "랜딩 · 생성 · 조회 · 수정 흐름",
        steps: [
            "우측 상단 Report 버튼으로 리포트 모드를 켭니다.",
            "히어로, 기능 카드, 하단 CTA에 피드백을 남겨봅니다.",
            "다른 페이지로 이동한 뒤 마커 복원을 확인합니다.",
        ],
        note: "group은 섹션 전체, item은 버튼·카드·링크 단위 타겟입니다.",
    },
    "/pricing": {
        title: "요금 · 플랜 비교 데모",
        steps: [
            "각 요금 카드와 CTA 버튼에 item target이 연결되어 있습니다.",
            "비교표 행 단위로도 피드백을 남길 수 있습니다.",
            "문의 링크를 통해 contact 라우트로 이동해보세요.",
        ],
        note: "featured 플랜 카드는 강조 스타일과 함께 별도 item으로 표시됩니다.",
    },
    "/contact": {
        title: "문의 · 폼 필드 타겟 데모",
        steps: [
            "폼 필드, 라디오, textarea, 제출 버튼에 item target을 확인합니다.",
            "연락 채널 카드와 FAQ 항목에도 피드백을 남겨보세요.",
            "헤더 네비게이션 item target과 함께 라우트 간 복원을 테스트합니다.",
        ],
        note: "실제 전송은 되지 않으며 fivepixels 동작 확인용 UI입니다.",
    },
};

export function ExampleGuide() {
    const { pathname } = useLocation();
    const guide = guideByPath[pathname] ?? guideByPath["/"];

    return (
        <aside className="example-panel" data-report-id="example-guide" data-report-type="group">
            <p className="example-eyebrow">fivepixels example</p>
            <h1 className="example-title">{guide.title}</h1>
            <ol className="example-steps">
                {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ol>
            <p className="example-note">{guide.note}</p>
        </aside>
    );
}
