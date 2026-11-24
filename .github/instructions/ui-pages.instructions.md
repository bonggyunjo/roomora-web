---
applyTo: "pages/**,components/**"
---

# Roomora Web UI/UX 작업 규칙

- 구현 전 반드시 `../dev-obsidian-base/10_Projects/roomora/01_Core_Rules/ui_design_system.md`와 해당 도메인 스펙(`*_spec.md`)을 먼저 읽는다.
- `<script setup lang="ts">` + 명시적 TypeScript 인터페이스를 사용하며 `any` 남용을 피한다.
- 모든 화면은 **Empty / Skeleton / Error / Overflow** 4대 상태와 버튼 5대 상태를 고려하고, `alert()`/`confirm()` 대신 `useUiStore()`의 `toast()`/`confirm()`을 사용한다.
- UI 카피에 `RAG`, `Citation`, `1-Click`, `404` 등 개발자/AI 내부 용어를 노출하지 않는다.
