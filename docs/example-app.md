# Example App Guide

`fivepixels`의 기본 생성/조회/수정 흐름을 브라우저에서 바로 확인할 수 있는 Vite example 앱입니다.

## 위치

- `examples/basic/index.html`
- `examples/basic/main.tsx`
- `examples/basic/src/App.tsx` — `<FivePixels />` 풀 설정 (localStorage + GitHub mock)
- `examples/basic/styles.css`
- `examples/basic/vite.config.ts`

## 실행 방법

루트에서 아래 명령을 실행합니다.

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:5173/
```

## 연결 방식

- example 앱은 Vite alias로 루트 `src/index.ts`를 직접 참조합니다.
- 라이브러리 소스를 수정한 뒤에는 별도 build 없이 새로고침만 해도 변경을 바로 확인할 수 있습니다.

## 확인 체크리스트

1. 우측 상단 **Report** 버튼(또는 `⌘⇧M`)으로 report 모드를 켭니다.
2. `data-report-type="group"` 섹션이나 `item` 버튼을 클릭해 피드백을 작성합니다.
3. **View** 버튼(또는 `⌘⇧L`)으로 view 모드를 켜 저장된 마커·목록을 확인합니다.
4. 마커를 hover/click해 답변·검수(`denied` / `confirm`) 흐름을 확인합니다.
5. 설정(⚙) 메뉴에서 **Import / Export**, locale·appearance 변경을 확인합니다.
6. 피드백 작성 시 또는 목록에서 **Git Issue** 승격(mock `POST /api/github/issues`)을 확인합니다.

## App.tsx와 README Full Example 차이

| 항목 | example App.tsx | README Full Example |
| ---- | --------------- | ------------------- |
| persistence | localStorage (handler 없음) | 서버 `onList`/`onCreate`/`onUpdate`/`onDelete` |
| GitHub | mock API 연동 | 동일 패턴 |
| `visibility.routeKey` | `"/examples/basic"` 고정 | 예시용 `"/dashboard"` |

로컬 저장만 검증하려면 App.tsx 그대로, API 연동 패턴은 README [Full Example](../README.md#full-example)을 참고하세요.

## 주의사항

- example 앱은 Vite dev server로 실행해야 합니다.
- 로컬 저장소 검증을 위해 `visibility.routeKey`를 `"/examples/basic"`으로 고정했습니다. 실제 앱에서는 생략해 pathname 기준 분리를 쓰는 것이 일반적입니다.
