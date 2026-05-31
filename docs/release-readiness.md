# stitchable Release Readiness

기준일: 2026-05-31

## 패키지 경량화

- 런타임 `dependencies` 없음 (`react`, `react-dom`만 peer)
- 빌드에 포함되지 않던 `src/lib`, `src/model`, `src/shared/types/Database.ts` 제거
- `npm run size:dist`로 `dist/*.js` 용량 확인 (2026-05-31 기준 합계 159,115 bytes, unminified)
- `npm run size:example`로 example 프로덕션 번들 확인 (`npm run example:build` 후 `examples/basic/dist` 기준)

## 검증 결과

- `npm run typecheck` 통과
- `npm run test` 통과 (Vitest + jsdom, adapter/coordinates/dom/api)
- `npm run build` 통과
- `npm run example:build` 통과
- `dist/index.js` 기준 ESM import 검증 완료
- `localStorage` adapter 기준 `create -> list -> update -> remove` 흐름 자동 테스트 포함

## 수동 검증 메모

- `examples/basic` 앱으로 `npm run dev` 실행 후 생성/목록/수정/마커/단축키를 브라우저에서 확인한다.
- 검증 시나리오: pathname `/demo`, `report_id=hero`, `report_type=group` 데이터 생성 후 목록 조회, `message/status` 수정, 삭제(선택)
- DOM 대상이 사라진 경우 `document_y`·비율 좌표 fallback으로 마커가 남는지 확인

## Migration 검토

- `supabase/migrations` 5개 파일 기준 현재 `ReportFeedback` 필드와 매핑되는 컬럼이 모두 존재한다.
- 확인 컬럼: `pathname`, `message`, `report_id`, `report_type`, `status`, `field_values`, `replies`, `x_ratio`, `y_ratio`, `element_x_ratio`, `element_y_ratio`, `scroll_y`, `document_y`, `viewport_width`, `viewport_height`, `design_width`, `design_height`, `created_at`
- 제약 조건도 현재 타입 정책과 일치한다.
- `report_type`: `group | item`
- `status`: `open | resolved | archived`
- `field_values`: json object
- `replies`: json array

## CI

- GitHub Actions: `.github/workflows/ci.yml`
- push/PR 시 `typecheck`, `test`, `build`, `example:build` 실행

## 배포 전 체크

- `package.json`의 `files`, `main`, `types`, `exports`가 `dist` 기준으로 연결되는지 재확인
- tarball 점검이 필요하면 `npm pack`으로 실제 포함 파일 확인
- Supabase adapter 배포는 별도 범위라 현재 release에는 local storage/documentation 범위만 포함
