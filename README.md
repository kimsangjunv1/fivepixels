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
- `devOnly`를 주면 `NODE_ENV === "production"`일 때 Report UI를 렌더링하지 않습니다.
- `enabled={false}`를 주면 환경과 관계없이 Report UI를 렌더링하지 않습니다.

## Storage

- `storage="local"`: 기본 `localStorage` adapter를 사용합니다.
- `storage={adapter}`: `ReportStorageAdapter` 인터페이스를 구현한 cloud adapter를 연결할 수 있습니다.
- 데이터 계약 상세는 `[docs/report-data-model.md](./docs/report-data-model.md)`를 기준으로 맞춥니다.
- 설치/적용/FAQ는 `[docs/getting-started.md](./docs/getting-started.md)`를 참고합니다.
- 실행 가능한 데모와 `npm run dev` 사용법은 `[docs/example-app.md](./docs/example-app.md)`를 참고합니다.

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

