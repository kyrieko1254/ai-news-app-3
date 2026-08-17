# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 현황

이 저장소는 `PRD.md`에 정의된 제품을 위한 초기 Next.js 스캐폴드입니다 — **작업 전 `PRD.md`를 먼저 읽으세요**, 기능과 데이터 규칙에 대한 기준 문서입니다. `create-next-app` 기본 보일러플레이트(`src/app/layout.tsx`, `src/app/page.tsx`) 외에는 아직 애플리케이션 코드가 작성되지 않았습니다. 아래에 설명하는 인증, DB 스키마, API 라우트는 의도된 아키텍처이며 아직 구현되지 않았습니다.

UI/화면 작업 시에는 `ui.md`를 함께 참고하세요 — 컬러 토큰, 레이아웃, 카테고리 바, 뉴스 카드 등 Tailwind CSS 기반 UI 스타일 기준 문서입니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (Turbopack), http://localhost:3000
npm run build    # 프로덕션 빌드 (앱 전체가 컴파일되는지 확인하는 가장 빠른 타입체크 겸용 방법)
npm run start    # 프로덕션 빌드 실행
npm run lint     # eslint
```

아직 테스트 러너는 설정되어 있지 않습니다.

## 기술 스택 (PRD.md 기준)

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript, `src/` 디렉토리, Turbopack) |
| 인증 | Clerk (`@clerk/nextjs`) |
| 데이터베이스 | Neon Postgres (`@neondatabase/serverless`) |
| ORM | Drizzle (`drizzle-orm`, `drizzle-kit`) |
| 번역/요약/카테고리 분류 | 클로드 API (`@anthropic-ai/sdk`) |
| 외부 저장 대상 | Notion, MCP 서버를 통해 연동 (Notion npm SDK 없음 — REST 클라이언트가 아니라 MCP를 통한 연동) |

Import alias: `@/*` → `./src/*`.

## 아키텍처 (PRD.md 기준, 구현 예정)

전체 앱은 단일 사용자용 뉴스 트리아지 도구이며, 하나의 핵심 루프를 중심으로 구성됩니다:

1. **가져오기 (임시 상태)**: 사용자가 "뉴스 가져오기"를 클릭 → 서버가 등록된 2개 RSS 피드(TechCrunch AI, The Verge AI)를 가져옴 → 이미 저장된 기사와 **원문 URL 기준**으로 중복 제외 → 새 기사마다 클로드 API를 호출해 한국어 번역/요약과 제안 카테고리를 생성. 결과는 클라이언트에 반환되어 UI 상태로만 유지됩니다 — **가져오기 시점에는 DB에 아무것도 저장되지 않습니다.**
2. **카테고리 자동 등록**: 클로드가 제안한 카테고리가 카테고리 테이블에 없으면 자동으로 추가됩니다 (카테고리는 고정된 enum이 아니라 사용자가 수정 가능한 열린 목록입니다).
3. **저장하기 (영구 저장)**: 사용자가 카드에서 "저장하기"를 클릭했을 때만 해당 기사가 Drizzle을 통해 Postgres에 기록됩니다. 성공 후 "저장하기" 버튼은 비활성화/"저장됨" 상태로 전환됩니다.
4. **Notion 저장은 독립적**: "Notion 저장" 버튼(MCP 기반)은 DB 저장 상태와 서로 의존 관계가 없습니다 — 카드는 둘 중 하나만, 둘 다, 또는 둘 다 저장하지 않은 상태일 수 있습니다.

구현 시 지켜야 할 핵심 불변 조건:
- 중복 판단 기준은 **원문 URL**이며, 제목이나 콘텐츠 해시가 아닙니다.
- DB 쓰기는 사용자의 명시적 액션에서만 발생하며, 가져오기/요약 단계에서는 절대 발생하지 않습니다.
- DB 저장과 Notion 저장은 독립적으로 트리거 가능하고 독립적으로 상태가 추적되어야 합니다 (한쪽을 다른 쪽에 조건부로 연동하지 마세요).
- 카테고리를 삭제/수정할 때 해당 카테고리를 참조하는 기존 기사를 어떻게 처리할지는 PRD.md §8에 미확정 사항으로 명시되어 있습니다 — 임의로 cascade 동작을 가정하지 말고 사용자에게 확인하세요.
- 앱 전체는 Clerk 인증 뒤에 있어야 하며, 로그인 전에는 어떤 라우트/화면도 접근 가능해서는 안 됩니다.

## 환경 변수

`.env.local` 파일에 있음. 최소한 Clerk publishable/secret 키, Neon 연결 문자열, Anthropic API 키가 필요합니다. Notion 접근은 이 앱 안의 환경변수 기반 API 키가 아니라 MCP 서버 설정을 통해 이루어집니다.
