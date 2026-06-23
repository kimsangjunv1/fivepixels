![fivepixels](https://raw.githubusercontent.com/kimsangjunv1/fivepixels/main/assets/fivepixels-banner.png)

# fivepixels &middot; [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![NPM badge](https://img.shields.io/npm/v/@fivepixels-js/react?logo=npm)](https://www.npmjs.com/package/@fivepixels-js/react)

한국어 | [English](./README-en_us.md)

`fivepixels`는 스테이징·QA·내부 도구 화면에서 **DOM 요소 단위 피드백**을 남기는 React 라이브러리입니다. 클릭으로 마커를 찍고, 팀과 답변·검수를 거친 뒤 필요하면 GitHub Issue로 승격할 수 있습니다. UI는 Shadow Root에 렌더링되므로 **별도 CSS import가 필요 없습니다.**

📖 **상세 가이드:** [library.codi-agit.com/fivepixels/guide](https://library.codi-agit.com/fivepixels/guide)

## 설치

```bash
npm install @fivepixels-js/react react react-dom
```

## 사용 예시

피드백 대상 요소에 `data-report-id`를 붙이고, 화면에 `<FivePixels />`를 한 번 렌더링합니다.

```tsx
import { FivePixels } from "@fivepixels-js/react";

export default function App() {
    return (
        <>
            <FivePixels project={{ id: "my-app" }} />

            <main>
                <section data-report-id="hero" data-report-type="group">
                    <button data-report-id="hero-cta">시작하기</button>
                </section>
            </main>
        </>
    );
}
```

handler를 넘기지 않으면 **localStorage**에 저장됩니다. API 연동 시 persistence handler를 함께 넘깁니다.

```tsx
<FivePixels
    project={{ id: "my-app", env: "stage" }}
    onList={({ pathname }) => fetch(`/api/feedbacks?pathname=${pathname}`).then((r) => r.json())}
    onCreate={(payload) =>
        fetch("/api/feedbacks", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.json())
    }
    onUpdate={(id, payload) =>
        fetch(`/api/feedbacks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }).then((r) => r.json())
    }
/>
```

## Props

| Prop | 타입 | 설명 |
| ---- | ---- | ---- |
| `project` | `{ id?, env?, version? }` | 프로젝트 식별자. `id` 기본값 `"my-app"`. |
| `ui` | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut?, locale?, messages? }` | UI 설정. `appearance`: `light` \| `dark` \| `system`. |
| `visibility` | `{ enabled?, devOnly?, routeKey? }` | 표시 여부. `devOnly`면 개발 환경에서만 노출. |
| `team` | `{ user?, reviewers?, requireReviewerKey? }` | 작성자·리뷰어. `user`: `{ id, name }`. |
| `fields` | `ReportField[]` | 커스텀 필드 (`textarea`, `checkbox`). |
| `onList` | `(params) => Promise<ReportFeedback[]>` | pathname별 피드백 목록. |
| `onCreate` | `(payload) => Promise<ReportFeedback>` | 피드백 생성. |
| `onUpdate` | `(id, payload) => Promise<ReportFeedback>` | 피드백 수정·답변·검수 반영. |
| `onDelete` | `(id) => Promise<void>` | 피드백 삭제. |
| `onListAll` | `(params) => Promise<{ items, nextCursor? }>` | 전체 페이지 목록(페이지네이션). |
| `onNavigate` | `(pathname) => void` | View 모드에서 경로 이동. |
| `onEvent` | `(event) => void` | create/update/delete/reply/github 이벤트. |
| `onReply` | `({ feedbackId, message }) => void` | 답변 side effect. |
| `github` | `{ enabled?, modes?, onCreate? }` | GitHub Issue 연동. |

> `onList`, `onCreate`, `onUpdate`는 **함께** 넘기거나 **모두 생략**해야 합니다. 생략 시 localStorage adapter가 사용됩니다.

## DOM 속성

| 속성 | 필수 | 설명 |
| ---- | ---- | ---- |
| `data-report-id` | ✅ | 요소 식별자. 마커 위치 복원에 사용. |
| `data-report-type` | | `item`(기본) 또는 `group`(섹션 단위). |

## UI 모드

| 모드 | 단축키 | 설명 |
| ---- | ------ | ---- |
| **report** | `⌘⇧M` | 요소 클릭 후 피드백 작성 |
| **view** | `⌘⇧L` | 마커·목록 조회, 답변·검수 |

## 기여

Issue와 Pull Request를 환영합니다. 기능·수정 브랜치는 `develop`에서 분기해 주세요.

PR 전 `npm run lint`로 타입·테스트를 확인해 주세요. 자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT © Sangjun Kim. [LICENSE](./LICENSE) 파일을 참고하세요.
