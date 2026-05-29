# Example App Guide

`stitchable`의 기본 생성/조회/수정 흐름을 브라우저에서 바로 확인할 수 있는 정적 example 앱입니다.

## 위치

- `examples/basic/index.html`
- `examples/basic/main.js`
- `examples/basic/styles.css`

## 실행 방법

루트에서 아래 명령을 실행합니다.

```bash
npm run example
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:4173/examples/basic/
```

## 연결 방식

- example 앱은 published package를 다시 설치하지 않고, import map으로 루트 `dist/index.js`를 직접 참조합니다.
- `react`, `react-dom/client`, `zustand`는 브라우저 ESM CDN을 사용합니다.
- 라이브러리 소스를 수정한 뒤에는 루트에서 `npm run build`를 다시 실행하고 example 페이지를 새로고침하면 됩니다.

## 확인 포인트

1. 우측 상단 `Report` 버튼으로 피드백 모드를 켭니다.
2. `group` 또는 `item` target을 클릭해 report를 생성합니다.
3. 생성된 마커를 눌러 목록 조회와 `message/status` 수정 흐름을 확인합니다.

## 주의사항

- example 앱은 정적 서버에서 열어야 합니다. `file://`로 직접 열면 module/import 제약으로 정상 동작하지 않을 수 있습니다.
- 로컬 저장소 검증을 위해 `pathname`을 `/examples/basic`으로 고정했습니다.
