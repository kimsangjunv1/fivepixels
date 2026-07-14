# fivepixels 기능 목록

`fivepixels`(`@fivepixels-js/react` v0.1.7)는 스테이징·QA·내부 도구 화면에서 DOM 요소 단위 피드백을 남기는 React 라이브러리입니다.

---

## 핵심 기능

| 구분 | 기능 | 설명 |
|------|------|------|
| **엔트리포인트** | `<FivePixels />` | 앱에 한 번 렌더링하면 전체 UI·오버레이 활성화 |
| **렌더링** | Shadow DOM | 별도 CSS import 없이 격리된 UI 렌더링 |
| **대상 지정** | `data-report-id` | 요소 식별 및 마커 위치 복원 |
| **대상 유형** | `data-report-type` | `item`(기본) / `group`(섹션 단위) |
| **대체 추적** | CSS selector | `data-report-id` 없을 때 selector로 대체 추적 |
| **프로젝트 스코프** | `project.id/env/version` | 프로젝트·환경·버전별 피드백 분리 |

---

## UI 모드

| 모드 | 단축키 | 기능 |
|------|--------|------|
| **Report (피드백 추가)** | `⌘⇧M` | 요소 클릭 → 마커 찍기 → 피드백 작성 |
| **View (조회)** | `⌘⇧L` | 마커·목록 조회, 답변·검수 |
| **선택 요소 미리보기** | `⌘⇧E` | 피드백 가능한 요소 하이라이트 토글 |
| **검색 포커스** | `⌘⇧S` | 피드백 목록 검색창 포커스 |
| **제출** | `⌘Enter` | 피드백/답변 제출 |
| **취소** | `Escape` | 현재 작업 취소 |

---

## 피드백 작성·관리

| 기능 | 설명 |
|------|------|
| **다중 케이스** | 하나의 피드백에 여러 케이스(항목) 추가·수정·삭제 |
| **케이스 담당자** | 케이스별 `assignee_name` 지정 |
| **케이스 상태** | `open` / `resolved` |
| **커스텀 필드** | `textarea`, `checkbox` 타입 필드 정의 |
| **마커 위치** | 클릭 좌표 + viewport + scroll + anchor 저장 |
| **드래프트 마커** | 작성 중 임시 마커 표시 |
| **피드백 상태** | `open` → `git_issued` → `resolved` → `archived` |
| **피드백 삭제** | 목록에서 삭제 (확인 다이얼로그) |
| **피드백 복사** | 피드백 내용 클립보드 복사 |
| **요소 위치 이동** | 목록에서 클릭 시 해당 DOM 요소로 스크롤·펄스 애니메이션 |
| **숨겨진 대상 복원** | `onRevealTarget` 콜백으로 모달·탭 등 숨겨진 요소 노출 후 이동 |

---

## 답변·스레드

| 기능 | 설명 |
|------|------|
| **답변 작성** | 피드백에 텍스트 답변 추가 |
| **답변 상태** | `suggested`, `additional_question`, `found_error`, `recheck_requested`, `resolved` |
| **케이스 연결** | 답변을 특정 케이스에 연결 |
| **중첩 답변** | `parent_reply_id`로 스레드형 대화 |
| **질문 스레드** | 케이스별 질문·답변 그룹 (펼침/접힘 설정 가능) |
| **작성자 구분** | `user` / `manager` / `system` |
| **검수 액션** | 제안 확인·재확인 요청·오류 발견 등 브랜치 액션 |
| **이슈 진행 표시** | 케이스 해결률·진행 상태 배지 |

---

## UI Edit 모드 (시안 조정 / Pick Probe)

| 기능 | 설명 |
|------|------|
| **패널 열기** | 피드백 모드에서 요소 우클릭 → **수정하기** |
| **텍스트 편집** | `textContent`, `fontSize`, `lineHeight` |
| **박스 편집** | `padding`, `margin` (−/+ 스테퍼) |
| **색상 편집** | `textColor`, `backgroundColor`, `borderColor` (hex·피커·복사) |
| **Flex 레이아웃** | 주축·교차축 정렬, 방향·뒤집기, `gap` |
| **Grid 레이아웃** | 가로·세로 칸 수 (1~12), `gap` |
| **적용** | `element.style` 인라인 스타일로 DOM에 즉시 반영 |
| **수정됨 배지** | 편집된 요소에 시각적 표시 |
| **원래대로** | 해당 요소 스타일만 되돌림 |
| **지우기** | 하이라이트 애니메이션 후 DOM에서 제거 (세션 내 복원 가능) |
| **Undo / Redo** | ◀ / ▶ 단계별 실행 취소·재실행 |
| **전체 초기화** | 세션의 모든 편집·삭제 한 번에 복원 |
| **Before / After** | 저장된 스타일 변경 전후 비교 |
| **변경 요약 반영** | 피드백 드래프트에 스타일 변경 요약 자동 삽입 |
| **세션 유지** | 피드백 모드 종료 후에도 편집 DOM 유지 (새로고침 시 초기화) |

---

## 컨트롤 패널 UI

| 기능 | 설명 |
|------|------|
| **탭** | 페이지 상세 / 피드백 목록 / 설정 |
| **도킹** | 좌·우측 패널 고정, 접기/펼치기 |
| **리사이즈** | 패널 너비·높이 조절, 크기 초기화 |
| **통계** | 현재 페이지 피드백 수 (전체·해결·진행 중) |
| **환경 배지** | `env` 값 표시 |
| **모바일 대응** | 모바일 뷰포트 감지 및 UI 조정 |
| **드래그 앤 드롭** | JSON 파일 드래그로 피드백 가져오기 |

---

## 피드백 목록

| 기능 | 설명 |
|------|------|
| **스코프** | 현재 페이지 / 전체 페이지 |
| **필터** | 상태·유형별 필터 |
| **검색** | 텍스트 검색 |
| **페이지네이션** | `onListAll` + cursor 기반 더 불러오기 |
| **호버 카드** | 마커 호버 시 피드백 미리보기 |
| **경로 이동** | View 모드에서 다른 pathname으로 이동 (`onNavigate`) |

---

## 페이지 상세 (Route Details)

| 기능 | 설명 |
|------|------|
| **경로별 통계** | 현재 pathname의 상태별 건수 (전체 / 오늘) |
| **필드 통계** | 커스텀 필드별 집계 |

---

## 데이터 저장·연동

| 기능 | 설명 |
|------|------|
| **localStorage** | handler 미지정 시 기본 저장소 |
| **커스텀 API** | `onList` / `onCreate` / `onUpdate` (+ 선택적 `onDelete`, `onListAll`, `onListReplies`, `onCreateReply`) |
| **이벤트 콜백** | `onEvent` — create/update/delete/reply/github 이벤트 |
| **답변 side effect** | `onReply` 콜백 |
| **Storage Adapter** | `createLocalStorageReportAdapter` 공개 API |

---

## 데이터 가져오기·보내기

| 기능 | 설명 |
|------|------|
| **JSON보내기** | 전체 피드백 JSON 다운로드 |
| **JSON 가져오기** | 파일 선택 또는 드래그 앤 드롭 |
| **프로젝트 불일치 확인** | 다른 프로젝트 데이터 import 시 확인 다이얼로그 |
| **Command 패널** | JSON 텍스트 붙여넣기로 일괄 삽입·교체 |
| **충돌 처리** | 동일 ID 존재 시 교체 확인 다이얼로그 |
| **스키마 검증** | `validateFeedbackImport` 유틸리티 |

---

## GitHub Issue 연동

| 기능 | 설명 |
|------|------|
| **Issue 생성** | `on-create`(생성 시) / `from-list`(목록에서) 모드 |
| **상태 연동** | `git_issued` 상태 및 Issue URL 저장 |
| **시스템 답변** | Issue 생성 시 자동 스레드 항목 |
| **Issue 링크** | 생성된 Issue 바로가기 버튼 |

---

## 팀·인증

| 기능 | 설명 |
|------|------|
| **작성자** | `team.user` — `{ id, name }` |
| **리뷰어 목록** | `team.reviewers` — 공개키 포함 가능 |
| **개인 키** | ECDSA P-256 기반 개인키 생성·보관·회전 |
| **서명 인증** | `feedback:create/update`, `reply:create` 액션 서명·검증 |
| **리뷰어 키 필수** | `requireReviewerKey` 옵션 |

---

## UI·설정

| 기능 | 설명 |
|------|------|
| **테마** | `light` / `dark` / `system` |
| **다국어** | `en` / `ko` (메시지 커스터마이즈 가능) |
| **표시 제어** | `visibility.enabled`, `devOnly` (개발 환경만) |
| **라우트 키** | `visibility.routeKey` — SPA 라우팅 연동 |
| **단축키 표시** | `visibleShortcutKeys` 토글 |
| **피드백 목록 표시** | `showFeedbackList` 토글 |

---

## 공개 API·유틸리티

| 항목 | 설명 |
|------|------|
| `FivePixels` | 메인 컴포넌트 |
| `ReportProvider` / `useReport` | 컨텍스트 기반 하위 컴포넌트 연동 |
| `reportCases` 유틸 | 케이스 생성·상태 동기화·권한 확인 |
| `personalKey` 유틸 | 키 생성·서명·검증 |
| `githubIntegration` 유틸 | Issue 연동 헬퍼 |
| `i18n` | `getReportMessages`, `resolveReportLocale` 등 |
| 타입 export | `ReportFeedback`, `ReportCase`, `ReportReply` 등 전체 타입 |

---

## 기술·품질

| 항목 | 설명 |
|------|------|
| **React 18+** | peer dependency |
| **TypeScript** | 전체 타입 정의 제공 |
| **Vitest** | 단위 테스트 (pickProbe, feedback, coordinates 등) |
| **번들 측정** | `size:bundle` 스크립트 |
| **예제 앱** | `examples/basic` — Pulse 대시보드 데모 |
