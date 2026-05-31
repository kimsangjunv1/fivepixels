# stitchable Checklist

이 문서는 stitchable 라이브러리 작업의 기준 체크리스트입니다.  
앞으로 "페이즈 진행하자"라고 요청하면 이 문서에서 완료되지 않은 가장 앞 phase부터 순서대로 진행합니다.

# 규칙

- 체크리스트를 읽고 가장 앞의 미완료 phase부터 진행
- 작업 완료 시 해당 항목과 phase 상태를 체크로 갱신

## Phase 1. 현재 구조 안정화

목표: 기존 서비스에서 분리해 온 코드를 라이브러리 관점의 최소 구조로 정리한다.

- [x] 현재 파일 구조와 migration 상태 분석
- [x] `report_id`, `report_type`, element ratio 기반 기존 로직 재사용 여부 확인
- [x] Next.js 전용 의존성 제거
- [x] `ReportStorageAdapter` 인터페이스 설계
- [x] `localStorage` adapter MVP 구현
- [x] `Report` 기본 생성/목록/수정 UI 연결
- [x] README 사용 예시 추가

완료 기준

- `Report`가 브라우저 환경에서 Next 의존성 없이 동작 가능한 구조일 것
- 저장소가 최소 `localStorage` 기반으로 생성/조회/수정 가능할 것

## Phase 2. 라이브러리 엔트리/설정 복구

목표: 실제 배포 가능한 라이브러리 기본 설정과 개발 검증 기반을 복구한다.

- [x] GitHub repository 생성 또는 기존 repository 연결 (`https://github.com/kimsangjunv1/stitchable.git`)
- [x] `package.json` 추가
- [x] `tsconfig.json` 추가
- [x] export entry 기준 alias/path 정리
- [x] 최소 build 스크립트 구성
- [x] 최소 lint 또는 typecheck 스크립트 구성
- [x] 현재 코드 기준 실제 build/typecheck 통과

완료 기준

- 루트에서 build/typecheck 명령이 실행 가능할 것
- repository URL을 패키지 메타데이터에 연결 가능한 상태일 것
- 외부 사용자가 import 가능한 엔트리 구조가 명확할 것

## Phase 3. 타입/데이터 모델 정교화

목표: 현재 MVP 데이터 구조를 장기 유지 가능한 타입으로 다듬는다.

- [x] `ReportField` 확장 정책 정리
- [x] `field_values` 직렬화/역직렬화 규칙 명확화
- [x] `replies` 타입을 답변 UI 확장에 맞게 정리
- [x] `status` 흐름 정의 정리
- [x] cloud adapter가 구현해야 할 계약 문서화

완료 기준

- 로컬/클라우드 저장소가 동일한 타입 계약으로 동작할 것
- 데이터 구조가 README 또는 docs에 설명될 것

## Phase 4. UX 보강

목표: 피드백 작성과 확인 흐름의 사용성을 개선한다.

- [x] 목록 패널 모바일 대응 여부 정리
- [x] 하이라이트/마커 상호작용 개선
- [x] 빈 상태/에러 상태 UI 개선
- [x] 수정 중 상태와 선택 상태 충돌 정리
- [x] appearance 스타일 디테일 보정

완료 기준

- 기본 생성/조회/수정 플로우가 데스크톱/모바일에서 크게 어색하지 않을 것
- 오류 상황에서 사용자 메시지가 일관될 것

## Phase 5. 답변/관리 구조 준비

목표: 향후 관리자/답변 기능 확장을 위한 최소 구조를 정리한다.

- [x] reply 입력 UI 정책 정의
- [x] 답변 저장 adapter 인터페이스 확장 여부 결정
- [x] status 변경과 reply 관계 정리
- [x] archived 처리 UX 정의

완료 기준

- 답변 기능을 붙일 때 데이터 구조를 다시 크게 뜯지 않아도 될 것

## Phase 6. 예제 및 문서 보강

목표: 외부 프로젝트에서 빠르게 설치/적용할 수 있도록 문서를 보완한다.

- [x] 설치 방법 문서화
- [x] dataset 적용 가이드 추가
- [x] local storage 동작 방식 설명
- [x] custom adapter 예제 추가
- [x] FAQ 또는 주의사항 정리

완료 기준

- 외부 사용자가 README와 docs만 보고 기본 적용을 시도할 수 있을 것

## Phase 7. 검증/배포 준비

목표: 라이브러리 배포 전 최소 품질 기준을 맞춘다.

- [x] typecheck 통과
- [x] build 통과
- [x] 예제 기준 수동 동작 검증
- [x] migration 검토
- [x] 배포 전 체크리스트 정리
- [x] Vitest 단위 테스트 (`npm run test`)
- [x] GitHub Actions CI (typecheck, test, build, example:build)

완료 기준

- 배포 전 반드시 확인할 항목이 문서로 남아 있을 것
- 최소 1개 예제 흐름에서 생성/조회/수정이 확인될 것

## Phase 8. example 앱 추가

목표: 라이브러리를 실제 소비하는 예제 앱을 추가해 설치/검증 진입점을 만든다.

- [x] example 앱 폴더 구조 정의
- [x] 예제 앱의 개발 실행 방식 결정
- [x] `stitchable` 로컬 패키지 연결 방식 정리
- [x] 기본 생성/조회/수정 데모 화면 구성
- [x] example 앱 실행 가이드 문서화

완료 기준

- 외부 사용자가 example 앱을 실행해 기본 피드백 흐름을 브라우저에서 확인할 수 있을 것
- 라이브러리 변경 시 example 앱으로 수동 검증이 가능한 상태일 것

## Phase 9. 다양한 기능 추가

목표: 기본 UI의 노출 제어와 마커 상호작용을 보강한다.

- [x] 피드백 목록 숨김 옵션 추가
- [x] 사용자 피드백 마커 hover 툴팁 UI 추가

완료 기준

- 라이브러리 사용자가 목록 패널 노출 여부를 옵션으로 제어할 수 있을 것
- 마커 hover만으로 피드백 내용을 빠르게 확인할 수 있을 것
