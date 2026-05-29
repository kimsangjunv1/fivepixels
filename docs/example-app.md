# Example App Guide

`stitchable`의 기본 생성/조회/수정 흐름을 브라우저에서 바로 확인할 수 있는 Vite example 앱입니다.

## 위치

- `examples/basic/index.html`
- `examples/basic/main.tsx`
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

## 확인 포인트

1. 우측 상단 `Report` 버튼으로 피드백 모드를 켭니다.
2. `group` 또는 `item` target을 클릭해 report를 생성합니다.
3. 생성된 마커를 눌러 목록 조회와 `message/status` 수정 흐름을 확인합니다.

## 주의사항

- example 앱은 Vite dev server로 실행해야 합니다.
- 로컬 저장소 검증을 위해 `pathname`을 `/examples/basic`으로 고정했습니다.
