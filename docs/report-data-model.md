# Report Data Model

`fivepixels`은 local storage adapter와 향후 cloud adapter가 같은 데이터 계약을 공유하도록 아래 구조를 기준으로 합니다.

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

- reply 구조는 `id`, `message`, `created_at`, `status`를 기본으로 합니다.
- `status`는 `suggested`, `found_error`, `recheck_requested`, `resolved` 중 하나입니다.
- 확장 대비용으로 `author_type`, `author_name`는 선택값입니다.
- 기본 FivePixels UI는 view 모드에서 답변 작성·검수 흐름(`denied` / `confirm` / `checkout`)을 지원합니다.
- `denied`, `checkout`은 UI 단계이며, 전송 후 저장되는 상태는 각각 `found_error`, `suggested`입니다. 단, `found_error`에 대한 `denied`는 `recheck_requested`로 저장됩니다.
- `confirm` 시 `resolved` reply를 추가하고, 필요하면 같은 `update` 요청에서 피드백 `status: "resolved"`를 함께 보냅니다.
- GitHub Issue 전송 시 `author_type: "system"` reply를 추가합니다. 메시지 기본값은 `Issue has been sent to GitHub.`이며, UI에서 Issue 바로가기·링크 복사를 함께 표시합니다.
- reply draft는 `ReportFeedback`에 섞지 않고 UI 로컬 상태로만 관리합니다.
- local adapter는 역직렬화 시 알 수 없거나 누락된 `reply.status`를 `suggested`로 정규화합니다.

## 4. status 흐름

- 기본 상태 흐름은 `open -> git_issued -> resolved -> archived`입니다.
- `git_issued`는 GitHub Issue로 승격된 상태입니다. `integrations.github` 메타와 함께 저장됩니다.
- `archived`는 종료 상태로 간주합니다.
- 필요 시 `resolved -> open` 재오픈은 허용할 수 있습니다.
- 권장 전이 규칙은 `REPORT_STATUS_TRANSITIONS` 상수를 따릅니다.
- 일반 답변(`suggested`, `found_error`, `recheck_requested`)만 추가할 때는 피드백 `status`를 자동으로 바꾸지 않습니다.
- 검수 완료(`confirm`) 시에는 `resolved` reply와 함께 피드백 `status: "resolved"`를 명시적으로 보냅니다.
- GitHub Issue 전송 시에는 `status: "git_issued"`, `integrations.github`, 시스템 reply를 같은 `update` 요청으로 보냅니다.
- 종료 보관이 필요하면 `status: "archived"`를 명시적으로 보냅니다.
- 기존 reply 이력은 status 변경으로 삭제하지 않습니다.
- `archived` 상태의 report는 읽기 전용으로 보고, 기본 UI에서는 message/field/status/reply를 더 수정하지 않는 것을 기준으로 합니다.

## 4-1. integrations.github

- `ReportFeedback.integrations.github`는 선택 필드입니다.
- 형태: `{ issue_number: number; issue_url: string; issued_at: string }`
- import/export, local adapter, custom persistence handler 모두 동일한 형태를 유지해야 합니다.
- GitHub API 호출은 라이브러리 밖(`github.onCreate` 콜백 + 앱 서버)에서 처리합니다.

## 5. Cloud Adapter 계약

- `list({ pathname })`는 현재 pathname 기준 report 배열을 최신 생성일 내림차순으로 반환합니다.
- `create(payload)`는 저장 완료된 `ReportFeedback` 전체 객체를 반환합니다.
- `update(id, payload)`는 반영된 `ReportFeedback` 전체 객체를 반환합니다.
- `field_values`, `replies`, `status`는 local adapter와 같은 형태로 정규화해서 반환해야 합니다.
- `replies`가 비어 있으면 항상 `[]`를 반환합니다.
- `remove`는 선택 구현입니다.
- reply 저장을 위해 별도 `reply.create()` 인터페이스를 추가하지 않고, 우선은 `update(id, { replies, status? })` 계약으로 유지합니다.
- 서버에서 reply 전용 endpoint를 쓰더라도 adapter 바깥 API에서 감추고, 최종적으로는 갱신된 `ReportFeedback` 전체를 반환해야 합니다.

## 5-1. 담당자 서명

- `team.requireReviewerKey` 또는 reviewer의 `publicKey`가 설정되면 create/update payload에 `auth`가 포함됩니다.
- `auth`는 `author_id`, `algorithm`, `action`, `signed_at`, `signature`로 구성됩니다.
- API 서버는 `author_id`로 DB의 reviewer 공개키를 조회한 뒤 `verifyReportAuthProof`로 payload를 검증합니다.
- 서버는 클라이언트가 보낸 `author_name`을 신뢰하지 않고 검증된 reviewer 정보로 덮어씁니다.
- `signed_at` 유효 시간, 요청 재사용 방지, 삭제 권한은 서버에서 별도로 강제합니다.

## 6. archived UX 기준

- 기본 목록에서는 `archived`도 조회 가능하지만, 활성 작업 목록과 구분되는 종료 상태로 취급합니다.
- 상세에서는 reply/history를 계속 볼 수 있어야 합니다.
- 기본 UI에서 `archived` 항목은 다시 편집을 시작할 수 없고, 재활성화가 필요하면 관리자 또는 custom UI에서 명시적으로 `resolved -> open` 혹은 별도 복원 정책을 구현합니다.
