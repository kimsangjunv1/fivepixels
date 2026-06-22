[폴더 구조 규칙]

Fivepixels은 FSD를 사용하지 않는다.

이 프로젝트는 React 라이브러리(package) 구조를 따른다.

src 최상위 구조는 아래를 기준으로 유지한다.

src/

├─ components/

├─ hooks/

├─ storage/

├─ types/

├─ utils/

├─ constants/

├─ providers/

├─ styles/

규칙:

- 새로운 최상위 폴더 생성 금지

- 기능 추가 시 기존 폴더 내부에 배치

- components 내부는 기능별 폴더 생성 가능

- storage 내부는 local, adapters 등 하위 폴더 생성 가능

- types는 공용 타입만 저장

- utils는 순수 함수만 저장

- providers는 Context Provider만 저장

- hooks는 React Hook만 저장

- hooks/useReportPersistence.ts: 목록·필터·mutation persistence 레이어

- hooks/usePanelFeedbackTransfer.ts: 패널 import/export/command 전용 상태

- styles는 Tailwind 입력 CSS와 Shadow Root에 주입할 빌드 결과 stylesheet를 저장

- components/motion처럼 재사용 UI primitive는 components 하위 기능 폴더로 둔다

FSD 구조(features, entities, widgets, shared 등)는 사용하지 않는다.

프로젝트를 분석할 때 위 구조를 우선 기준으로 판단한다.
