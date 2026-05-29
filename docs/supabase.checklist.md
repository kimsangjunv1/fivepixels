# stitchable Supabase Checklist

이 문서는 stitchable의 cloud 저장소를 Supabase로 확장할 때 사용하는 전용 체크리스트입니다.  
로컬 MVP와 분리해서 관리하며, Supabase 작업을 시작할 때 이 문서의 미완료 phase부터 순서대로 진행합니다.

# 규칙

- 체크리스트를 읽고 가장 앞의 미완료 phase부터 진행
- 작업 완료 시 해당 항목과 phase 상태를 체크로 갱신

## Phase S1. 범위 확정

목표: local storage MVP와 Supabase 확장의 경계를 명확히 한다.

- [ ] Supabase 범위를 저장소 adapter 구현까지로 제한할지 확인
- [ ] 인증 범위 포함 여부 결정
- [ ] 관리자 전용 기능 제외 범위 재확인
- [ ] 답변 저장 포함 여부 결정

완료 기준

- 이번 Supabase 작업에서 포함/제외 범위가 명확할 것

## Phase S2. 스키마 정리

목표: 현재 라이브러리 타입과 Supabase 테이블 구조를 일치시킨다.

- [ ] `ui_reports` 최종 컬럼 점검
- [ ] `status` / `field_values` / `replies` migration 검증
- [ ] 필요한 추가 컬럼 유무 점검
- [ ] 인덱스 전략 검토
- [ ] legacy 좌표 fallback 컬럼 유지 정책 정리

완료 기준

- 타입과 실제 Supabase 스키마가 충돌하지 않을 것

## Phase S3. Adapter 구현

목표: `ReportStorageAdapter`를 만족하는 Supabase adapter를 구현한다.

- [ ] `list({ pathname })` 구현
- [ ] `create(payload)` 구현
- [ ] `update(id, payload)` 구현
- [ ] 필요 시 `remove(id)` 구현 여부 결정
- [ ] adapter 생성 방식 정리

완료 기준

- `storage={supabaseAdapter}` 형태로 연결 가능한 수준일 것

## Phase S4. 클라이언트/환경 설정

목표: 외부 프로젝트에서 Supabase를 연결할 수 있는 설정 방식을 정리한다.

- [ ] Supabase client 주입 방식 결정
- [ ] 환경변수 직접 사용 여부 결정
- [ ] 브라우저 전용 사용 범위 정리
- [ ] SSR/CSR 사용 시 주의사항 정리

완료 기준

- 사용자 프로젝트에서 adapter를 어떻게 초기화하는지 명확할 것

## Phase S5. 정책/RLS 검토

목표: 공개 피드백 저장 구조에 맞는 최소 보안 정책을 정리한다.

- [ ] anonymous insert 허용 정책 검토
- [ ] pathname 기반 조회 정책 검토
- [ ] update 허용 범위 정책 검토
- [ ] abuse 방지 전략 메모

완료 기준

- 기본 공개 사용 시 위험 요소와 정책 초안이 정리될 것

## Phase S6. 문서/예제 추가

목표: Supabase 연결 예제를 문서화한다.

- [ ] Supabase adapter 사용 예시 추가
- [ ] migration 적용 방법 문서화
- [ ] 필요한 env/config 예시 추가
- [ ] local ↔ supabase 전환 예시 추가

완료 기준

- README 또는 docs만 보고 Supabase 연결을 시도할 수 있을 것

## Phase S7. 검증

목표: Supabase 저장 흐름이 실제로 동작하는지 확인한다.

- [ ] create 동작 확인
- [ ] list 동작 확인
- [ ] update 동작 확인
- [ ] element ratio 기반 재배치 확인
- [ ] fallback 좌표 동작 확인

완료 기준

- Supabase 환경에서 생성/조회/수정이 최소 1회 이상 검증될 것
