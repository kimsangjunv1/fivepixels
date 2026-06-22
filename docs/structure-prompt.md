# 구조 통일 리팩토링 프롬프트

> **용도:** 1인 3프로젝트 환경에서 코드 규칙을 한 번에 맞출 때, AI/개발자에게 그대로 붙여넣는 프롬프트  
> **상세 설명:** [structure-guide.md](./structure-guide.md)

---

## 프롬프트 (아래부터 복사)

````
현재 프로젝트를 분석한 뒤, 아래 규칙에 맞지 않는 기존 파일을 리팩토링해라.
목표: FSD + 라우트 중심 혼합 구조(Optional FSD)를 모든 페이지에 통일한다.
팀 맥락: 1인당 3개 프로젝트 — URL만 알면 코드 위치를 추론할 수 있게 한다.

## MUST (반드시)

### 레이어 흐름
모든 페이지는 아래 흐름을 따른다.
app/page.tsx (서버) → views/*View.tsx → widgets/Panel.tsx → widgets/ui/*

import 방향:
app → views → widgets → features → entities → shared
(역방향 금지, shared는 어디서든 OK)

### app
- 라우팅: src/app
- 공개: src/app/(site)/...
- 로그인 이후: src/app/(login)/...
- page.tsx: 서버 컴포넌트, 파일명 page.tsx 고정
- page.tsx 역할: metadata, cookies()/searchParams(필요 시), Main 래핑, View 렌더만
- API Route: src/app/api/... (page UI 규칙과 분리)

### views
- 경로: src/views/{라우트 세그먼트}/
- 파일명: {RouteName}View.tsx
- Panel만 렌더 (얇은 adapter)
- 서버 fetch 결과·searchParams를 client에 넘길 때만 props adapter 허용

### widgets (라우트 미러링)
- 경로: src/widgets/{라우트 세그먼트}/ (views와 동일)
- 필수 파일: Panel.tsx ("use client"), index.ts (export { default as XxxPanel } from "./Panel")
- ui/: 섹션 컴포넌트 + ui/index.ts (named export)
- Panel: import * as Layer from "@/widgets/.../ui" 로 섹션 조립
- 기본 골격은 `src/widgets/members/details` 구조를 우선 참조한다
- 별도 공통 래퍼 컴포넌트(`PageFrame`, `PageSection`, `RouteScaffold` 등)를 새로 만들지 말고, Panel 안에서 바로 ui 섹션을 조립한다
- 라우트 전용 상태가 없더라도 기본적으로 `ui/Modal.tsx`, `modal/`, `model/useConfirmModalStore.ts`를 만들고 `Layer.Modal`을 Panel에 포함한다
- 기본 모달은 테스트용 `"test"` 타겟 1개가 바로 열고 닫히는 형태로 세팅한다
- 라우트 전용 상태가 비어 있더라도 테스트용 `useSearch` 같은 기본 훅 1개는 먼저 만든다

### PageProvider (조건부 MUST)
IF 2개 이상 ui 섹션이 같은 페이지 상태·행동(선택/필터/페이징/사이드패널 등)을 공유 THEN:
- widgets/{route}/model/ 생성
- {RouteName}PageProvider + use{RouteName}Provider + 목적형 하위 훅
- Panel.tsx가 PageProvider로 ui 섹션 전체를 감쌈
- ui 섹션은 use{RouteName}Provider()로 상태 소비 (페이지 공유 useState 금지)
- 기본 scaffold 단계에서는 `members/details`처럼 Provider + 테스트용 search hook + Modal 섹션이 먼저 동작하도록 만든 뒤, 실제 요구사항에 맞춰 확장한다

### entities
- 도메인 데이터: src/entities/{domain}/
- api/{domain}.api.ts, api/{domain}.query.ts, model/{domain}.type.ts
- lib/, constants/ 필요 시 허용
- features/widgets/views에 {domain}.api.ts / .query.ts 새로 만들지 마라

### shared API / fetch
- 공통 fetch 레이어: src/shared/lib/api/
- 필수 파일: server.ts, client.ts
- 파일이 없으면 `src/shared/lib/api/server.ts`, `src/shared/lib/api/client.ts`를 생성한다
- 서버 컴포넌트 / server action / route handler에서 API 호출 시 `server.ts` 사용
- client component / browser event handler에서 API 호출 시 `client.ts` 사용
- entities/{domain}/api/*.api.ts 는 fetch를 직접 구현하지 말고 `serverFetch` 또는 `clientFetch`만 조합해서 사용
- entities/{domain}/api/*.api.ts 는 endpoint, method, payload 조립만 담당하고 인증·에러 처리·응답 파싱은 shared fetch wrapper에 위임한다
- entities/{domain}/api/*.query.ts 는 `*.api.ts`를 감싸는 query option / hook만 담당하고 fetch, 인증, 공통 에러 처리를 넣지 않는다
- 인증, 공통 headers, 공통 에러 처리, 재시도, refresh 같은 횡단 관심사는 shared/lib/api에 모은다
- accessToken / refreshToken / cookies / auth header / hmac header 처리는 `server.ts`에 우선 모은다
- `server.ts`는 쿠키 기반 인증, refresh 재시도, 공통 headers, 공통 에러 추적을 담당한다
- `client.ts`는 브라우저 요청용 wrapper로 두고 `401`, `419` 같은 인증 만료 응답의 공통 후처리를 담당한다
- `client.ts`는 POST / PUT / PATCH / DELETE 요청에 대한 공통 loading UX와 에러 후처리를 담당한다
- Slack tracking, 공통 에러 로깅, 응답 메시지 정규화는 domain api가 아니라 shared/lib/api에서 처리한다
- `response.ok` 검사, `response.json()` 파싱, 실패 시 throw는 shared fetch wrapper가 공통 처리한다
- features/widgets/views에는 fetch wrapper를 새로 만들지 마라

### features
- 유스케이스(capability)명: features/auth, features/manageNews, features/submitInquiry
- 여러 라우트에서 재사용되는 UI·로직만
- 화면 조립은 widgets, 라우트 전용 상태는 widgets/model

### 공통 슬라이스 (라우트 미러링 예외)
- widgets/layout/ — Main, 사이트 공통 shell, subpage 컴포넌트
- widgets/admin/shared/ — admin 공통 레이아웃·store
- widgets/{route}/model/ — 해당 라우트 전용 PageProvider·훅

### 기본 scaffold MUST
- 새 라우트 구조를 만들 때는 아래 골격을 기본값으로 생성한다

```text
src/widgets/{route}/
  Panel.tsx
  index.ts
  modal/
    TestModal.tsx 또는 {RouteName}Modal.tsx
  model/
    useConfirmModalStore.ts
  ui/
    Title.tsx
    Action.tsx
    Analysis.tsx
    Modal.tsx
    index.ts
````

- 위 이름은 기본 scaffold 기준이다
- 실제 목적이 명확해지면 `Title/Action/Analysis`는 목적형 이름으로 바꿔도 되지만, 최소한 `Modal.tsx`는 기본 포함한다
- `ui/Modal.tsx`는 `modal/` 아래 테스트용 모달 export를 감싸는 얇은 연결 파일로 만든다
- `Panel.tsx`는 기본적으로 `<Layer.Modal />`을 포함해야 한다
- 테스트만 가능한 초기 상태라도 바로 렌더 가능한 더미 섹션을 만들어 구조를 비워두지 않는다

## MUST NOT (금지)

- page.tsx에서 widgets/ui/features 직접 렌더 (View 경유 필수)
- views에 비즈니스 로직, entities/features 직접 import
- page/views에서 widgets 없이 features 직접 연결
- features/widgets/views에 domain api/query/type 중복 생성
- features/widgets/views에 client/server fetch 함수 중복 생성
- entities/{domain}/api/\*.api.ts 에서 `fetch` 직접 호출
- entities/{domain}/api/\*.query.ts 에 인증/에러/HTTP 로직 혼합
- shared/lib/api 외 다른 공통 HTTP 유틸, axios wrapper, fetch wrapper 생성
- `*.api.ts`, `*.query.ts`, `*.type.ts`에서 `Fetch` / `Query` / `Payload` / `Response` suffix 규칙을 어기는 임의 네이밍
- ui 섹션에 페이지 공유 상태(useState) — PageProvider/model로 이동
- 모든 페이지 ui 파일명 Title/Status/Analysis 획일화
- useSearch 등 예시 훅 이름 기계 복붙
- 지시하지 않은 공통 래퍼 컴포넌트(`PageFrame`, `PageSection`, `PageContainer`, `RouteLayout` 등) 임의 생성
- Panel에서 children 기반 추상 레이아웃 컴포넌트로 한 번 더 감싸는 패턴
- Modal 없는 빈 scaffold 생성
- 테스트용 state/hook 없이 껍데기 파일만 만드는 방식

## IF / THEN (판단 규칙)

| 조건                                | 행동                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| 단일 섹션 정적 안내 페이지          | PageProvider 생략, Panel → ui 1개                              |
| 2+ 섹션 상태 공유                   | PageProvider + widgets/{route}/model 필수                      |
| 여러 라우트에서 같은 폼/에디터      | features/{capability}로 추출                                   |
| 서버에서 fetch한 데이터 전달        | page → View(props) → Panel → ui                                |
| API 호출 함수 위치를 정해야 함      | entities/{domain}/api는 shared/lib/api/client 또는 server 조합 |
| 서버 실행 컨텍스트에서 API 호출     | `serverFetch` 사용 + 쿠키/refresh/auth 처리 위임               |
| 브라우저 실행 컨텍스트에서 API 호출 | `clientFetch` 사용 + 401/419/loading 처리 위임                 |
| query 파일을 만들 때                | query option/hook만 두고 HTTP 세부 구현 금지                   |
| admin 목록+상세+사이드패널          | PageProvider + ui를 List/DetailSidebar 등으로 분리             |
| 미완성 페이지                       | page→view→Panel 골격 + ServicePlaceholder                      |

## PageProvider 구현 스켈레톤

widgets/{route}/model/{RouteName}Context.tsx:

"use client";

- createContext + {RouteName}PageProvider
- model/ 하위 훅 ReturnType을 spread해서 value 합침
- use{RouteName}Provider() — Provider 밖 사용 시 throw

widgets/{route}/model/useXxx.ts:

- default export 가능
- 페이지 UI 상태·행동만 (API는 entities query 사용)
- 반환 구조는 얕고 평평하게 (깊은 중첩 queue.confirm... 지양)

테스트용 기본 훅(useSearch 권장) 최소 조건:

- `useState` 기반
- 검색어 1개 + page 1개 정도의 최소 payload 보유
- `setKeyword`, `setPage`, `reset`, `search` 같은 테스트 가능한 액션 노출
- 실제 요구사항이 없어도 Provider/value 연결이 바로 가능해야 함

Panel.tsx:
<RouteNamePageProvider>
<Layer.SectionA />
<Layer.SectionB />
<Layer.Modal />
</RouteNamePageProvider>

## 네이밍

- View: {RouteName}View.tsx
- Panel export: {RouteName}Panel
- Provider: {RouteName}PageProvider
- 소비 훅: use{RouteName}Provider
- `entities/{domain}/api/*.api.ts` export 함수명: 동사 + 도메인/리소스 + `Fetch`
- `entities/{domain}/api/*.query.ts` export 함수명: `use` + 동사 + 도메인/리소스 + `Query`
- `entities/{domain}/model/*.type.ts` 요청 타입명: 의미 + `Payload`
- `entities/{domain}/model/*.type.ts` 응답 타입명: 의미 + `Response`
- 동사 규칙: 조회=`get`, 생성/등록=`set` 또는 `post`, 수정=`patch`, 삭제=`delete`, refresh/revoke/token 같은 인증 액션은 API 의미를 유지한다
- 컬렉션/단건 suffix 규칙: 목록=`List`, 상세=`Detail` 또는 `Details`, 페이지네이션 목록=`Paging`, 설정=`Config`, 상태=`State`, 로그=`Logs`, 통계=`Statistics`, 랭킹=`Rankings`
- query 함수명은 대응 api 함수명을 기준으로 `use` + `{Fetch 제거한 이름}` + `Query` 형태를 우선 사용한다
- queryKey 규칙: `[도메인 KEY 상수, 세부 리소스 식별자, 상태/파라미터...]` 형태의 배열을 기본으로 사용한다
- queryKey 첫 원소는 문자열 하드코딩보다 `MmachineRoutes.KEY_*` 같은 도메인 상수를 우선 사용한다
- queryKey 세부 식별자는 `"detail"`, `"list"`, `"paging"`, `"current"`, `"statistics"` 같은 목적형 문자열 또는 훅 식별 문자열을 사용한다
- queryKey 가변 값은 `storeIdx`, id, pathName, page, pageSize, 날짜 범위, payload 순으로 필요한 값만 평평하게 넣고 깊은 객체 중첩은 지양한다
- mutation 후 무효화/재조회는 기본적으로 동일한 첫 원소 KEY 상수를 기준으로 `invalidateQueries` 또는 `refetchQueries` 한다
- payload/response 타입명도 api/query에서 쓰는 리소스 명과 최대한 동일한 어근을 유지한다
- ui 섹션: 목적형 PascalCase (HeroIntro, InquiryTable, FilterBar)
- Context 파일: {RouteName}Context.tsx 권장 (레거시 SubscriptionContext.tsx 허용)
- 기본 scaffold 훅명: `useSearch` 허용
- 기본 테스트 모달 store 이름: `useConfirmModalStore` 권장
- 기본 테스트 모달 target 이름: `"test"` 권장

## 골든 패스 참조 (이 프로젝트)

/admin/inquiries:
app/(login)/admin/inquiries/page.tsx
→ views/admin/inquiries/AdminInquiriesView.tsx
→ widgets/admin/inquiries/Panel.tsx (AdminInquiriesPageProvider)
→ widgets/admin/inquiries/model/ + ui/InquiryTable, ui/InquiryDetailSidebar

/ (home) — Provider 생략:
app/(site)/page.tsx → views/home/HomeView.tsx → widgets/home/Panel.tsx → widgets/home/ui/\*

/members/details — 기본 scaffold 참조:
app/(login)/members/details/page.tsx
→ views/members/details/MemberDetailsView.tsx
→ widgets/members/details/Panel.tsx
→ widgets/members/details/model/useConfirmModalStore.ts
→ widgets/members/details/ui/Modal.tsx
→ widgets/members/details/modal/SubscriptionModal.tsx

API 네이밍 골든 샘플:

- `getStoreAgencyInfoFetch` ↔ `useGetStoreAgencyInfoQuery`
- `getDashboardFetch` ↔ `useGetDashboardQuery`
- `getProdGroupListPagingFetch` ↔ `GetProdGroupListPagingPayload` / `GetProdGroupListPagingResponse`
- `getNoticeDetailFetch` ↔ `useGetNoticeDetailQuery` ↔ `GetNoticeDetailPayload` / `GetNoticeDetailResponse`

queryKey 골든 샘플:

- `[MmachineRoutes.KEY_NOTICE, payload.noticeId]`
- `[MmachineRoutes.KEY_HISTORY, "daily", payload.StartDate, payload.EndDate, payload.Page, payload.PageSize]`
- `[MmachineRoutes.KEY_HOME, persistStoreIdx, currentPathName]`

## 작업 순서

1. 모든 page.tsx가 View 경유하는지 확인 (qna 등 예외 수정)
2. views ↔ widgets 라우트 1:1 미러링 확인
3. admin 복합 페이지 PageProvider + model + ui 분리
4. InquiryRequestForm 등 재사용 폼 → features/submitInquiry
5. entities 중복 제거, import 방향 위반 수정
6. 새로 만드는 모든 라우트에 기본 Modal + 테스트용 useSearch scaffold가 들어갔는지 확인

## 완료 후 출력 (필수)

1. 변경/생성/삭제 파일 목록
2. 라우트별 준수 표:

| 라우트 | page→view→panel | model/Provider | ui 섹션 분리 | entities 경유 | 비고 |
| ------ | --------------- | -------------- | ------------ | ------------- | ---- |

3. 아직 미준수 항목과 이유
4. app / views / widgets / features / entities 트리 요약

````

---

## 사용법

1. 위 ``` 블록 전체를 AI 또는 작업 티켓에 붙여넣기
2. 프로젝트별 특수 라우트가 있으면 `## IF / THEN` 아래에 한 줄 추가
3. 완료 후 **라우트별 준수 표**로 3개 프로젝트 결과를 비교

## MUST TOP 5 (팀 통일 최소셋)

프롬프트가 길면 아래 5개만이라도 프로젝트 간 통일:

1. `app → views → widgets/Panel → ui`
2. `widgets` 경로 = URL 세그먼트
3. `entities/{domain}/api + model` 패턴
4. `features` = capability명 (라우트명 아님)
5. 2+ 섹션 상태 공유 → `widgets/{route}/model` + PageProvider
````
