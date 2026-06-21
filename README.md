# stitchable

스테이징·QA·내부 도구 화면 위에 **DOM 요소 단위 피드백**을 남기는 React 라이브러리입니다. 버튼·섹션을 클릭해 마커를 찍고, 팀과 답변·검수 흐름을 거친 뒤 필요하면 GitHub Issue로 승격할 수 있습니다.

- **`data-report-id`** — 화면이 바뀌어도 `querySelector`로 같은 요소를 다시 찾아 마커 위치를 복원합니다.
- **Shadow Root UI** — 호스트 앱 CSS와 분리된 패널·오버레이·마커를 제공합니다. 별도 CSS import는 필요 없습니다.
- **localStorage 또는 서버** — handler를 생략하면 브라우저 저장, `onList`/`onCreate`/`onUpdate`를 넘기면 API 연동합니다.

### UI 모드

| 모드 | 진입 | 하는 일 |
| ---- | ---- | ------- |
| **idle** | 기본 | 우측 패널에서 Report / View / 요소 미리보기 선택 |
| **report** | Report 버튼 · `⌘⇧M` | 화면 요소를 클릭해 피드백 작성 |
| **view** | View 버튼 · `⌘⇧L` | 저장된 마커·목록 조회, 답변·검수, Git Issue 승격 |

답변·검수(`denied` / `confirm` / `checkout`) 상세는 [Feedback Workflow](#feedback-workflow-view-모드)를 참고하세요.

## Install

```bash
npm install stitchable react react-dom
```

## Quick Start

```tsx
import { Report } from "stitchable";

export default function App() {
    return (
        <>
            <Report />

            <main>
                <section
                    data-report-id="hero"
                    data-report-type="group"
                >
                    <button data-report-id="hero-cta">시작하기</button>
                </section>
            </main>
        </>
    );
}
```

- `project.id`를 생략하면 기본값 `"my-app"`이 사용됩니다. stage/production, Cloud 연동, 같은 origin의 여러 앱에서는 `project={{ id }}`를 명시하는 것을 권장합니다.
- `Report`는 피드백을 받을 화면에 1회만 렌더링합니다.
- 피드백 대상 요소에는 `data-report-id`가 필요합니다.
- `data-report-type`은 선택 사항이며, 생략하면 `item`으로 처리됩니다.
- 섹션 전체를 피드백 대상으로 쓰려면 `data-report-type="group"`을 명시하세요.
- **별도 CSS import는 필요 없습니다.** UI는 Shadow Root 안에서 Tailwind 스타일과 함께 자동으로 마운트됩니다.
- Next.js 등 SSR 환경에서는 `Report`를 **클라이언트에서만** 렌더링하세요. (`"use client"` + dynamic import 등)

## Full Example

아래는 `<Report />`의 주요 prop을 **한 번에** 연결한 예시입니다. 로컬만 쓸 때는 `onList`/`onCreate`/`onUpdate`/`onDelete`를 생략하고, GitHub·side effect가 필요 없으면 `github`/`onEvent`/`onReply`를 빼면 됩니다.

```tsx
import type {
    CreateReportFeedbackPayload,
    ReportFeedback,
    ReportEvent,
    UpdateReportFeedbackPayload,
} from "stitchable";
import { Report } from "stitchable";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return response.json() as Promise<T>;
}

async function createGitHubIssue(feedback: ReportFeedback) {
    const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id, feedback }),
    });

    if (!response.ok) {
        throw new Error("GitHub issue creation failed");
    }

    return response.json() as Promise<{ issueNumber: number; issueUrl: string }>;
}

export default function App() {
    return (
        <>
            <Report
                project={{
                    id: "my-app",
                    env: "stage",
                    version: "1.2.3",
                }}
                ui={{
                    locale: "ko",
                    appearance: "system",
                    showFeedbackList: true,
                    visibleShortcutKeys: true,
                }}
                visibility={{
                    devOnly: true,
                    routeKey: "/dashboard",
                }}
                team={{
                    user: { id: "user-1", name: "김아영 주임" },
                    reviewers: [
                        { id: "1", name: "김아영 주임" },
                        { id: "2", name: "최민호 전임" },
                    ],
                }}
                fields={[
                    { key: "message", type: "textarea", label: "메시지", required: true },
                    { key: "isBug", type: "checkbox", label: "bug" },
                    { key: "isImportant", type: "checkbox", label: "IMPORTANT" },
                ]}
                onList={({ pathname }) =>
                    request<ReportFeedback[]>(`/api/feedbacks?pathname=${encodeURIComponent(pathname)}`)
                }
                onCreate={(payload: CreateReportFeedbackPayload) =>
                    request<ReportFeedback>("/api/feedbacks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    })
                }
                onUpdate={(id, payload: UpdateReportFeedbackPayload) =>
                    request<ReportFeedback>(`/api/feedbacks/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    })
                }
                onDelete={(id) => request<void>(`/api/feedbacks/${id}`, { method: "DELETE" })}
                onEvent={(event: ReportEvent) => {
                    if (event.type === "feedback:create") {
                        analytics.track("feedback_created", { id: event.payload.id });
                    }

                    if (event.type === "feedback:github-issue-created") {
                        analytics.track("github_issue_created", { issueUrl: event.payload.issueUrl });
                    }
                }}
                onReply={({ feedbackId, message }) => {
                    notifySlack(`새 답변 on ${feedbackId}: ${message}`);
                }}
                github={{
                    enabled: true,
                    modes: ["on-create", "from-list"],
                    onCreate: createGitHubIssue,
                }}
            />

            <main>
                <section data-report-id="hero" data-report-type="group">
                    <button data-report-id="hero-cta">시작하기</button>
                </section>
            </main>
        </>
    );
}
```

- `visibility.devOnly` — production 빌드에서는 UI를 숨깁니다. 스테이징 전용 QA 도구에 적합합니다.
- `visibility.routeKey` — 생략 시 `window.location.pathname`으로 피드백을 분리합니다.
- `ui.locale` — `"ko"` \| `"en"`. 생략 시 브라우저 언어(`ko` 접두)로 자동 선택합니다.
- handler를 **모두 생략**하면 localStorage가 기본 저장소가 됩니다. [Persistence](#persistence) 참고.

### Live Demo

루트에서 `npm run dev` 후 [http://localhost:5173/](http://localhost:5173/)을 열면 브라우저 데모를 확인할 수 있습니다.

- 풀 설정 소스: [`examples/basic/src/App.tsx`](./examples/basic/src/App.tsx) (localStorage + GitHub mock, 서버 handler 없음)
- 실행·확인 체크리스트: [`docs/example-app.md`](./docs/example-app.md)

## UI Architecture

`Report` UI는 호스트 앱 React 트리와 분리되어 **Shadow Root**(`#stitchable-root`)에 렌더링됩니다.

```
document.body
  └── #stitchable-root
        └── #shadow-root (open)
              ├── <style>  ← 빌드 시 purge된 Tailwind CSS
              └── Report UI (패널, 오버레이, 마커)
```

- 호스트 앱 CSS(Tailwind reset, global style)와 **스타일 간섭이 없습니다.**
- 피드백 **대상** 탐색은 여전히 메인 document 기준 `querySelector` / `elementFromPoint`를 사용합니다. 호스트 페이지 Shadow DOM 내부 요소는 기본 UI로 피드백 대상이 되지 않습니다.
- `appearance="light" | "dark" | "system"`은 Shadow Root 내부 `data-stitchable-theme`으로 반영됩니다.

## Styling

기본 UI는 **Tailwind utility class**로 구성된 flat 디자인입니다. npm 패키지 사용자는 CSS 파일을 import하지 않아도 됩니다.

라이브러리 소스를 fork하거나 로컬에서 UI를 수정할 때는 아래 경로를 기준으로 합니다.

| 목적                            | 파일                                         |
| ------------------------------- | -------------------------------------------- |
| 피드백 작성·타임라인 UI         | `src/components/panel/feedback/*.tsx`        |
| 컴포넌트별 레이아웃/색상        | `src/components/**/*.tsx`의 `className`      |
| Tailwind theme / dark variant   | `src/styles/tailwind.css`                    |
| Shadow Root에 주입되는 CSS 번들 | `src/styles/reportStylesheet.ts` (빌드 생성) |

스타일 변경 후에는 `node scripts/build-report-styles.mjs` 또는 `npm run build`로 stylesheet를 다시 생성해야 합니다.

툴팁 등 일부 인터랙션은 내장 `motion` / `AnimatedPresence`를 사용합니다. 필요하면 아래처럼 별도 import할 수 있습니다.

```tsx
import { motion, AnimatedPresence } from "stitchable";
```

`stitchable/report` subpath는 `Report`, `ReportProvider`, persistence 타입만 export하며 `motion`은 포함하지 않습니다.

## Config

```tsx
import { Report } from "stitchable";

export default function App() {
    return (
        <Report
            project={{
                id: "multimachine-ceo",
                env: "stage",
                version: "1.2.3",
            }}
            ui={{ appearance: "system" }}
        />
    );
}
```

- `project.env`는 `local`, `dev`, `stage`, `production` 등 환경별 피드백을 분리할 때 사용합니다.
- `project.version`은 피드백 생성 시점의 서비스 버전을 기록합니다.
- `visibility.routeKey`를 생략하면 `window.location.pathname`으로 피드백을 자동 분리합니다. 쿼리/탭/논리 화면별로 나누고 싶을 때만 지정하세요.
- `team.user`로 현재 사용자(피드백 작성 기본값)를 설정할 수 있습니다.
- `team.reviewers`로 답변·검수 시 선택할 reviewer 목록을 미리 설정할 수 있습니다. 목록이 없으면 작성자를 직접 입력합니다.
- `team.requireReviewerKey`를 켜면 담당자 공개키 등록 전에는 작성할 수 없고, 등록된 개인키와 일치하는 담당자만 사용합니다. 운영 순서는 [Reviewer key authentication](./docs/reviewer-key-auth.md)을 참고하세요.
- 개인키 분실·유출 시 설정의 **키 재발급**으로 동일한 담당자 ID의 새 공개키를 발급할 수 있습니다.

### Props

| 이름                  | 설명                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| `project`             | `{ id?, env?, version? }` 프로젝트/배포 컨텍스트. `id` 생략 시 `"my-app"`.     |
| `ui`                  | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut?, locale?, messages? }` UI·i18n 옵션. |
| `visibility`          | `{ enabled?, devOnly?, routeKey? }` 표시/활성화/화면 키.                       |
| `projectId`           | _(deprecated)_ `project.id` 사용.                                              |
| `environment`         | _(deprecated)_ `project.env` 사용.                                             |
| `appVersion`          | _(deprecated)_ `project.version` 사용.                                         |
| `pathname`            | _(deprecated)_ `visibility.routeKey` 사용.                                     |
| `routeKey`            | _(deprecated)_ `visibility.routeKey` 사용.                                     |
| `appearance`          | _(deprecated)_ `ui.appearance` 사용.                                           |
| `showFeedbackList`    | _(deprecated)_ `ui.showFeedbackList` 사용.                                     |
| `visibleShortcutKeys` | _(deprecated)_ `ui.visibleShortcutKeys` 사용.                                  |
| `shortcut`            | _(deprecated)_ `ui.shortcut` 사용.                                             |
| `devOnly`             | _(deprecated)_ `visibility.devOnly` 사용.                                      |
| `enabled`             | _(deprecated)_ `visibility.enabled` 사용.                                      |
| `team`                | `{ user?, reviewers?, requireReviewerKey? }` 현재 사용자, reviewer 목록, 키 인증 여부. |
| `identify`            | _(deprecated)_ `team.user` 사용.                                               |
| `authors`             | _(deprecated)_ `team.reviewers` 사용.                                          |
| `fields`              | 피드백 작성 폼 필드 배열.                                                      |
| `onList`              | 현재 화면 키의 피드백 목록을 반환. 서버 연동 시 필수.                          |
| `onListAll`           | 전체 화면의 피드백 목록을 cursor pagination으로 반환.                          |
| `onNavigate`          | 다른 화면의 피드백 선택 시 해당 pathname으로 이동.                             |
| `onCreate`            | 피드백 생성 persistence handler.                                               |
| `onUpdate`            | 피드백 수정 persistence handler.                                               |
| `onDelete`            | 피드백 삭제 persistence handler. UI 삭제 기능 사용 시 필요.                    |
| `onEvent`             | 저장 성공 후 side effect (`ReportEvent`). analytics 등.                        |
| `onReply`             | 답변 추가 후 side effect. Slack 알림 등.                                       |
| `github`              | GitHub Issue 연동 옵션. `enabled`, `modes`, `onCreate`. persistence `onCreate`와 별개. |

### Advanced (localStorage only)

서버 handler 없이 localStorage + 팀·필드만 쓰는 축약 예시입니다. 전체 prop 조합은 [Full Example](#full-example)을 참고하세요.

```tsx
<Report
    project={{ id: "my-app" }}
    ui={{
        appearance: "system",
        showFeedbackList: false,
        visibleShortcutKeys: true,
        locale: "ko",
    }}
    visibility={{ devOnly: true }}
    team={{
        user: { id: "user-1", name: "김아영 주임" },
        reviewers: [
            { id: "1", name: "김아영 주임" },
            { id: "2", name: "최민호 전임" },
        ],
    }}
    fields={[
        { key: "message", type: "textarea", label: "메시지", required: true },
        { key: "isBug", type: "checkbox", label: "bug" },
        { key: "isImportant", type: "checkbox", label: "IMPORTANT" },
    ]}
/>
```

- `ui.locale` — UI 문자열·기본 field label 언어. 패널 설정 메뉴에서 런타임 변경도 가능합니다.
- `ui.messages` — `DeepPartialReportMessages`로 UI 문구를 부분 오버라이드합니다.
- `message` field는 기본 메시지와 연결되므로 예약 key로 취급합니다.
- `checkbox` field는 피드백 작성 UI에서 **태그 pill**로 표시되며, 선택 시 강조 스타일이 적용됩니다.
- `visibility.routeKey`를 넘기지 않으면 현재 `window.location.pathname` 기준으로 저장됩니다.
- `ui.showFeedbackList={false}`를 주면 view 모드에서도 우측 목록 패널 없이 마커만 표시할 수 있습니다.
- `ui.visibleShortcutKeys={true}`를 주면 버튼 옆에 키보드 단축키 힌트를 표시합니다.
- `visibility.devOnly`를 주면 `NODE_ENV === "production"`일 때 Report UI를 렌더링하지 않습니다.
- `visibility.enabled={false}`를 주면 환경과 관계없이 Report UI를 렌더링하지 않습니다.

## Keyboard Shortcuts

Report UI는 마우스 없이도 주요 기능을 사용할 수 있도록 키보드 단축키를 제공합니다. Mac에서는 `⌘`, Windows/Linux에서는 `Ctrl`을 modifier로 사용합니다.

| 동작                                  | Mac       | Windows / Linux |
| ------------------------------------- | --------- | --------------- |
| 피드백 남기기 / 선택 중단             | `⌘⇧M`     | `Ctrl+Shift+M`  |
| 선택 가능한 요소 미리보기             | `⌘⇧E`     | `Ctrl+Shift+E`  |
| 피드백 보기 / 목록 닫기               | `⌘⇧L`     | `Ctrl+Shift+L`  |
| 검색 input 포커스 (목록 열림)         | `⌘⇧S`     | `Ctrl+Shift+S`  |
| 목록 항목 이동 (목록 열림)            | `↑` / `↓` | `↑` / `↓`       |
| 드래프트 취소 / 편집 닫기 / 모드 종료 | `Esc`     | `Esc`           |
| 드래프트 저장 / 수정 저장             | `⌘↩`      | `Ctrl+Enter`    |

- `Esc`는 드래프트 취소 → 편집 닫기 → report 모드 종료 → view 모드 종료 → 요소 미리보기 끄기 순으로 동작합니다.
- 요소 미리보기 단축키는 idle 모드에서만 동작합니다. report/view 모드에서는 버튼과 동일하게 비활성화됩니다.
- `input`, `textarea`, `select`에 포커스가 있을 때는 글로벌 단축키(`⌘⇧M`, `⌘⇧E`, `⌘⇧L`)와 목록 방향키가 동작하지 않습니다.
- 검색 포커스(`⌘⇧S`)는 view 모드에서 목록이 열려 있을 때 입력 필드 포커스와 관계없이 동작합니다.
- 드래프트/편집 폼에서는 `Esc`와 `⌘↩` / `Ctrl+Enter`가 입력 필드 포커스와 관계없이 동작합니다.
- `ui.visibleShortcutKeys` prop을 켜면 각 버튼 옆에 현재 OS에 맞는 단축키 라벨이 표시됩니다.

```tsx
<Report
    project={{ id: "my-app" }}
    ui={{ visibleShortcutKeys: true }}
    visibility={{ devOnly: true }}
/>
```

`ReportProvider`를 직접 사용하는 경우에도 동일한 prop을 전달할 수 있습니다.

```tsx
<ReportProvider
    project={{ id: "my-app" }}
    ui={{ visibleShortcutKeys: true }}
    visibility={{ devOnly: true }}
>
    {/* custom report UI */}
</ReportProvider>
```

## Persistence

handler props를 넘기지 않으면 브라우저 `localStorage`를 기본 저장소로 사용합니다. 키는 `project.id`와 `project.env`로 분리됩니다.

- 데이터 계약 상세는 `[docs/report-data-model.md](./docs/report-data-model.md)`를 기준으로 맞춥니다.
- 설치/적용/FAQ는 `[docs/getting-started.md](./docs/getting-started.md)`를 참고합니다.
- 실행 가능한 데모와 `npm run dev` 사용법은 `[docs/example-app.md](./docs/example-app.md)`를 참고합니다.

### 기본 localStorage

```tsx
<Report project={{ id: "my-app" }} />
```

- localStorage 기본 키는 `stitchable:reports:v1:{projectId}` 또는 `stitchable:reports:v1:{projectId}:{environment}` 형태입니다.

### Data transfer (localStorage 전용)

handler props를 넘기지 **않은** localStorage 모드에서만 패널 **설정(⚙) 메뉴**의 아래 기능이 활성화됩니다.

| 기능 | 설명 |
| ---- | ---- |
| **Import** | JSON 파일 또는 드래그앤드롭으로 피드백 일괄 가져오기. `project.id`/`env` 불일치 시 확인 다이얼로그 표시 |
| **Export** | 현재 scope의 피드백 JSON 내보내기 |
| **Command** | JSON paste로 일괄 replace·merge (충돌 시 확인) |

서버 persistence를 쓰는 경우 import/export·command UI는 비활성화됩니다.

### 서버 persistence (`onList` / `onCreate` / `onUpdate` / `onDelete`)

서버를 primary storage로 쓰려면 `onList`, `onCreate`, `onUpdate`를 **함께** 넘깁니다. UI에서 삭제까지 쓰려면 `onDelete`도 구현하세요.

```tsx
import type { CreateReportFeedbackPayload, ReportFeedback, UpdateReportFeedbackPayload } from "stitchable";
import { Report } from "stitchable";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return response.json() as Promise<T>;
}

export default function App() {
    return (
        <Report
            project={{ id: "my-app" }}
            visibility={{ devOnly: true }}
            onList={({ pathname }) => request<ReportFeedback[]>(`/api/feedbacks?pathname=${encodeURIComponent(pathname)}`)}
            onCreate={(payload: CreateReportFeedbackPayload) =>
                request<ReportFeedback>("/api/feedbacks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }
            onUpdate={(id: string, payload: UpdateReportFeedbackPayload) =>
                request<ReportFeedback>(`/api/feedbacks/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }
            onDelete={(id) =>
                request<void>(`/api/feedbacks/${id}`, {
                    method: "DELETE",
                })
            }
        />
    );
}
```

- `onList`, `onCreate`, `onUpdate`는 persistence handler입니다. 저장 실패 시 UI에 에러가 표시됩니다.
- `onDelete`를 생략하면 삭제 시도 시 에러가 납니다.
- 답변 추가는 내부적으로 `onUpdate({ replies, status? })`로 저장됩니다.
- view 모드 마커의 **`+N` 배지**와 hover **최근 답변 미리보기**는 `onList` 응답의 `replies[]`에서 파생됩니다. 별도 count 필드는 없습니다. `replies`는 시간순으로 append하고, **최신 답변은 배열의 마지막** 항목입니다.

```json
{
  "id": "fb_001",
  "message": "버튼 색상이 디자인과 다릅니다.",
  "status": "open",
  "author_name": "김상준",
  "replies": [
    {
      "id": "r_001",
      "message": "확인해보겠습니다.",
      "created_at": "2026-06-01T10:00:00.000Z",
      "status": "suggested",
      "author_name": "리뷰어A"
    },
    {
      "id": "r_009",
      "message": "내일 배포에 포함됩니다.",
      "created_at": "2026-06-07T15:30:00.000Z",
      "status": "suggested",
      "author_name": "리뷰어B"
    }
  ]
}
```

위 예시는 `replies` 중 **첫 항목·마지막 항목만** 표시한 것입니다 (`replies.length === 9` 가정). UI 동작:

| UI | 값 |
| -- | -- |
| 마커 배지 | `+9` (`replies.length`) |
| hover 하단 | `리뷰어B \| 내일 배포에 포함됩니다. \| +8` (`+8` = `replies.length - 1`) |

### Side effects (`onEvent` / `onReply`)

persistence와 별도로 analytics, Slack 알림 등 **저장 이후** 동작을 붙일 때 사용합니다.

```tsx
<Report
    project={{ id: "my-app" }}
    onList={listFeedbacks}
    onCreate={createFeedback}
    onUpdate={updateFeedback}
    onDelete={deleteFeedback}
    onEvent={(event) => {
        if (event.type === "feedback:create") {
            analytics.track("feedback_created", { id: event.payload.id });
        }
    }}
    onReply={({ feedbackId, message }) => {
        notifySlack(`새 답변 on ${feedbackId}: ${message}`);
    }}
/>
```

- `onEvent`는 create/update/delete/reply 저장 성공 후 호출됩니다.
- `onReply`는 답변 저장 성공 후 추가 side effect용입니다. `onEvent`와 함께 써도 됩니다.
- side effect callback에서 에러가 나도 persistence 결과는 rollback되지 않습니다.

```ts
import type { ReportEvent } from "stitchable";

function handleReportEvent(event: ReportEvent) {
    if (event.type === "feedback:create") {
        console.log("created", event.payload.id);
    }

    if (event.type === "feedback:github-issue-created") {
        console.log("github issue", event.payload.issueUrl);
    }
}
```

### GitHub Issue 연동 (`github`)

피드백을 로컬에 쌓아 두었다가, 필요할 때 GitHub Issue로 **승격**하는 흐름을 지원합니다. GitHub API 호출은 브라우저가 아니라 **앱 서버**에서 처리하는 것을 권장합니다. (`github.onCreate` 콜백)

```tsx
import { Report, formatFeedbackAsGitHubIssueBody, type ReportFeedback } from "stitchable";

async function createGitHubIssue(feedback: ReportFeedback) {
    const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id, feedback }),
    });

    if (!response.ok) {
        throw new Error("GitHub issue creation failed");
    }

    return response.json() as Promise<{ issueNumber: number; issueUrl: string }>;
}

<Report
    project={{ id: "my-app" }}
    ui={{ showFeedbackList: true }}
    github={{
        enabled: true,
        modes: ["on-create", "from-list"],
        onCreate: createGitHubIssue,
    }}
    onEvent={(event) => {
        if (event.type === "feedback:github-issue-created") {
            analytics.track("github_issue_created", { issueUrl: event.payload.issueUrl });
        }
    }}
/>
```

| `github` 필드 | 설명 |
| ------------- | ---- |
| `enabled` | `false`면 Git Issue 버튼을 숨깁니다. 생략 시 `onCreate`가 있으면 활성화됩니다. |
| `modes` | `"on-create"` (작성 시 Git Issue 버튼), `"from-list"` (목록에서 Git Issue +). 기본값은 `["from-list"]`만. |
| `onCreate` | GitHub Issue 생성 콜백. `{ issueNumber, issueUrl }`를 반환해야 합니다. |

**전송 시 UI 동작**

1. **작성 시** (`modes`에 `"on-create"` 포함) — Send 옆 `Git Issue` 버튼으로 피드백 저장 + Issue 생성을 한 번에 수행합니다.
2. **목록에서** (`modes`에 `"from-list"` 포함) — Feedback List 항목 옆 `Git Issue +`로 대화 맥락이 쌓인 뒤 전송합니다. 두 번 클릭으로 확인합니다.
3. **전송 후** — 피드백 `status`가 `git_issued`로 바뀌고, `integrations.github`에 Issue 메타가 저장됩니다. 댓글 타임라인에 `Issue has been sent to GitHub.` 시스템 항목과 **바로가기 링크·링크 복사** 버튼이 추가됩니다.
4. **이미 `git_issued`** — Git Issue 버튼 대신 Issue 링크만 표시됩니다. 중복 전송은 불가합니다.

**서버 API 예시**

```ts
// POST /api/github/issues
import { formatFeedbackAsGitHubIssueBody } from "stitchable";

const issue = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        title: `[Feedback] ${feedback.pathname}`,
        body: formatFeedbackAsGitHubIssueBody(feedback, fields),
        labels: ["stitchable"],
    }),
}).then((res) => res.json());

return { issueNumber: issue.number, issueUrl: issue.html_url };
```

- `github.onCreate`는 persistence handler `onCreate`와 **이름만 같을 뿐 별개**입니다. 피드백 저장은 stitchable이 먼저 수행하고, 성공 후 `onCreate` → `onUpdate({ status, integrations, replies })` 순으로 반영합니다.
- GitHub 연동을 쓰지 않으면 `github` prop을 생략하면 됩니다. 버튼·`git_issued` 필터·배지가 모두 숨겨집니다.
- 예제 앱(`npm run dev`)에는 mock 프록시 `POST /api/github/issues`가 포함되어 있습니다.

## Feedback Workflow (view 모드)

view 모드(`⌘⇧L`)에서 화면에 표시된 **마커**(`item` 빨간 점 · `group` 보라 점)를 기준으로 아래 흐름이 동작합니다.

1. **작성** — 요소 선택 후 메시지, 작성자(`team.reviewers` 또는 직접 입력), `checkbox` 태그를 선택해 피드백을 등록합니다.
2. **마커 배지** — 답변이 1개 이상이면 마커 우상단에 **`+N`** (`N` = `replies.length`, 총 답변 수)이 표시됩니다. 답변이 없으면 배지를 숨깁니다.
3. **hover** — 원본 피드백의 상태 배지, 메시지(2줄), 작성자, 태그를 미리 봅니다. 답변이 없으면 상태는 `CURRENTLY WAIT`입니다. 답변이 있으면 상태 배지는 **최신 답변의 status**를 반영하고, 카드 하단에 **`최근 답변 작성자 | 내용 1줄 | +M`** 미리보기가 추가됩니다. (`M` = `replies.length - 1`, 미리보기에 보여준 1건을 제외한 나머지 답변 수. 답변이 1개뿐이면 `+M`은 표시하지 않습니다.)
4. **클릭** — 원본 이슈와 답변 입력 UI(태그 없음)가 열립니다.
5. **첫 답변** — `suggested` 상태의 타임라인 항목이 추가되고, 최신 항목에 `denied` / `confirm` / `select`가 표시됩니다.
6. **denied** — 즉시 반영되지 않습니다. `denied` 버튼이 활성화되고 위에 답변 UI가 열리며, 전송 시 `found_error` 항목이 추가됩니다. `found_error`에 대한 denied는 `recheck_requested`로 저장됩니다.
7. **checkout** — **가장 최근 `found_error` 항목**에만 표시됩니다. 활성화 후 답변을 내면 `suggested` 항목이 추가되며, 이전 `found_error`에는 checkout 버튼이 더 이상 나타나지 않습니다.
8. **confirm** — 기본 처리자는 **최초 피드백 작성자**입니다. `select`로 다른 처리자를 고른 뒤 `confirm`하면 `resolved` 답변이 추가되고 피드백 `status`가 `resolved`가 됩니다.

답변별 타임라인 상태(`ReportReplyStatus`):

| 값            | UI 라벨     | 의미                        |
| ------------- | ----------- | --------------------------- |
| `suggested`   | SUGGESTED   | 수정·제안 답변              |
| `found_error` | FOUND ERROR | 검수 거절(재확인 요청) 답변 |
| `recheck_requested` | IS NOT ERROR | 오류 발견 판단에 대한 반박 |
| `resolved`    | RESOLVED    | 검수 완료(이슈 해결)        |

피드백 본문 `status`는 `open | git_issued | resolved | archived`이며, `confirm` 시 `resolved`로 바뀝니다. GitHub Issue 전송 시 `git_issued`로 바뀝니다.

## Data Contract

- `ReportField` 기본 지원 타입은 `textarea`, `checkbox` 입니다.
- `field_values`는 `Record<string, string | boolean>` 형태만 저장합니다.
- `replies` 항목은 `id`, `message`, `created_at`, **`status`** (`suggested` \| `found_error` \| `recheck_requested` \| `resolved`)를 가지며, `author_type`, `author_name`를 선택적으로 포함할 수 있습니다.
- `replies`는 **시간순 append** 배열입니다. 최신 답변은 **마지막** 항목이며, 마커 `+N`은 `replies.length`, hover 미리보기는 마지막 항목의 `author_name`·`message`를 사용합니다.
- 피드백 `status` 흐름 기본값은 `open -> git_issued -> resolved -> archived` 입니다. (`git_issued`는 GitHub Issue 전송 시에만 설정)
- `integrations.github`는 선택 필드이며 `{ issue_number, issue_url, issued_at }` 형태입니다.
- GitHub Issue 전송 시 `author_type: "system"` reply가 추가되며, 메시지는 `Issue has been sent to GitHub.`입니다.
- custom persistence handler는 `onList`/`onCreate`/`onUpdate`/`onDelete`에서 local adapter와 동일한 정규화 결과를 반환해야 합니다. 저장 시 누락된 `reply.status`는 `suggested`로 정규화됩니다.

## Migration

- `project.id`를 생략하면 `"my-app"`이 기본값입니다.
- `projectId` / `environment` / `appVersion` flat prop은 deprecated입니다. `project={{ id, env, version }}`를 사용하세요.
- flat prop(`projectId`, `pathname`, `routeKey`, `devOnly`, `enabled`, `appearance` 등)은 deprecated입니다. `project`, `ui`, `visibility` 객체를 사용하세요.
- 이전에 `workspace` 개념을 사용했다면 `project.id`로 교체하세요.
- `storage` / `storageAdapter` prop은 제거되었습니다. 대신 `onList` / `onCreate` / `onUpdate` / `onDelete`를 사용하세요.
- 예전 side-effect용 `onCreate` / `onUpdate` / `onDelete`는 persistence handler로 의미가 바뀌었습니다. analytics·알림은 `onEvent` / `onReply`를 사용하세요.
- localStorage 기본 키는 `stitchable:reports:v1:{projectId}` 또는 `stitchable:reports:v1:{projectId}:{environment}` 형태입니다.

## Reply / Status Policy

- 기본 `Report` 컴포넌트는 view 모드 마커 UI에서 **답변 작성·검수(denied / confirm / checkout)** 를 지원합니다.
- reply 저장용 별도 handler는 두지 않고, `onUpdate(id, { replies, status? })` 계약을 우선 사용합니다.
- `denied` / `checkout`은 UI 단계이며, 전송 후 타임라인에 반영되는 상태는 각각 `found_error`, `suggested`입니다.
- `confirm` 시 `resolved` reply 추가와 함께 피드백 `status: "resolved"`를 함께 보냅니다.
- GitHub Issue 전송 시 피드백 `status: "git_issued"`, `integrations.github` 메타, 시스템 reply를 함께 보냅니다.
- `git_issued`는 검수 흐름(`denied` / `confirm`) 대상이 아닙니다. Issue 링크는 목록·댓글 타임라인에서 확인합니다.
- `archived`는 종료 상태이며 기본 UI에서는 읽기 전용으로 취급합니다.
