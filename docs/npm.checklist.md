# stitchable NPM Checklist

이 문서는 stitchable을 npm 패키지로 배포하기 위한 전용 체크리스트입니다.  
npm 관련 작업은 이 문서의 미완료 phase부터 순서대로 진행합니다.

## Phase N1. 패키지 정보 확정

목표: npm에 올릴 기본 메타데이터를 정한다.

- [ ] package 이름 확정
- [ ] scope 사용 여부 결정
- [ ] version 정책 결정
- [ ] description 확정
- [ ] license 여부 결정
- [ ] repository / homepage / bugs URL 정리

완료 기준
- `package.json`에 들어갈 핵심 메타데이터가 정리될 것

## Phase N2. 패키지 엔트리 정리

목표: 외부 사용자가 import할 엔트리와 타입 경로를 명확히 한다.

- [ ] `main` / `module` / `types` 경로 결정
- [ ] `exports` 필드 구조 결정
- [ ] `Report`와 공개 타입 export 범위 확정
- [ ] 내부 전용 파일이 외부로 노출되지 않게 정리

완료 기준
- 패키지 엔트리 구조가 명확하고 외부 import 경로가 고정될 것

## Phase N3. 빌드 산출물 구성

목표: npm 배포용 산출물을 만들 수 있게 한다.

- [ ] build 도구 결정
- [ ] ESM/CJS 지원 범위 결정
- [ ] declaration 파일 생성 설정
- [ ] source map 포함 여부 결정
- [ ] dist 폴더 구조 정리

완료 기준
- `npm run build` 후 배포 가능한 산출물이 생성될 것

## Phase N4. 배포 포함 파일 정리

목표: npm에 꼭 필요한 파일만 포함되도록 정리한다.

- [ ] `files` 필드 또는 `.npmignore` 설정
- [ ] README 포함 여부 확인
- [ ] LICENSE 포함 여부 확인
- [ ] docs/migration 포함 여부 결정
- [ ] 불필요한 개발 파일 제외

완료 기준
- `npm pack` 결과물에 필요한 파일만 포함될 것

## Phase N5. 문서/사용 예시 보강

목표: npm 사용자 기준의 설치/사용 문서를 맞춘다.

- [ ] 설치 방법 추가
- [ ] 기본 사용 예시 점검
- [ ] `data-report-id`, `data-report-type` 설명 보강
- [ ] local storage 사용 방식 설명
- [ ] custom adapter 예시 보강
- [ ] 주의사항/제약사항 정리

완료 기준
- npm 사용자 입장에서 README만 보고 기본 사용이 가능할 것

## Phase N6. 배포 전 검증

목표: publish 전에 최소 품질을 확인한다.

- [ ] typecheck 통과
- [ ] build 통과
- [ ] example 기준 수동 동작 확인
- [ ] export 경로 확인
- [ ] tree shaking / side effect 이슈 점검
- [ ] `npm pack` 결과 확인

완료 기준
- 로컬에서 배포 직전 검증이 모두 통과할 것

## Phase N7. Publish 준비

목표: 실제 npm publish 직전 필요한 설정을 확인한다.

- [ ] npm account/organization 확인
- [ ] publish access 설정 확인
- [ ] 2FA 여부 확인
- [ ] 최초 공개/비공개 배포 정책 확인
- [ ] release note 또는 changelog 정리

완료 기준
- 계정/권한 문제 없이 publish 가능한 상태일 것

## Phase N8. Publish 실행

목표: 실제 npm 배포를 수행하고 결과를 확인한다.

- [ ] `npm version` 반영
- [ ] `npm publish` 실행
- [ ] npm registry 반영 확인
- [ ] 설치 테스트 진행
- [ ] 배포 후 문서 링크 확인

완료 기준
- npm에서 설치 가능한 상태가 되고, 기본 설치 테스트가 통과할 것
