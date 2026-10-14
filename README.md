![fivepixels](https://raw.githubusercontent.com/kimsangjunv1/fivepixels/main/assets/fivepixels-banner.png)

# fivepixels

[MIT](./LICENSE) · [npm](https://www.npmjs.com/package/@fivepixels-js/react) · 한국어 / [English](./README-en_us.md)

`fivepixels`는 React 화면에서 요소를 선택해 피드백을 남길 수 있게 도와주는 라이브러리예요.

화면을 검수하다 보면 버튼 위치가 어긋나거나 문구를 수정해야 할 때가 있어요. 이런 내용을 전달하려면 화면을 캡처하고 어느 부분인지 설명해야 하는데, `fivepixels`를 사용하면 해당 요소를 선택해 바로 피드백을 남길 수 있습니다. 작성한 위치에 마커가 표시되므로 나중에 다시 열어 내용을 확인하거나 답변을 이어갈 수 있어요.

스테이징이나 QA 환경, 내부 도구에서 사용할 수 있고, 화면의 스타일을 직접 바꿔 수정 방향을 보여주는 UI Edit 기능도 제공합니다.

[사용 가이드 보기](https://fivepixels.codi-agit.com/fivepixels/guide)

## 설치

React 18 이상을 사용하는 프로젝트에 설치해 주세요.

```bash
npm install @fivepixels-js/react
```

`react`와 `react-dom`은 사용 중인 프로젝트에 설치되어 있어야 합니다. 패키지 설치 시 Node.js 18 이상이 필요하며, 별도 CSS 파일은 가져오지 않아도 돼요.

## 시작하기

화면에 `<FivePixels />`를 한 번 추가하면 사용할 수 있습니다. 아래 예제에서는 버튼에 `data-fp-id`를 붙여 피드백을 남긴 위치를 다시 찾을 수 있게 했어요.

```tsx
import { FivePixels } from "@fivepixels-js/react";

export default function App() {
    return (
        <>
            <main>
                <button data-fp-id="signup-button">
                    가입하기
                </button>
            </main>

            <FivePixels
                project={{ id: "my-app" }}
                ui={{ locale: "ko" }}
            />
        </>
    );
}
```

앱을 실행한 뒤 FivePixels 패널의 안내에 따라 작성자 정보를 설정하고, 피드백 추가 모드에서 버튼을 선택해 내용을 작성해 보세요. 저장한 피드백은 화면의 마커나 목록에서 다시 확인할 수 있습니다.

기본 설정에서는 현재 브라우저의 localStorage에 저장됩니다. 다른 브라우저나 팀원과 피드백을 공유하려면 아래의 API 연동이 필요해요.

## 화면 요소 지정하기

아래 설명은 FivePixels의 피드백 추가 모드에서 요소를 선택할 때의 동작입니다. 버튼의 원래 클릭 기능은 그대로 유지돼요.

### 피드백을 남길 요소에 이름 붙이기

`data-fp-id`는 피드백을 남길 요소에 붙이는 이름입니다. 저장한 피드백이 어느 버튼이나 영역에 달렸는지 다시 찾을 때 사용해요.

```tsx
<button data-fp-id="signup-button">
    가입하기
</button>
```

`signup-button`처럼 어떤 요소인지 알아볼 수 있는 이름을 붙여 주세요. 같은 화면에서는 이름이 겹치지 않게 지정하고, 화면의 배치가 바뀌어도 이름은 유지하는 편이 좋아요.

`data-fp-id`가 없는 요소에도 피드백을 남길 수 있습니다. 다만 이 경우에는 화면의 HTML 구조를 바탕으로 위치를 찾기 때문에, 나중에 구조가 바뀌면 원래 요소를 찾기 어려워질 수 있어요.

### 버튼 하나를 선택하기

버튼 하나에 피드백을 남기려면 `data-fp-type="item"`으로 지정해 주세요. 버튼 안에 글자나 아이콘이 있어도 버튼을 하나의 대상으로 선택합니다.

```tsx
<button data-fp-id="signup-button" data-fp-type="item">
    <span>가입하기</span>
    <span aria-hidden="true">→</span>
</button>
```

이 예제에서는 글자나 화살표 위에 마우스를 올려도 가입하기 버튼이 선택됩니다.

`data-fp-type`을 생략하면 `item`으로 동작하므로, 버튼에 `data-fp-id`만 붙여도 됩니다.

### 카드나 섹션 전체를 선택하기

카드 안의 제목, 설명, 버튼을 각각 선택하는 대신 카드 전체에 피드백을 남기고 싶다면 `data-fp-type="group"`으로 지정해 주세요.

```tsx
<section data-fp-id="product-card" data-fp-type="group">
    <h2>상품 이름</h2>
    <p>상품 설명</p>
    <button>구매하기</button>
</section>
```

이 예제에서는 제목, 설명, 구매 버튼 위에 마우스를 올려도 상품 카드 전체가 선택됩니다. 안쪽 요소가 따로 잡히지 않고, 영역 전체를 하나의 대상으로 다루고 싶을 때 사용할 수 있어요.

카드 안의 구매 버튼만 따로 선택하고 싶다면, 그 버튼에도 `data-fp-id`를 붙여 주세요.

```tsx
<section data-fp-id="product-card" data-fp-type="group">
    <h2>상품 이름</h2>
    <p>상품 설명</p>
    <button data-fp-id="product-buy" data-fp-type="item">
        구매하기
    </button>
</section>
```

이렇게 하면 구매 버튼은 개별로 선택되고, 제목이나 설명 위에서는 상품 카드 전체가 선택됩니다. 버튼의 `data-fp-type="item"`은 생략해도 같은 방식으로 동작해요.

### 모달이나 탭 안에 있는 요소

로그인 모달 안에 남긴 피드백은 모달이 닫혀 있으면 바로 볼 수 없어요. 피드백을 눌렀을 때 모달을 다시 열 수 있도록, 모달에는 `data-fp-view`를 붙이고 모달을 여는 버튼에는 `data-fp-open`을 붙여 주세요.

두 속성에는 같은 값을 지정합니다. 아래 예제에서는 둘 다 `login`으로 지정했어요. `isLoginOpen`은 모달이 열려 있는지 나타내는 값이고, `openLogin`은 모달을 여는 함수입니다.

```tsx
<button data-fp-open="login" onClick={openLogin}>
    로그인 열기
</button>

{isLoginOpen && (
    <div role="dialog" data-fp-view="login">
        <button data-fp-id="login-submit">
            로그인
        </button>
    </div>
)}
```

모달 안의 로그인 버튼에 남긴 피드백을 찾아가면 FivePixels가 `data-fp-open="login"` 버튼을 클릭해 모달을 다시 엽니다. 모달을 여는 `onClick`은 평소처럼 직접 연결해 주세요. `data-fp-open`만 붙인다고 모달을 여는 기능이 만들어지지는 않아요.

탭도 같은 방식으로 사용할 수 있습니다. 탭 내용에는 `data-fp-view`를, 해당 탭으로 전환하는 버튼에는 같은 값의 `data-fp-open`을 붙여 주세요.

모달 안에 다른 모달이 있는 것처럼 여러 영역을 열어야 하는 경우에는 바깥쪽부터 순서대로 엽니다.

## 화면에서 수정 방향 보여주기

UI Edit로 선택한 요소의 문구, 색상, 여백 등을 바꿔 볼 수 있습니다. “버튼 간격을 조금 넓혀 주세요”처럼 설명만으로 전달하기 어려운 내용을 화면에서 직접 보여줄 때 사용할 수 있어요.

1. 피드백 추가 모드에서 요소를 선택합니다.
2. 우클릭 메뉴에서 **수정하기**를 엽니다.
3. 값을 바꾸고 **적용**을 눌러 화면에서 확인합니다.

텍스트와 색상, padding·margin을 조정할 수 있으며, flex나 grid 요소를 선택하면 정렬과 간격도 변경할 수 있습니다. 적용한 내용은 **원래대로** 또는 패널의 **초기화**로 되돌릴 수 있고, 실행 취소·다시 실행과 Before / After 비교도 지원해요.

피드백을 작성하는 중이라면 변경 내용을 요약해 본문에 넣을 수도 있습니다.

UI Edit는 현재 화면의 DOM을 수정하는 기능입니다. 프로젝트의 소스 코드는 바뀌지 않으며, 피드백 작성을 멈춰도 적용한 편집은 남아 있지만 페이지를 새로고침하면 원래 화면으로 돌아갑니다.

## 표시 설정

언어와 패널·툴팁 테마는 `ui`로 설정합니다. 테마에는 `"light"`, `"dark"`, `"system"`을 사용할 수 있어요.

```tsx
<FivePixels
    project={{ id: "my-app" }}
    ui={{
        locale: "ko",
        panelAppearance: "light",
        tooltipAppearance: "light",
    }}
    visibility={{ devOnly: true }}
/>
```

`visibility.devOnly`를 설정하면 개발 환경에서만 표시됩니다. 스테이징 등 특정 환경에서 노출하려면 `visibility.enabled`에 앱의 환경 조건을 전달해 주세요.

## API 연동

<details>
<summary>서버 저장 설정과 예제 보기</summary>

팀원과 피드백을 공유하려면 데이터를 저장할 서버가 필요합니다. `sync="api"`로 설정하고, 서버 요청을 처리하는 `adapter`를 전달하면 돼요.

다음은 회사 로그인 없이 API 저장을 사용하는 예제입니다. `/api/feedbacks` 경로는 예시이므로 사용하는 서버에 맞춰 변경해 주세요.

```tsx
import {
    FivePixels,
    type FivePixelsAdapter,
    type ReportFeedback,
} from "@fivepixels-js/react";

async function request<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`/api/feedbacks${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`피드백 요청 실패: ${response.status}`);
    }

    return response.json();
}

const adapter: FivePixelsAdapter = {
    markers: {
        list: ({ pathname }) =>
            request<ReportFeedback[]>(
                `/markers?pathname=${encodeURIComponent(pathname)}`,
            ),
    },
    feedback: {
        create: (payload) =>
            request<ReportFeedback>("", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        getForUi: (id) =>
            request<ReportFeedback>(`/${encodeURIComponent(id)}/overview`),
        update: (id, payload) =>
            request<ReportFeedback>(`/${encodeURIComponent(id)}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
    },
};

export default function App() {
    return (
        <FivePixels
            project={{ id: "my-app", env: "stage" }}
            ui={{ locale: "ko" }}
            sync="api"
            require={{ authLogin: false, reviewerKey: false }}
            adapter={adapter}
        />
    );
}
```

이 예제의 API는 목록 요청에서 `ReportFeedback[]`, 생성·조회·수정 요청에서 `ReportFeedback`을 반환해야 합니다. 서버의 응답 구조가 다르면 adapter에서 변환해 주세요.

`adapter`는 예제처럼 컴포넌트 밖에서 선언하거나 `useMemo`로 유지해야 합니다. 렌더링할 때마다 새 객체를 전달하면 목록 요청이 반복될 수 있어요.

서버 저장에 필요한 함수는 `markers.list`, `feedback.create`, 그리고 `feedback.update` 또는 `cases.update`입니다. 답변과 팀원 관리 등 추가 기능을 연동할 때는 해당 함수도 구현해야 합니다.

회사 로그인을 사용하려면 `require.authLogin`을 활성화하고 `auth.login`을 구현해 주세요. API 모드에서는 회사 로그인이 기본으로 활성화되어 있으며, 위 예제처럼 비활성화하면 표시 이름과 개인 키를 설정하는 방식으로 시작합니다.

구체적인 요청·응답 타입과 구현은 다음 파일에서 확인할 수 있어요.

- [API 연동 예제](./examples/basic/src/fivepixels/adapter.ts)
- [FivePixelsAdapter 타입](./src/shared/types/adapter.ts)
- [피드백과 요청 데이터 타입](./src/shared/types/report.ts)

설정 패널의 **API 연동** 탭에서는 연결 상태를 확인할 수 있습니다.

</details>

## 전체 옵션

<details>
<summary>옵션 목록과 타입 보기</summary>

| 옵션 | 용도 |
| --- | --- |
| `project` | 프로젝트 ID, 환경 이름, 버전 |
| `ui` | 언어, 패널·툴팁 테마, 피드백 목록과 답변 표시 설정 |
| `visibility` | 표시 여부, 개발 환경 제한, 현재 경로 식별 |
| `team` | 팀원·검수자 정보 |
| `mode` | 기본 모드 또는 시연용 `"presentation"` 모드 |
| `sync` | 저장 방식. 기본값은 `"local"`, 서버 연동은 `"api"` 또는 `"artemis"` |
| `require` | 회사 로그인과 검수자 키 확인 여부 |
| `adapter` | 저장, 로그인, 답변, 팀원 관리에 사용할 서버 요청 함수 |
| `fields` | 피드백 작성란에 추가할 텍스트 입력이나 체크박스 |
| `onNavigate` | 다른 경로의 피드백을 찾아갈 때 실행할 함수 |
| `onEvent` | 피드백 생성·수정·삭제, 답변, GitHub Issue 생성 시 실행할 함수 |
| `onReply` | 답변 작성 시 실행할 함수 |
| `github` | GitHub Issue 생성 설정 |
| `networkMonitor` | 앱의 fetch·XHR 요청 수집 여부. 기본값은 `true` |

정확한 타입은 [FivePixelsProps](./src/shared/types/publicApi.ts)를 참고해 주세요. 기존 `requireAuth`와 `team.requireReviewerKey` 대신 `require.authLogin`, `require.reviewerKey`를 사용합니다.

</details>

## 커스텀 UI

<details>
<summary>Provider와 상태 훅 보기</summary>

기본 UI 대신 직접 만든 패널이나 오버레이를 사용하려면 `@fivepixels-js/react/report`에서 `ReportProvider`와 필요한 훅을 가져올 수 있습니다.

| 훅 | 접근할 수 있는 내용 |
| --- | --- |
| `useReportPreferences()` | 테마, 언어 등 UI 설정 |
| `useReportSession()` | 현재 모드, 선택한 요소, 작성 중인 피드백과 마커 |
| `useReportData()` | 피드백 목록, 필터, 생성·수정·삭제와 답변 기록 |
| `useReport()` | 전체 상태 |

훅은 `ReportProvider` 안에서 사용해야 합니다. 내부 구성은 [Context 구현](./src/shared/providers/reportContextPartitions.ts)을 참고해 주세요.

</details>

## 기여

버그를 발견했거나 제안하고 싶은 기능이 있다면 [Issue](https://github.com/kimsangjunv1/fivepixels/issues)를 남겨 주세요. Pull Request도 받고 있습니다.

저장소를 직접 실행할 때는 CI와 같은 Node.js 22를 권장합니다. 기능·수정 브랜치는 `develop`에서 만들고, PR 전에는 `npm run lint`와 `npm run build`를 확인해 주세요.

자세한 내용은 [기여 안내](./CONTRIBUTING.md)에 정리되어 있습니다.

## 라이선스

MIT © Sangjun Kim. [LICENSE](./LICENSE) 파일을 참고하세요.
