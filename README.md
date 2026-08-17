# AI News Collector

AI 관련 RSS 뉴스를 가져와 클로드 API로 한국어 번역/요약/카테고리 분류를 거친 뒤, 사용자가 선택적으로 DB와 Notion에 저장하는 1인용 뉴스 트리아지 도구입니다.

기능과 데이터 규칙의 기준 문서는 [`PRD.md`](./PRD.md)이며, UI 스타일 기준 문서는 [`ui.md`](./ui.md)입니다. Claude Code로 작업할 때 참고할 규칙은 [`CLAUDE.md`](./CLAUDE.md)에 있습니다.

## 핵심 흐름

1. **가져오기** — "뉴스 가져오기" 클릭 시 등록된 RSS 피드(TechCrunch AI, The Verge AI)를 가져와 원문 URL 기준으로 중복을 제외하고, 새 기사마다 클로드 API로 번역/요약/카테고리를 생성합니다. 이 단계에서는 DB에 아무것도 저장되지 않습니다.
2. **카테고리 자동 등록** — 클로드가 제안한 카테고리가 없으면 카테고리 테이블에 자동 추가됩니다.
3. **저장하기** — 사용자가 카드에서 "저장하기"를 눌러야만 Drizzle을 통해 Postgres에 기록됩니다.
4. **Notion 저장** — MCP 기반으로 동작하며 DB 저장 여부와 독립적입니다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript, `src/`, Turbopack) |
| 인증 | Clerk (`@clerk/nextjs`) |
| 데이터베이스 | Neon Postgres (`@neondatabase/serverless`) |
| ORM | Drizzle (`drizzle-orm`, `drizzle-kit`) |
| 번역/요약/카테고리 분류 | 클로드 API (`@anthropic-ai/sdk`) |
| 외부 저장 대상 | Notion (MCP 서버 연동) |

## 시작하기

환경 변수는 `.env.local`에 설정합니다 (Clerk publishable/secret 키, Neon 연결 문자열, Anthropic API 키 최소 필요).

```bash
npm install
npm run dev      # 개발 서버 실행 (Turbopack), http://localhost:3000
```

기타 명령어:

```bash
npm run build     # 프로덕션 빌드 (타입체크 겸용)
npm run start     # 프로덕션 빌드 실행
npm run lint      # eslint
npm run db:generate  # Drizzle 마이그레이션 생성
npm run db:migrate   # Drizzle 마이그레이션 적용
npm run db:studio    # Drizzle Studio 실행
```

아직 테스트 러너는 설정되어 있지 않습니다.

Import alias: `@/*` → `./src/*`.
