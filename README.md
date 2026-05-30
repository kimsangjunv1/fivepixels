# stitchable

DOM Element 기반 피드백 라이브러리입니다. `data-report-id`, `data-report-type`를 기준으로 요소를 다시 찾아 피드백 포인트를 렌더링합니다.

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
            <Report devOnly />

            <main>
                <section data-report-id="hero" data-report-type="group">
                    <button data-report-id="cta-button" data-report-type="item">
                        시작하기
                    </button>
                </section>
            </main>
        </>
    );
}
```

- `Report`는 피드백을 받을 화면에 1회만 렌더링합니다.
- 피드백 대상 요소에는 `data-report-id`, `data-report-type`를 함께 넣어야 합니다.
- `data-report-type`은 `group` 또는 `item`만 지원합니다.

## Config

```tsx
import { Report } from "stitchable";

export default function App() {
    return (
        <Report
            devOnly
            appearance="system"
            storage="local"
            showFeedbackList={false}
            visibleShortcutKeys
            fields={[
                { key: "message", type: "textarea", label: "메시지", required: true },
                { key: "isBug", type: "checkbox", label: "버그" },
                { key: "isImportant", type: "checkbox", label: "중요" },
            ]}
        />
    );
}
```

- `message` field는 기본 메시지와 연결되므로 예약 key로 취급합니다.
- `pathname`을 넘기지 않으면 현재 `window.location.pathname` 기준으로 저장됩니다.
- `showFeedbackList={false}`를 주면 view 모드에서도 우측 목록 패널 없이 마커만 표시할 수 있습니다.
- `visibleShortcutKeys={true}`를 주면 버튼 옆에 키보드 단축키 힌트를 표시합니다.
- `devOnly`를 주면 `NODE_ENV === "production"`일 때 Report UI를 렌더링하지 않습니다.
- `enabled={false}`를 주면 환경과 관계없이 Report UI를 렌더링하지 않습니다.

## Keyboard Shortcuts

Report UI는 마우스 없이도 주요 기능을 사용할 수 있도록 키보드 단축키를 제공합니다. Mac에서는 `⌘`, Windows/Linux에서는 `Ctrl`을 modifier로 사용합니다.

| 동작 | Mac | Windows / Linux |
| --- | --- | --- |
| 피드백 남기기 / 선택 중단 | `⌘⇧M` | `Ctrl+Shift+M` |
| 선택 가능한 요소 미리보기 | `⌘⇧E` | `Ctrl+Shift+E` |
| 피드백 보기 / 목록 닫기 | `⌘⇧L` | `Ctrl+Shift+L` |
| 검색 input 포커스 (목록 열림) | `⌘⇧S` | `Ctrl+Shift+S` |
| 목록 항목 이동 (목록 열림) | `↑` / `↓` | `↑` / `↓` |
| 드래프트 취소 / 편집 닫기 / 모드 종료 | `Esc` | `Esc` |
| 드래프트 저장 / 수정 저장 | `⌘↩` | `Ctrl+Enter` |

- `Esc`는 드래프트 취소 → 편집 닫기 → report 모드 종료 → view 모드 종료 → 요소 미리보기 끄기 순으로 동작합니다.
- 요소 미리보기 단축키는 idle 모드에서만 동작합니다. report/view 모드에서는 버튼과 동일하게 비활성화됩니다.
- `input`, `textarea`, `select`에 포커스가 있을 때는 글로벌 단축키(`⌘⇧M`, `⌘⇧E`, `⌘⇧L`)와 목록 방향키가 동작하지 않습니다.
- 검색 포커스(`⌘⇧S`)는 view 모드에서 목록이 열려 있을 때 입력 필드 포커스와 관계없이 동작합니다.
- 드래프트/편집 폼에서는 `Esc`와 `⌘↩` / `Ctrl+Enter`가 입력 필드 포커스와 관계없이 동작합니다.
- `visibleShortcutKeys` prop을 켜면 각 버튼 옆에 현재 OS에 맞는 단축키 라벨이 표시됩니다.

```tsx
<Report devOnly visibleShortcutKeys />
```

`ReportProvider`를 직접 사용하는 경우에도 동일한 prop을 전달할 수 있습니다.

```tsx
<ReportProvider devOnly visibleShortcutKeys>
    {/* custom report UI */}
</ReportProvider>
```

## Storage

- `storage="local"`: 기본 `localStorage` adapter를 사용합니다.
- `storage={adapter}`: `ReportStorageAdapter` 인터페이스를 구현한 cloud adapter를 연결할 수 있습니다.
- `storage`는 저장소 자체를 교체하는 용도입니다. 저장 이후 외부 API 호출은 callback props를 사용합니다.
- 데이터 계약 상세는 `[docs/report-data-model.md](./docs/report-data-model.md)`를 기준으로 맞춥니다.
- 설치/적용/FAQ는 `[docs/getting-started.md](./docs/getting-started.md)`를 참고합니다.
- 실행 가능한 데모와 `npm run dev` 사용법은 `[docs/example-app.md](./docs/example-app.md)`를 참고합니다.

### localStorage + API backup

`storage="local"`로 브라우저에 먼저 저장한 뒤, callback props로 서버에 백업할 수 있습니다.

```tsx
import { Report } from "stitchable";

export default function App() {
    return (
        <Report
            devOnly
            storage="local"
            onFeedbackCreate={async (feedback) => {
                await fetch("/api/stitchable/feedbacks", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(feedback),
                });
            }}
        />
    );
}
```

- `onFeedbackCreate`, `onFeedbackUpdate`, `onFeedbackDelete`, `onFeedbackReply`: 이벤트별 callback
- `onEvent`: 모든 피드백 이벤트를 통합 수신
- callback에서 에러가 나도 localStorage 저장 결과는 rollback되지 않습니다.

```ts
import type { ReportEvent } from "stitchable";

function handleReportEvent(event: ReportEvent) {
    if (event.type === "feedback:create") {
        console.log("created", event.payload.id);
    }
}
```

### Custom storage adapter

저장소 자체를 API로 교체하려면 `storage` prop에 adapter를 전달합니다.

```tsx
import { Report } from "stitchable";

export default function App() {
    return (
        <Report
            devOnly
            storage={{
                list: () => fetch("/api/feedbacks").then((res) => res.json()),
                create: (payload) =>
                    fetch("/api/feedbacks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }).then((res) => res.json()),
                update: (id, payload) =>
                    fetch(`/api/feedbacks/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }).then((res) => res.json()),
            }}
        />
    );
}
```

```ts
import type { ReportStorageAdapter } from "stitchable";

export const adapter: ReportStorageAdapter = {
    list: async ({ pathname }) => [],
    create: async (payload) => ({
        ...payload,
        id: "temp-id",
        created_at: new Date().toISOString(),
        replies: payload.replies ?? [],
    }),
    update: async (id, payload) => {
        throw new Error(`Implement update for ${id}`);
    },
};
```

## Custom Adapter Example

```ts
import type {
    CreateReportFeedbackPayload,
    ReportFeedback,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "stitchable";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return response.json() as Promise<T>;
}

export const reportAdapter: ReportStorageAdapter = {
    list: ({ pathname }) =>
        request<ReportFeedback[]>(`/api/reports?pathname=${encodeURIComponent(pathname)}`),
    create: (payload: CreateReportFeedbackPayload) =>
        request<ReportFeedback>("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),
    update: (id: string, payload: UpdateReportFeedbackPayload) =>
        request<ReportFeedback>(`/api/reports/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),
};
```

## Data Contract

- `ReportField` 기본 지원 타입은 `textarea`, `checkbox` 입니다.
- `field_values`는 `Record<string, string | boolean>` 형태만 저장합니다.
- `replies`는 기본적으로 `id`, `message`, `created_at`를 가지며, `author_type`, `author_name`를 선택적으로 확장할 수 있습니다.
- 상태 흐름 기본값은 `open -> resolved -> archived` 입니다.
- cloud adapter는 `list/create/update`에서 local adapter와 동일한 정규화 결과를 반환해야 합니다.

## Reply / Status Policy

- 기본 `Report` 컴포넌트는 reply를 읽기 전용으로만 보여주고, 입력 UI는 관리자 화면이나 custom UI에서 확장합니다.
- reply 저장용 별도 adapter 메서드는 두지 않고, `update(id, { replies, status? })` 계약을 우선 사용합니다.
- `archived`는 종료 상태이며 기본 UI에서는 읽기 전용으로 취급합니다.

