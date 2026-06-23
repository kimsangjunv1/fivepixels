# Contributing

한국어 | [English](./CONTRIBUTING-en_us.md)

fivepixels에 기여해 주셔서 감사합니다. Issue와 Pull Request를 환영합니다.

## 시작하기

- Node.js 20
- 저장소 클론 후 `npm ci`

## 브랜치

| 작업 | 기준 브랜치 |
| ---- | ----------- |
| 기능·수정 | `develop`에서 분기 |
| 긴급 수정 | `main`에서 분기 (필요한 경우만) |

PR은 가능하면 `develop`을 대상으로 보내 주세요.

## PR 전 확인

```bash
npm run lint
```

필요하면 아래도 실행해 주세요.

```bash
npm run build
npm run dev
```

CI에서 `typecheck`, `test`, `build`, 번들 크기, example 빌드를 검사합니다.

## PR 작성

- 무엇을, 왜 바꿨는지 간단히 적어 주세요.
- 관련 Issue가 있으면 연결해 주세요.
- 기존 코드 스타일과 패턴을 따르고, 범위 밖 리팩터링은 피해 주세요.

## Issue

버그·기능 제안은 [GitHub Issues](https://github.com/kimsangjunv1/fivepixels/issues)에서 템플릿을 사용해 주세요.
