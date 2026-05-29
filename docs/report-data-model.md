# Report Data Model

`stitchable`은 local storage adapter와 향후 cloud adapter가 같은 데이터 계약을 공유하도록 아래 구조를 기준으로 합니다.

## 1. ReportField 확장 정책

- 현재 UI가 기본 지원하는 field type은 `textarea`, `checkbox` 두 가지입니다.
- 새 field type을 추가할 때는 최소 아래 3곳을 같이 수정해야 합니다.
- `createInitialFieldValues`
- `getFieldError`
- `renderFieldControl`
- `message`는 여전히 최상위 `report.message`를 기준으로 저장하고, `fields`에서는 입력 정책만 담당합니다.

## 2. field_values 직렬화 규칙

- `field_values`는 `Record<string, string | boolean>` 형태만 허용합니다.
- `textarea` 계열 값은 문자열로 저장합니다.
- `checkbox` 계열 값은 불리언으로 저장합니다.
- 어댑터는 저장 전후에 JSON 직렬화가 가능한 평평한 객체만 반환해야 합니다.
- 알 수 없는 값 타입은 역직렬화 시 제거하거나 기본값으로 치환하는 것을 권장합니다.

## 3. replies 타입 규칙

- 기본 reply 구조는 `id`, `message`, `created_at`입니다.
- 확장 대비용으로 `author_type`, `author_name`는 선택값입니다.
- 현재 사용자 UI는 reply를 읽기 전용으로만 표시하므로, cloud adapter도 같은 읽기 계약을 맞추면 됩니다.
- reply 입력 UI는 기본 `Report` 컴포넌트에 포함하지 않고, 관리자 화면 또는 custom UI에서 붙이는 것을 기본 정책으로 합니다.
- 라이브러리 기본 책임은 `replies` 렌더링과 상태 동기화까지로 제한합니다.
- reply draft가 필요하더라도 저장 전 상태로 `ReportFeedback`에 섞어 넣지 않고, UI 로컬 상태로만 관리하는 것을 권장합니다.

## 4. status 흐름

- 기본 상태 흐름은 `open -> resolved -> archived`입니다.
- `archived`는 종료 상태로 간주합니다.
- 필요 시 `resolved -> open` 재오픈은 허용할 수 있습니다.
- 권장 전이 규칙은 `REPORT_STATUS_TRANSITIONS` 상수를 따릅니다.
- reply가 추가되어도 자동으로 `status`를 변경하지 않는 것을 기본 정책으로 합니다.
- 운영 정책상 마지막 답변과 함께 종료 처리하고 싶다면, reply 저장 요청에서 `status: "resolved"` 또는 `status: "archived"`를 명시적으로 함께 보냅니다.
- 기존 reply 이력은 status 변경으로 삭제하지 않습니다.
- `archived` 상태의 report는 읽기 전용으로 보고, 기본 UI에서는 message/field/status/reply를 더 수정하지 않는 것을 기준으로 합니다.

## 5. Cloud Adapter 계약

- `list({ pathname })`는 현재 pathname 기준 report 배열을 최신 생성일 내림차순으로 반환합니다.
- `create(payload)`는 저장 완료된 `ReportFeedback` 전체 객체를 반환합니다.
- `update(id, payload)`는 반영된 `ReportFeedback` 전체 객체를 반환합니다.
- `field_values`, `replies`, `status`는 local adapter와 같은 형태로 정규화해서 반환해야 합니다.
- `replies`가 비어 있으면 항상 `[]`를 반환합니다.
- `remove`는 선택 구현입니다.
- reply 저장을 위해 별도 `reply.create()` 인터페이스를 추가하지 않고, 우선은 `update(id, { replies, status? })` 계약으로 유지합니다.
- 서버에서 reply 전용 endpoint를 쓰더라도 adapter 바깥 API에서 감추고, 최종적으로는 갱신된 `ReportFeedback` 전체를 반환해야 합니다.

## 6. archived UX 기준

- 기본 목록에서는 `archived`도 조회 가능하지만, 활성 작업 목록과 구분되는 종료 상태로 취급합니다.
- 상세에서는 reply/history를 계속 볼 수 있어야 합니다.
- 기본 UI에서 `archived` 항목은 다시 편집을 시작할 수 없고, 재활성화가 필요하면 관리자 또는 custom UI에서 명시적으로 `resolved -> open` 혹은 별도 복원 정책을 구현합니다.
