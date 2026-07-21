![fivepixels](https://raw.githubusercontent.com/kimsangjunv1/fivepixels/main/assets/fivepixels-banner.png)

# fivepixels &middot; [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![NPM badge](https://img.shields.io/npm/v/@fivepixels-js/react?logo=npm)](https://www.npmjs.com/package/@fivepixels-js/react)

한국어 | [English](./README-en_us.md)

`fivepixels`는 스테이징·QA·내부 도구 화면에서 **DOM 요소 단위 피드백**을 남기는 React 라이브러리입니다. 클릭으로 마커를 찍고, 팀과 답변·검수를 거친 뒤 필요하면 GitHub Issue로 승격할 수 있습니다. **UI Edit 모드**로 실제 화면 위에서 스타일·레이아웃을 라이브로 조정해 “이렇게 바꿔 주세요”를 보여 줄 수도 있습니다. UI는 Shadow Root에 렌더링되므로 **별도 CSS import가 필요 없습니다.**

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

handler를 넘기지 않으면 **localStorage**에 저장됩니다. API 연동 시 persistence handler를 함께 넘깁니다. handler는 **`useCallback`으로 고정**해 주세요. 인라인 함수는 목록 API가 반복 호출될 수 있습니다.

```tsx
import { useCallback } from "react";
import { FivePixels } from "@fivepixels-js/react";

const onList = useCallback(
    ({ pathname }) => fetch(`/api/feedbacks?pathname=${pathname}`).then((r) => r.json()),
    [],
);

export function App() {
    return (
        <FivePixels
            project={{ id: "my-app", env: "stage" }}
            onList={onList}
            onCreate={(payload) =>
                fetch("/api/feedbacks", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.json())
            }
            onUpdate={(id, payload) =>
                fetch(`/api/feedbacks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }).then((r) => r.json())
            }
        />
    );
}
```

REST 경로·Phase·호출 순서는 [docs/backend-api-route.md](./docs/backend-api-route.md)를 참고하세요.

## Props

| Prop | 타입 | 설명 |
| ---- | ---- | ---- |
| `project` | `{ id?, env?, version? }` | 프로젝트 식별자. `id` 기본값 `"my-app"`. |
| `ui` | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut?, locale?, messages? }` | UI 설정. `appearance`: `light` \| `dark` \| `system`. |
| `visibility` | `{ enabled?, devOnly?, routeKey? }` | 표시 여부. `devOnly`면 개발 환경에서만 노출. |
| `team` | `{ user?, reviewers?, requireReviewerKey? }` | 작성자·리뷰어. `user`: `{ id, name }`. |
| `mode` | `"default"` \| `"presentation"` | 프레젠테이션 모드(시연·데모용 뷰어 전환). |
| `fields` | `ReportField[]` | 커스텀 필드 (`textarea`, `checkbox`). |
| `onList` | `(params) => Promise<ReportFeedback[]>` | pathname별 피드백 목록. |
| `onCreate` | `(payload) => Promise<ReportFeedback>` | 피드백 생성. |
| `onUpdate` | `(id, payload) => Promise<ReportFeedback>` | 피드백 수정·답변·검수 반영. |
| `onDelete` | `(id) => Promise<void>` | 피드백 삭제. |
| `onListAll` | `(params) => Promise<{ items, nextCursor? }>` | 전체 페이지 목록(페이지네이션). |
| `onListReplies` | `(commentId, params?) => Promise<...>` | 답변 lazy 로드(P2). |
| `onCreateReply` | `(commentId, payload) => Promise<ReportReply>` | 답변 생성(P2). |
| `onPanelBootstrap` | `(params) => Promise<...>` | 패널 통계 부트스트랩(P3, 선택). |
| `onActivitySummary` | `(params) => Promise<...>` | 활동 히트맵 집계(P3, 선택). |
| `onNavigate` | `(pathname) => void` | View 모드에서 경로 이동. |
| `onRevealTarget` | `(report) => boolean \| Promise<boolean>` | 다른 페이지 피드백 타깃 노출 시도. |
| `onEvent` | `(event) => void` | create/update/delete/reply/github 이벤트. |
| `onReply` | `({ feedbackId, message }) => void` | 답변 side effect. |
| `github` | `{ enabled?, modes?, onCreate? }` | GitHub Issue 연동. |

> `onList`, `onCreate`, `onUpdate`는 **함께** 넘기거나 **모두 생략**해야 합니다. 생략 시 localStorage adapter가 사용됩니다.

**타입 찾는 법:** 공개 props → `FivePixelsProps` (`src/types/publicApi.ts`) · handler 입·출력 → `ReportPersistenceHandlers` · payload/엔티티 → `CreateReportFeedbackPayload` / `ReportFeedback` 등 (`src/types/report.ts`). 새 prop 추가 → [docs/add-props.md](./docs/add-props.md). fetch 예시 → [docs/snippets/createFeedbackHandlers.ts](./docs/snippets/createFeedbackHandlers.ts).

## 커스텀 UI 확장

기본 `<FivePixels />` 대신 `ReportProvider`와 Context 훅으로 패널·오버레이를 직접 조립할 수 있습니다 (`@fivepixels-js/react/report`).

| 훅 | 용도 |
| -- | ---- |
| `useReport()` | 전체 상태 (하위 호환) |
| `useReportPreferences()` | appearance, locale, role, messages 등 |
| `useReportSession()` | mode, draft, markers, pickProbe, composers |
| `useReportData()` | lists, filters, CRUD, stats, reply history |

내부 레이어 규칙은 [docs/architecture-hooks.md](./docs/architecture-hooks.md)를 참고하세요.

## DOM 속성

| 속성 | 필수 | 설명 |
| ---- | ---- | ---- |
| `data-report-id` | 권장 | 요소 식별자. 마커 위치 복원에 사용. 없으면 CSS selector로 대체 추적합니다. |
| `data-report-type` | | `item`(기본) 또는 `group`(섹션 단위). |

## UI 모드

| 모드 | 단축키 | 설명 |
| ---- | ------ | ---- |
| **report** | `⌘⇧M` | 요소 클릭 후 피드백 작성. 우클릭으로 시안 조정·삭제도 가능합니다. |
| **view** | `⌘⇧L` | 마커·목록 조회, 답변·검수 |

## UI Edit 모드 (시안 조정)

피드백 모드에서 선택한 요소의 **실제 DOM**을 세션 동안 라이브로 수정·미리볼 수 있습니다. 기획·디자인·개발이 “말로 설명하기 어려운 UI”를 스테이징 화면에서 바로 맞춰 볼 때 쓰습니다.

### 시작하기

1. **피드백 추가** 모드에서 요소를 선택합니다.
2. **우클릭 → 수정하기**로 시안 조정 패널을 엽니다.
3. 값을 바꾼 뒤 **적용**을 누르면 DOM에 반영되고, 해당 요소에 **수정됨** 표시가 붙습니다.

피드백 작성을 멈춰도(**Stop feedback**) 이미 적용한 편집은 DOM에 남습니다.

### 시안 패널에서 조정 가능한 항목

| 구분 | 항목 |
| ---- | ---- |
| 텍스트 | `textContent`, `fontSize`, `lineHeight` — 버튼·이미지 등 비텍스트 요소에서는 숨김 |
| 박스 | `padding`, `margin` (− / + 스테퍼) |
| 색상 | `textColor`, `backgroundColor`, `borderColor` — hex 입력, 컬러 피커, 복사 버튼 |
| **flex** | 주축·교차축 정렬(아이콘), 가로/세로 방향·뒤집기, `gap` |
| **grid** | 가로 칸·세로 칸 수 (− / +, 1~12), `gap` |

`display: flex` / `grid`인 요소만 레이아웃 섹션이 나타납니다. flex일 때 정렬 아이콘은 **화면 기준**(왼쪽·가운데·오른쪽 / 위·가운데·아래)으로 보이며, 세로 방향일 때는 주축·교차축에 맞게 자동 전환됩니다.

### 우클릭 컨텍스트 메뉴

| 메뉴 | 동작 |
| ---- | ---- |
| **수정하기** | 시안 조정 패널 열기 |
| **원래대로** | 해당 요소에 적용한 스타일만 되돌림 (undo 기록에 포함) |
| **지우기** | 하이라이트 애니메이션 후 DOM에서 제거 (세션 내 복원 가능) |

### 패널 상단 UI Edit 배너

편집·삭제가 한 번이라도 있으면 패널 상단에 **「현재 UI Edit 모드 적용 중」** 배너가 표시됩니다.

| 컨트롤 | 동작 |
| ------ | ---- |
| **초기화** | 세션의 모든 스타일 적용·삭제를 한 번에 원래 DOM으로 복원 |
| **◀ / ▶** | 스타일 적용·원복·삭제를 **한 단계씩** undo / redo |
| **Before / After** | 저장된 스타일 변경을 Before·After로 비교 (스타일 적용이 있을 때만) |

### 피드백 본문에 반영

피드백 드래프트 작성 중, 시안 조정으로 바꾼 내용이 있으면 **「지금 스타일 변경사항 요약을 입력칸에 반영할까요?」** 배너가 나타납니다. **반영하기**를 누르면 변경 요약이 **새 케이스**에 자동으로 들어갑니다.

### 동작 방식·제한

- 편집은 **`element.style` 인라인 스타일**로 적용됩니다. 기존 CSS 클래스(Tailwind 등)보다 우선합니다.
- 변경은 **브라우저 탭 세션** 안에서만 유지됩니다. **새로고침**하면 앱이 다시 그린 원본 화면으로 돌아갑니다.
- UI Edit는 QA·시안 소통용이며, 코드베이스에 자동 저장되지는 않습니다.
- 복잡한 grid 템플릿(불균등 fr, 셀 병합 등)은 칸 수·gap 중심으로 단순화해 조정합니다.

## 기여

Issue와 Pull Request를 환영합니다. 기능·수정 브랜치는 `develop`에서 분기해 주세요.

PR 전 `npm run lint`로 타입·테스트를 확인해 주세요. 자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT © Sangjun Kim. [LICENSE](./LICENSE) 파일을 참고하세요.
