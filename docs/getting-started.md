# Getting Started

## 1. 설치

```bash
npm install fivepixels react react-dom
```

- `react`, `react-dom`은 peer dependency입니다.
- 브라우저 DOM이 있는 화면에서 사용하는 것을 기준으로 합니다.

## 2. 기본 연결

```tsx
import { FivePixels } from "fivepixels";

export function Page() {
    return (
        <>
            <FivePixels />

            <section data-report-id="hero" data-report-type="group">
                <h1>Hero Section</h1>
                <button data-report-id="hero-cta" data-report-type="item">
                    Start
                </button>
            </section>
        </>
    );
}
```

- `FivePixels`는 화면당 1개만 두는 것을 권장합니다.
- 마커 위치 복원은 `data-report-id`, `data-report-type` 조합을 기준으로 동작합니다.

## 3. Dataset 적용 가이드

- `data-report-id`: 화면 안에서 안정적으로 다시 찾을 수 있는 고유 식별자입니다.
- `data-report-type="group"`: 섹션, 카드, 모달처럼 큰 단위에 사용합니다.
- `data-report-type="item"`: 버튼, 입력창, 텍스트처럼 더 작은 단위에 사용합니다.
- 중첩된 경우에는 가장 가까운 `item`이 우선되고, 없으면 상위 `group`을 사용합니다.
- 동적으로 바뀌는 index 값보다 의미 있는 고정 id를 권장합니다.

예시

```tsx
<article data-report-id="pricing-card-pro" data-report-type="group">
    <button data-report-id="pricing-card-pro-cta" data-report-type="item">
        Upgrade
    </button>
</article>
```

## 4. localStorage 동작 방식

- `project.id`를 생략하면 `"my-app"`이 기본값입니다.
- handler props(`onList`, `onCreate`, `onUpdate`)를 넘기지 않으면 브라우저 `localStorage`를 사용합니다.
- 저장 키는 `fivepixels:reports:v1:{projectId}`이며, `environment`가 있으면 `:{environment}`가 추가됩니다.
- 저장된 report는 화면 키(`visibility.routeKey`, 기본값은 브라우저 pathname)별로 분리 조회됩니다.
- `field_values`는 문자열/불리언만 저장하고, `replies`는 배열로 정규화됩니다.
- 서버 연동이 필요하면 `onList` / `onCreate` / `onUpdate` / `onDelete` handler를 함께 넘깁니다.

## 5. 서버 persistence 연결

```tsx
import type { CreateReportFeedbackPayload, ReportFeedback, UpdateReportFeedbackPayload } from "fivepixels";
import { FivePixels } from "fivepixels";

export function Page() {
    return (
        <FivePixels
            project={{ id: "my-app" }}
            ui={{ showFeedbackList: true }}
            onList={({ pathname }) => fetch(`/api/feedbacks?pathname=${encodeURIComponent(pathname)}`).then((res) => res.json())}
            onListAll={({ cursor, limit }) =>
                fetch(`/api/feedbacks?cursor=${encodeURIComponent(cursor ?? "")}&limit=${limit}`).then((res) => res.json())
            }
            onNavigate={(pathname) => window.location.assign(pathname)}
            onCreate={(payload: CreateReportFeedbackPayload) =>
                fetch("/api/feedbacks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }).then((res) => res.json() as Promise<ReportFeedback>)
            }
            onUpdate={(id, payload: UpdateReportFeedbackPayload) =>
                fetch(`/api/feedbacks/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }).then((res) => res.json() as Promise<ReportFeedback>)
            }
            onDelete={(id) => fetch(`/api/feedbacks/${id}`, { method: "DELETE" }).then(() => undefined)}
        />
    );
}
```

- `onList({ pathname })`는 현재 경로의 report 목록을 반환해야 합니다.
- `onListAll({ cursor, limit })`을 제공하면 피드백 목록에서 전체 페이지 조회가 활성화됩니다.
- 전체 조회 응답은 `{ items, nextCursor? }` 형태여야 합니다.
- 다른 페이지 피드백을 SPA 라우터로 열려면 `onNavigate(pathname)`에 라우터 이동 함수를 연결하세요.
- `onCreate(payload)`, `onUpdate(id, payload)`는 최종 `ReportFeedback` 전체 객체를 반환해야 합니다.
- 응답의 `status`, `field_values`, `replies` 형태는 local adapter와 같게 맞추는 것이 안전합니다.
- 목록 패널 없이 마커만 확인하고 싶으면 `ui={{ showFeedbackList: false }}`를 사용할 수 있습니다.
- production 배포에서 UI를 숨기려면 `devOnly`를 사용하거나 `enabled={false}`로 직접 제어할 수 있습니다.
- analytics·Slack 알림은 `onEvent` / `onReply` side effect prop을 사용하세요.

## 6. FAQ / 주의사항

- 실행 가능한 브라우저 데모는 [`docs/example-app.md`](./example-app.md)를 참고합니다.

### Q. Next.js에서도 사용할 수 있나요?

가능합니다. 다만 `FivePixels`는 DOM을 직접 사용하므로 브라우저에서만 렌더링되게 두는 것이 안전합니다.

### Q. `message`를 custom field로 다시 써도 되나요?

권장하지 않습니다. `message`는 기본 메시지 본문과 연결되는 예약 key입니다.

### Q. report id를 랜덤으로 만들어도 되나요?

초기 렌더마다 바뀌면 마커를 다시 찾지 못할 수 있어 권장하지 않습니다. DOM 구조가 바뀌어도 유지되는 id를 쓰는 편이 좋습니다.

### Q. archived 상태도 수정 가능한가요?

기본 정책은 읽기 전용입니다. 재오픈 정책이 필요하면 custom UI 또는 persistence handler 정책에서 별도로 다루는 것이 좋습니다.

### Q. 같은 `data-report-id`를 여러 요소에 써도 되나요?

권장하지 않습니다. 마커 복원은 `document.querySelector`로 **첫 번째 일치 요소**만 사용합니다. 화면마다 id는 유일하게 두는 것이 안전합니다.

### Q. Shadow DOM이나 iframe 안 요소도 지원하나요?

`FivePixels` UI 자체는 Shadow Root에 렌더링되어 호스트 앱 CSS와 분리됩니다. 다만 피드백 **대상** 탐색은 메인 document 기준 `querySelector`/`elementFromPoint`만 사용합니다. 호스트 페이지 Shadow DOM 내부, iframe 내부 요소는 기본 UI로는 피드백 대상이 되지 않습니다.

### Q. UI에서 삭제는 어떻게 하나요?

서버 persistence를 쓰면 `onDelete`를 구현해야 합니다. 생략하면 삭제 시도 시 에러가 납니다. localStorage 기본 모드는 삭제를 지원합니다.

### Q. `project.id`를 생략해도 되나요?

가능하지만 기본값 `"my-app"`이 적용됩니다. 같은 origin에서 여러 앱/환경을 쓰면 localStorage 데이터가 섞일 수 있어, QA/스테이지/프로덕션마다 고유 `project.id`를 권장합니다.
