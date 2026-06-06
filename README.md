# stitchable

DOM Element 기반 피드백 라이브러리입니다. `data-report-id`를 기준으로 요소를 다시 찾아 피드백 포인트를 렌더링합니다.

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

### Props

| 이름                  | 설명                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| `project`             | `{ id?, env?, version? }` 프로젝트/배포 컨텍스트. `id` 생략 시 `"my-app"`.     |
| `ui`                  | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut? }` UI 옵션. |
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
| `team`                | `{ user?, reviewers? }` 현재 사용자와 reviewer 목록.                           |
| `identify`            | _(deprecated)_ `team.user` 사용.                                               |
| `authors`             | _(deprecated)_ `team.reviewers` 사용.                                          |
| `fields`              | 피드백 작성 폼 필드 배열.                                                      |
| `onList`              | 현재 화면 키의 피드백 목록을 반환. 서버 연동 시 필수.                          |
| `onCreate`            | 피드백 생성 persistence handler.                                               |
| `onUpdate`            | 피드백 수정 persistence handler.                                               |
| `onDelete`            | 피드백 삭제 persistence handler. UI 삭제 기능 사용 시 필요.                    |
| `onEvent`             | 저장 성공 후 side effect (`ReportEvent`). analytics 등.                        |
| `onReply`             | 답변 추가 후 side effect. Slack 알림 등.                                       |

### Advanced

```tsx
<Report
    project={{ id: "my-app" }}
    ui={{
        appearance: "system",
        showFeedbackList: false,
        visibleShortcutKeys: true,
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
- import/export UI는 localStorage 모드에서만 활성화됩니다.

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
}
```

## Feedback Workflow (view 모드)

view 모드에서 화면에 표시된 **마커(빨간 점)** 를 기준으로 아래 흐름이 동작합니다.

1. **작성** — 요소 선택 후 메시지, 작성자(`team.reviewers` 또는 직접 입력), `checkbox` 태그를 선택해 피드백을 등록합니다.
2. **hover** — 답변이 없으면 `CURRENTLY WAIT`, 있으면 **최신 답변의 상태**와 원문(2줄), 작성자, 태그를 미리 봅니다.
3. **클릭** — 원본 이슈와 답변 입력 UI(태그 없음)가 열립니다.
4. **첫 답변** — `suggested` 상태의 타임라인 항목이 추가되고, 최신 항목에 `denied` / `confirm` / `select`가 표시됩니다.
5. **denied** — 즉시 반영되지 않습니다. `denied` 버튼이 활성화되고 위에 답변 UI가 열리며, 전송 시 `found_error` 항목이 추가됩니다.
6. **checkout** — **가장 최근 `found_error` 항목**에만 표시됩니다. 활성화 후 답변을 내면 `suggested` 항목이 추가되며, 이전 `found_error`에는 checkout 버튼이 더 이상 나타나지 않습니다.
7. **confirm** — 기본 처리자는 **최초 피드백 작성자**입니다. `select`로 다른 처리자를 고른 뒤 `confirm`하면 `resolved` 답변이 추가되고 피드백 `status`가 `resolved`가 됩니다.

답변별 타임라인 상태(`ReportReplyStatus`):

| 값            | UI 라벨     | 의미                        |
| ------------- | ----------- | --------------------------- |
| `suggested`   | SUGGESTED   | 수정·제안 답변              |
| `found_error` | FOUND ERROR | 검수 거절(재확인 요청) 답변 |
| `resolved`    | RESOLVED    | 검수 완료(이슈 해결)        |

피드백 본문 `status`는 `open | resolved | archived`이며, `confirm` 시 `resolved`로 바뀝니다.

## Data Contract

- `ReportField` 기본 지원 타입은 `textarea`, `checkbox` 입니다.
- `field_values`는 `Record<string, string | boolean>` 형태만 저장합니다.
- `replies` 항목은 `id`, `message`, `created_at`, **`status`** (`suggested` \| `found_error` \| `resolved`)를 가지며, `author_type`, `author_name`를 선택적으로 포함할 수 있습니다.
- 피드백 `status` 흐름 기본값은 `open -> resolved -> archived` 입니다.
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
- `archived`는 종료 상태이며 기본 UI에서는 읽기 전용으로 취급합니다.
