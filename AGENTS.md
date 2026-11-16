---
description: Roomora 프론트엔드(roomora-web) AI 에이전트 루트 행동 강령 (SSOT).
layer: L0
---

# AGENTS.md — Roomora Web

## 1. 프로젝트 개요
- **서비스**: Roomora (조건 기반 인테리어 레시피 · 주간 콘테스트 · AI RAG 통합 검색 플랫폼)
- **역할**: Nuxt 3 SSR 기반 웹 애플리케이션 (레시피 탐색, AI RAG 검색 결과 카드, 체크리스트 관리, 콘테스트 랭킹)

## 2. 기술 스택 및 버전
- Node.js 24+, Nuxt 3, Vue 3 (`<script setup lang="ts">`), Pinia, Tailwind CSS

## 3. 기준 문서 우선순위 & 라우팅 지도
- **우선순위**: `DEC(decisions.md) > L1(system_architecture.md) > L2(*_spec.md)`
- **외부 옵시디언 볼트**: `../dev-obsidian-base/10_Projects/aesthetics-of-space-v2/`
  - 세션 시작 시: `activeContext.md` + `00_MOC/project_moc.md` 먼저 열람
  - 기능 구현 시: `02_Specs_and_Skills/<domain>_spec.md` 열람 후 `plan.md` 작성

## 4. 빌드·테스트 명령 (Narrowest Verification)
- 타입 체크: `npx nuxi typecheck`
- 최종 검증 스크립트: `pwsh -File scripts/verify.ps1` (`Exit Code 0` 확인)

## 5. 코드 스타일 & 규칙 (Good / Bad)
- Vue 2 Options API 사용 금지 → Composition API (`<script setup lang="ts">`) 사용
- `any` 타입 남용 금지 → 백엔드 API 계약에 맞춘 명시적 TypeScript 인터페이스 정의
- SSR 환경(`useAsyncData` / `useFetch`)을 고려해 `window`/`document` 직접 접근은 클라이언트 가드(`import.meta.client`) 내부로 제한

## 6. 금지 구역 (Do Not Touch)
- `.env`, `.nuxt/`, `.output/` 생성물

## 7. 절대 금지 규칙
- 추측성 API 스펙 구현 금지, 무단 패키지 설치 금지, 고정 `px` 위주 비반응형 레이아웃 금지

## 8. 미결정 사항 (Ask Before Coding)
- 디자인 토큰/컬러 시스템 또는 인증 토큰 저장 방식(HttpOnly Cookie vs Memory) 변경 시 구현 전 확인한다.

## 9. 브랜치 · 커밋 규칙
- 브랜치: `feat/<domain>-<task>`, `fix/<domain>-<bug>`
- 커밋: Conventional Commits (예: `feat: AI RAG 검색 결과 및 예산 배분 카드 UI 구현`)

## 10. 완료 기준 (Definition of Done)
- 스펙(`REQ-nnn`) 충족 + `typecheck` 통과(`Exit Code 0`) + `activeContext.md`(50줄 이내 덮어쓰기) 및 L2/L3 문서 동기화
