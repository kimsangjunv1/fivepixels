현재 프로젝트를 분석 후 아래 요구사항에 안맞거나 보완이 필요한 기존 모든 파일들을 리팩토링해줘.

기존 파일들을 리팩토링 해야한다.
목표는 아래 적어둔 최대한 구조/흐름/파일명 규칙 및 예시를 참고하여 FSD + 라우트 중심 혼합 구조를 재현하는 것이다.
"예:" 는 내가 예시로 적어둔걸 그대로 만들라는게 아니라 현재파일들을 어떻게 조정할지 참고하라는거다.
핵심 아키텍처 흐름:
app(서버 컴포넌트) -> views(클라이언트 라우트 뷰) -> widgets(라우트 중심 조립 레이어) -> features(shared/entities와 함께 기능 단위 책임 분리)

반드시 지킬 구조 규칙:

최상위 라우팅은 Next.js App Router 기준 src/app 에 둔다.
로그인 이후 화면은 src/app/(login) 그룹 아래에 라우트별 폴더를 만든다.
각 페이지 파일은 반드시 page.tsx 파일명으로 만들고, 서버 컴포넌트로 유지한다.
각 page.tsx 는 아래 역할만 수행한다.
next/headers 의 cookies() 호출
필요 시 searchParams 수신
공통 레이아웃 Main 으로 감싸기
실제 화면은 views 레이어 컴포넌트를 렌더링
즉 page에서 직접 UI를 조립하지 말고 반드시 views/.../\*View.tsx 를 렌더링하게 해라.

예시 흐름:
src/app/(login)/dashboard/page.tsx
src/views/dashboard/DashboardView.tsx
src/widgets/dashboard/Panel.tsx

views 규칙:

src/views 는 라우트 기준 폴더 구조를 그대로 따른다.
파일명은 반드시 {RouteName}View.tsx 형식으로 만든다.
예: DashboardView.tsx
예: PaymentHistoryView.tsx
예: MemberDetailsView.tsx
views 는 매우 얇은 레이어로 유지한다.
views 내부에서는 복잡한 로직 없이 해당 라우트의 widgets/.../Panel export만 렌더링한다.
즉 views 는 “라우트와 위젯을 연결하는 중계 레이어” 역할만 해야 한다.

widgets 규칙:

src/widgets 는 라우트 중심 구조로 설계한다.
폴더 구조는 라우트 세그먼트를 그대로 반영한다.
예: widgets/dashboard
예: widgets/sales/details
예: widgets/payment/history
예: widgets/settings/remoteControl
각 라우트 폴더에는 기본적으로 아래 파일 구조를 만든다.
Panel.tsx
index.ts
ui/
index.ts 는 반드시 export { default as XxxPanel } from "./Panel"; 형식으로 Panel만 export 한다.
Panel.tsx 는 반드시 "use client" 로 시작한다.
Panel.tsx 는 해당 라우트의 최상위 클라이언트 조립 컴포넌트다.
Panel.tsx 내부에서는 아래 패턴을 기본값으로 사용한다.
페이지 전용 Provider로 전체 섹션 감싸기
widgets/.../ui/index.ts 에서 export 한 섹션 컴포넌트들을 순서대로 렌더링
즉 핵심은 “PageProvider로 감싼 뒤, 해당 라우트에 필요한 섹션 컴포넌트들을 조립한다”는 구조다.
섹션 개수와 이름은 라우트 목적에 맞게 결정해라.
예를 들어 어떤 페이지는 Header, FilterBar, Chart, SummaryCards 일 수 있고, 어떤 페이지는 Title, UserStatus, RecentActivity, ActionBar, Modal 일 수 있다.
실제 섹션 개수는 라우트 성격에 따라 달라도 되지만, “Provider로 감싸고 UI 섹션을 조립한다”는 규칙은 반드시 유지해라.

Panel 예시 패턴:
DashboardPageProvider 안에 대시보드 목적에 맞는 섹션들 조립
MemberDetailsPageProvider 안에 회원 상세 목적에 맞는 섹션들 조립
PaymentHistoryPageProvider 안에 결제 이력 목적에 맞는 섹션들 조립
중요한 건 Title, Status, Analysis 라는 이름을 고정으로 쓰는 게 아니라, 실제 UI 목적에 맞는 이름을 쓰는 것이다.

widgets/ui 규칙:

src/widgets/{route}/ui 아래에는 화면 섹션 단위 컴포넌트를 둔다.
파일명은 반드시 “역할 기반의 목적형 이름”으로 지어라.
가장 짧고 명확하게 해당 섹션의 목적이 드러나는 이름을 우선한다.
좋은 예:
UserStatus.tsx
Chart.tsx
SalesChart.tsx
FilterBar.tsx
SummaryCards.tsx
PaymentAccountForm.tsx
RemoteControlGuide.tsx
NoticeList.tsx
RecentActivity.tsx
ActionBar.tsx
Modal.tsx
주의:
Title.tsx, Status.tsx, Analysis.tsx, Action.tsx 같은 이름은 금지가 아니라 “정말 그 이름이 목적을 가장 잘 설명할 때만” 사용해라.
즉 예시 이름을 모든 페이지에 기계적으로 복붙하지 마라.
각 라우트의 실제 역할과 섹션 목적을 먼저 해석한 뒤 파일명을 정해야 한다.
ui/index.ts 에서 각 섹션을 named export 한다.
Panel.tsx 에서는 import \* as XxxLayer from "@/widgets/.../ui"; 형식으로 가져와 조립한다.
섹션 컴포넌트는 프레젠테이션 + 훅 사용 정도까지 허용하고, 페이지 전체 컨텍스트 구성 책임은 가지지 않는다.

Provider / model 규칙:

이 프로젝트의 중요한 패턴은 “페이지 단위 Provider가 있고 Panel이 그 Provider로 UI를 감싼다”는 점이다.
기본 원칙은 Provider를 src/features/{route}/model/ 아래에 둔다.
예: features/dashboard/model/...
예: features/members/details/model/...

Provider를 담는 컨텍스트 파일명은 기능에 맞게 가장 간단명료한 이름을 사용해라.
SubscriptionContext.tsx 는 허용되지만 고정 규칙이 아니다.
예를 들어 더 목적이 분명하면 아래처럼 이름 지어도 된다.
DashboardContext.tsx
MemberDetailsContext.tsx
PaymentHistoryContext.tsx

Provider 컴포넌트명은 {RouteName}PageProvider 형식으로 한다.
예: DashboardPageProvider
예: MemberDetailsPageProvider

custom hook 이름은 use{RouteName}Provider 형식으로 한다.

Provider 내부에서 조합하는 하위 훅들도 고정 템플릿 이름으로 만들지 마라.
useSearch, useSelectStatus, usePaymentMethod 는 예시일 뿐이며, 실제로는 해당 페이지 상태/행동 목적이 가장 잘 드러나는 이름으로 만들어라.

좋은 예:
useMemberFilter
useMemberSelection
useSalesChart
useSalesSummary
usePaymentHistoryFilter
usePaymentAccountForm
useRemoteControlState

주의:
모든 페이지에서 useSearch, useSelectStatus, usePaymentMethod 를 반복 생성하지 마라.
먼저 그 페이지 Provider가 어떤 상태와 행동을 묶는지 해석한 뒤, 그 목적이 가장 짧고 명확하게 드러나는 이름으로 훅을 분리해라.

위 훅들은 기본적으로 같은 레이어의 model 폴더에 둔다.
단, 이 프로젝트처럼 일부 라우트는 widgets/{route}/model 아래에 Provider와 훅이 있을 수도 있으니, 라우트 전용 화면 상태라면 widgets/model에 두는 것도 허용한다.

다만 우선순위는 아래처럼 맞춰라.
공통성/재사용 가능성이 있으면 features/{route}/model
화면 조립 전용 상태면 widgets/{route}/model

Provider는 createContext + useContext 기반으로 만들고, Provider 내부에서 관련 훅 반환값을 합쳐 value로 내려라.

즉 이 섹션의 핵심은 아래다.

Provider는 페이지 단위로 둔다.
컨텍스트 파일명은 목적형으로 짓는다.
내부 훅 이름도 목적형으로 짓는다.
예시 이름을 모든 페이지에 기계적으로 재사용하지 마라.

shared / entities / features 책임 규칙:

shared 는 전역 공용 자원이다.
공통 스타일
공통 훅
공통 유틸
상수
범용 UI
entities 는 도메인 데이터 단위 책임을 둔다.
api
model
types
entities 레이어는 현재 프로젝트의 banner 구조를 기준으로 통일한다.
참고 기준 파일:
src/entities/banner/api/banner.api.ts
src/entities/banner/api/banner.query.ts
src/entities/banner/model/banner.type.ts

entities 는 반드시 도메인별 폴더를 만들고, 그 내부를 api / model 로 분리한다.
도메인 데이터 파일은 기능 폴더 내부가 아니라 src/entities/{domain} 기준으로 관리한다.

entities 파일 경로와 파일명 패턴은 아래로 고정한다.
src/entities/{domain}/api/{domain}.api.ts
src/entities/{domain}/api/{domain}.query.ts
src/entities/{domain}/model/{domain}.type.ts

예:
src/entities/banner/api/banner.api.ts
src/entities/banner/api/banner.query.ts
src/entities/banner/model/banner.type.ts

각 파일의 책임은 아래처럼 구분한다.
{domain}.api.ts 는 실제 요청 함수 또는 서버/DB 접근 함수를 둔다.
클라이언트 요청은 src/shared/lib/api/client.ts 의 clientApi 를 통해 수행한다.
서버 요청이 필요한 경우 src/shared/lib/api/server.ts 의 serverApi 또는 서버 전용 접근 함수를 사용한다.
Supabase 같은 DB 접근이 필요한 경우에도 해당 도메인의 실제 접근 함수는 {domain}.api.ts 에 모은다.

{domain}.query.ts 는 TanStack Query 관련 구성을 둔다.
query key 상수
useQuery 훅
useMutation 훅
invalidateQueries 같은 캐시 갱신 로직
성공/실패 토스트 같은 요청 결과 처리

{domain}.type.ts 는 해당 도메인의 타입 정의를 둔다.
Database 기반 Row 타입
payload 타입
response 타입
mutation payload 타입
필요한 도메인 전용 유니온/enum 타입

features, widgets, views 에서 도메인 데이터 접근이 필요하면 가능한 한 entities 를 통해 사용한다.
예를 들어 배너 데이터가 필요하면 src/entities/banner/api/banner.query.ts 의 훅이나 src/entities/banner/api/banner.api.ts 의 요청 함수를 사용한다.
features 내부에 도메인별 api / query / type 파일을 새로 만들지 않는다.
widgets 는 라우트 조립과 섹션 렌더링을 담당하고, 데이터 요청은 entities 의 query 훅을 통해 가져온다.
views 는 widgets Panel만 연결해야 하므로 직접 entities 를 호출하지 않는다.

entities 레이어의 핵심은 아래다.
도메인 단위로 src/entities/{domain} 아래에 둔다.
api / model 폴더를 분리한다.
실제 요청은 {domain}.api.ts 에 둔다.
TanStack Query 훅과 query key 는 {domain}.query.ts 에 둔다.
타입은 {domain}.type.ts 에 둔다.
features/widgets/views 에 도메인 데이터 접근 코드가 흩어지지 않게 한다.
features 는 기능 중심 로직을 둔다.
페이지/도메인별 컨텍스트
특정 기능 훅
기능성 UI 일부
단, 이 프로젝트는 순수 FSD가 아니라 라우트 중심 widgets가 강하므로, 화면 조립은 절대 features가 아니라 widgets가 담당하게 해라.
즉 features는 “기능 로직”, widgets는 “라우트 조립”으로 역할을 분리해라.

app/layout 규칙:

src/app/layout.tsx 에 전역 provider와 전역 layout 컴포넌트를 배치한다.
이 프로젝트 패턴을 따라 아래 순서를 기본값으로 유지해라.
GlobalErrorBoundary
QueryProvider
AuthProvider
GlobalErrorListener
Header
Sidebar
PopupProvider
children
Footer
Progress
Toast
전역 provider 파일은 src/app/providers 아래에 둔다.
AuthProvider.tsx
QueryProvider.tsx
PopupProvider.tsx
필요 시 PlanProvider.tsx
QueryProvider 는 @tanstack/react-query 기반으로 세팅해라.

Main 레이아웃 규칙:

페이지 공통 래퍼는 src/widgets/layout/Main.tsx 로 만든다.
Main 은 "use client" 컴포넌트로 둔다.
props는 기본적으로 아래 형태를 따른다.
children
id?
className?: { container: string; inner: string }
내부에서는 현재 pathname 기반으로 공통 padding / sidebar offset / max width 처리를 담당하게 해라.
각 page.tsx 에서는 Main 을 감쌀 때 아래 형식과 최대한 유사하게 맞춰라.
id={"dashboard"}
className={{ inner: "px-[2.0rem] max-w-[var(--size-pc)]", container: "min-h-[calc(100dvh-10.8rem)]" }}

파일명/네이밍 규칙:

라우트 기반 폴더명은 URL 세그먼트를 그대로 사용한다.
payment/history
settings/remoteControl
View 파일명은 PascalCase + View
Panel export 이름은 PascalCase + Panel
Provider 이름은 PascalCase + PageProvider
Provider hook 이름은 usePascalCaseProvider
ui 하위 파일명은 예시 템플릿 고정이 아니라, 각 섹션 목적을 가장 간단하고 명확하게 설명하는 PascalCase 이름으로 짓는다.
가능한 한 index export 패턴을 유지한다.

미완성 페이지 처리 규칙:

아직 실제 기능 설계가 없는 페이지도 구조는 먼저 동일하게 생성해라.
이 경우 widgets/layout/ServicePlaceholder.tsx 같은 공통 placeholder 컴포넌트를 두고 사용해라.
즉 “기능 미완성이라도 구조는 완성된 상태”가 되게 해라.
placeholder를 쓸 때도 page -> view -> widget Panel 흐름은 반드시 유지해라.

생성해야 할 산출물:

src/app/(login) 라우트 구조
대응되는 src/views 구조
대응되는 src/widgets 구조
필요한 src/features/.../model/SubscriptionContext.tsx
필요한 src/app/providers
src/widgets/layout/Main.tsx
전역 layout 연결

중요한 금지 사항:

page.tsx 에서 직접 복잡한 UI를 구현하지 마라.
views 에서 비즈니스 로직을 넣지 마라.
widgets 없이 바로 features 를 page에 연결하지 마라.
순수 FSD처럼만 만들지 말고, 반드시 라우트 중심 widgets 조립 구조를 유지해라.
폴더 구조를 임의로 단순화하지 마라.
이 프로젝트와 다르게 provider 위치나 file naming을 바꾸지 마라.
widgets/ui 파일명을 모든 페이지에 Title, Status, Analysis 식으로 획일화하지 마라.

작업 방식:

먼저 위 구조를 만족하는 폴더/파일을 생성해라.
예시 라우트 23개만 만드는 게 아니라, 대표 라우트 패턴이 반복 가능하도록 기본 골격을 완성해라.
생성 후에는 현재 프로젝트 구조를 아래 형식으로 요약해라.
app 구조
views 구조
widgets 구조
features model 구조
provider 연결 구조
마지막에 “이 구조가 왜 FSD + 라우트 중심 혼합 구조인지” 35줄로 짧게 설명해라.
