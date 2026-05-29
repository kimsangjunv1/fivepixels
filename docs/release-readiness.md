# stitchable Release Readiness

기준일: 2026-05-29

## 패키지 경량화

- 런타임 `dependencies` 없음 (`react`, `react-dom`만 peer)
- 빌드에 포함되지 않던 `src/lib`, `src/model`, `src/shared/types/Database.ts` 제거
- `npm run size:dist`로 `dist/*.js` 용량 확인 (2026-05-29 기준 합계 82,092 bytes, unminified)
- `npm run size:example`로 example 프로덕션 번들 확인 (2026-05-29 기준 JS gzip 72.20 kB, 전체 산출물 231.33 kB raw)

## 검증 결과

- `npm run typecheck` 통과
- `npm run build` 통과
- `dist/index.js` 기준 ESM import 검증 완료
- `localStorage` adapter 기준 `create -> list -> update` 흐름 검증 완료

## 수동 검증 메모

- 별도 example 앱은 아직 없어서, Quick Start와 동일한 데이터 계약으로 `dist` 엔트리를 직접 import해 검증했다.
- 검증 시나리오: pathname `/demo`, `report_id=hero`, `report_type=group` 데이터 생성 후 목록 조회 1건 확인, 이후 `message/status` 수정 확인
- 확인 결과: 생성 성공, pathname 기준 조회 성공, `status: resolved` 업데이트 성공

## Migration 검토

- `supabase/migrations` 5개 파일 기준 현재 `ReportFeedback` 필드와 매핑되는 컬럼이 모두 존재한다.
- 확인 컬럼: `pathname`, `message`, `report_id`, `report_type`, `status`, `field_values`, `replies`, `x_ratio`, `y_ratio`, `element_x_ratio`, `element_y_ratio`, `scroll_y`, `document_y`, `viewport_width`, `viewport_height`, `design_width`, `design_height`, `created_at`
- 제약 조건도 현재 타입 정책과 일치한다.
- `report_type`: `group | item`
- `status`: `open | resolved | archived`
- `field_values`: json object
- `replies`: json array

## 배포 전 체크

- `package.json`의 `files`, `main`, `types`, `exports`가 `dist` 기준으로 연결되는지 재확인
- tarball 점검이 필요하면 `npm pack`으로 실제 포함 파일 확인
- Supabase adapter 배포는 별도 범위라 현재 release에는 local storage/documentation 범위만 포함
