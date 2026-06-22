# Reviewer key authentication

담당자 인증은 브라우저에서 생성한 ECDSA P-256 키 쌍을 사용합니다. 개인키는 담당자 브라우저에만 두고, 공개키만 개발자 또는 서버에 전달합니다.

## 개발자와 담당자 설정 순서

1. 개발자가 `requireReviewerKey: true`와 담당자 `id`, `name` 목록을 먼저 배포합니다.
2. 담당자가 패널에서 본인 이름을 선택하고 키 쌍을 생성합니다.
3. 패널이 복사한 공개키를 담당자가 개발자에게 전달합니다.
4. 개발자는 전달자의 신원을 별도 채널로 확인한 뒤 해당 담당자의 `publicKey`에 등록합니다.
5. 설정 또는 DB 반영 후 담당자가 페이지를 새로고침합니다.
6. 개인키와 공개키가 일치한 담당자 이름만 자동 선택되며 다른 담당자는 선택할 수 없습니다.
7. 담당자는 설정의 **개인키 백업**으로 개인키를 안전하게 보관합니다. 개인키는 개발자에게 전달하지 않습니다.

## localStorage 방식

공개키는 공개 정보이므로 클라이언트 환경변수에 둘 수 있습니다.

```tsx
const reviewers = [
    {
        id: "kim",
        name: "김담당",
        publicKey: import.meta.env.VITE_FIVEPIXELS_PUBLIC_KEY_KIM,
    },
    {
        id: "lee",
        name: "이담당",
        publicKey: import.meta.env.VITE_FIVEPIXELS_PUBLIC_KEY_LEE,
    },
];

<FivePixels
    project={{ id: "my-app", env: "stage" }}
    team={{
        requireReviewerKey: true,
        reviewers,
    }}
/>;
```

초기 공개키 수집 배포에서는 `publicKey`를 생략합니다. 공개키를 전달받아 환경변수에 넣은 뒤 다시 배포하면 매칭된 담당자만 작성할 수 있습니다.

localStorage 모드는 서명을 남기고 UI의 담당자 선택을 제한하지만, 브라우저 저장 데이터 자체를 개발자 도구로 조작하는 것까지 막지는 못합니다.

### localStorage 키 재발급

1. 담당자가 설정에서 **키 재발급**을 확인합니다.
2. 브라우저의 기존 개인키가 새 개인키로 교체되고 새 공개키가 복사됩니다.
3. 담당자가 새 공개키를 개발자에게 전달합니다.
4. 개발자는 동일한 reviewer `id`의 환경변수 공개키만 교체하고 재배포합니다.
5. 재배포 전까지 작성 기능은 잠기며, 기존 리뷰는 reviewer `id`가 같으므로 그대로 유지됩니다.

기존 개인키가 유출된 경우 이전 배포본에서는 여전히 사용될 수 있으므로 가능한 한 빨리 새 공개키로 재배포해야 합니다.

## API 방식

담당자 API는 공개키를 포함해 반환하고, `<FivePixels />`에는 조회 결과를 넘깁니다.

```tsx
<FivePixels
    project={{ id: "my-app", env: "production" }}
    team={{
        requireReviewerKey: true,
        reviewers: reviewersFromApi,
    }}
    onList={listFeedback}
    onCreate={createFeedback}
    onUpdate={updateFeedback}
/>;
```

서버는 클라이언트의 `author_id`, `author_name`을 신뢰하지 않고 서명을 검증한 뒤 DB의 담당자 정보로 덮어씁니다.

```ts
import {
    verifyReportAuthProof,
    type CreateReportFeedbackPayload,
    type ReportAuthor,
} from "fivepixels";

async function verifyCreate(
    payload: CreateReportFeedbackPayload,
    reviewers: ReportAuthor[],
) {
    if (!payload.auth) return false;

    const reviewer = reviewers.find(
        (item) => item.id === payload.auth?.author_id,
    );
    if (!reviewer?.publicKey) return false;

    return verifyReportAuthProof({
        proof: payload.auth,
        publicKey: reviewer.publicKey,
        projectId: "my-app",
        environment: "production",
        action: "feedback:create",
        payload,
    });
}
```

`feedback:update`도 동일하게 검증하며 `signed_at` 허용 시간, 재사용 방지 nonce, 삭제 권한은 서버 정책으로 추가합니다. 검증 성공 후 저장할 작성자 이름은 반드시 DB의 reviewer 값으로 결정합니다.

### API 키 재발급과 폐기

권장 테이블은 공개키를 reviewer 행에 덮어쓰기보다 이력으로 관리합니다.

```sql
create table reviewer_keys (
  id uuid primary key,
  reviewer_id uuid not null,
  public_key text not null,
  status text not null check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
```

1. 담당자가 **키 재발급** 후 새 공개키를 관리자에게 전달합니다.
2. 관리자는 담당자 신원을 확인합니다.
3. 트랜잭션에서 기존 active 키를 `revoked`로 바꾸고 새 키를 `active`로 저장합니다.
4. 서명 검증은 active 키만 허용합니다.
5. reviewer `id`는 바뀌지 않으므로 기존 리뷰 권한과 감사 이력은 유지됩니다.

분실은 동일하게 재발급하고, 유출은 기존 키를 즉시 revoke하는 차이가 있습니다.
