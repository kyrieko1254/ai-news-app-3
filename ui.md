# UI 가이드 — AI 뉴스 수집기

이 문서는 'AI 뉴스 수집기'의 화면 스타일 기준을 정의합니다. Tailwind CSS(v4, `@theme inline` 방식)를 사용하며, 여기 정리된 값과 컴포넌트 패턴을 따라 화면을 구현합니다.

## 1. 디자인 원칙

- **깔끔하고 읽기 편하게**: 장식보다 정보 위계를 우선한다. 카드 하나에 시선이 오래 머물지 않아도 핵심(제목, 요약, 카테고리, 액션)이 바로 읽혀야 한다.
- **여백으로 구분한다**: 테두리나 그림자를 겹겹이 쌓기보다 여백과 은은한 경계선으로 카드/섹션을 구분한다.
- **상태는 명확하게**: 저장 여부, 로딩 여부 등 버튼 상태는 색과 텍스트 둘 다로 표시해 한눈에 구분되게 한다.
- **다크 모드 지원**: `globals.css`에 이미 `prefers-color-scheme: dark` 대응이 되어 있으므로, 컬러는 항상 Tailwind 시맨틱 토큰(아래 2장)을 통해서만 사용한다.

## 2. 컬러 토큰

`globals.css`의 `--background`/`--foreground` 변수를 확장해 아래 토큰을 추가한다. 컴포넌트에서는 직접 hex 값을 쓰지 않고 이 토큰만 사용한다.

| 용도 | 라이트 | 다크 | Tailwind 클래스 예시 |
|---|---|---|---|
| 배경(페이지) | `#ffffff` | `#0a0a0a` | `bg-background` |
| 기본 텍스트 | `#171717` | `#ededed` | `text-foreground` |
| 보조 텍스트(요약, 메타) | `#525252` (neutral-600) | `#a3a3a3` (neutral-400) | `text-neutral-600 dark:text-neutral-400` |
| 카드 배경 | `#ffffff` | `#141414` | `bg-white dark:bg-neutral-900` |
| 카드 테두리 | `#e5e5e5` (neutral-200) | `#262626` (neutral-800) | `border-neutral-200 dark:border-neutral-800` |
| 강조(브랜드/포인트) | `#4f46e5` (indigo-600) | `#6366f1` (indigo-500) | `bg-indigo-600 dark:bg-indigo-500` |
| 성공(저장됨) | `#16a34a` (green-600) | `#22c55e` (green-500) | `text-green-600 dark:text-green-500` |
| 카테고리 칩 배경 | `#f5f5f5` (neutral-100) | `#1f1f1f` | `bg-neutral-100 dark:bg-neutral-800/60` |

강조색은 인디고 계열 하나만 쓴다. 여러 브랜드 컬러를 섞지 않는다.

## 3. 타이포그래피

- 기본 폰트: 프로젝트에 이미 연결된 `--font-geist-sans` (Tailwind `font-sans`).
- 페이지 제목(앱 이름 "AI 뉴스 수집기"): `text-xl font-semibold` (헤더 영역에서만 사용).
- 카드 제목: `text-base font-semibold leading-snug`.
- 카드 요약 본문: `text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed`.
- 메타 정보(출처, 날짜): `text-xs text-neutral-500`.
- 버튼 텍스트: `text-sm font-medium`.

## 4. 레이아웃

### 4.1 페이지 구조 (메인 대시보드)

```
┌─────────────────────────────────────────────┐
│ 헤더: 앱 이름 + [뉴스 가져오기] 버튼            │
├─────────────────────────────────────────────┤
│ 카테고리 바: [전체] [카테고리1] [카테고리2] … [+ 추가] │
├─────────────────────────────────────────────┤
│ 뉴스 카드 그리드                              │
│ [카드] [카드] [카드]                          │
│ [카드] [카드] [카드]                          │
└─────────────────────────────────────────────┘
```

- 페이지 바깥 여백: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- 헤더와 카테고리 바, 카드 그리드 사이 수직 간격: `py-6` 또는 `space-y-6`.
- 카드 그리드: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.

### 4.2 헤더

- `flex items-center justify-between` 로 앱 이름(좌)과 "뉴스 가져오기" 버튼(우) 배치.
- 하단 경계선으로 카테고리 바와 구분: `border-b border-neutral-200 dark:border-neutral-800 pb-4`.

### 4.3 카테고리 바

뉴스 카드 목록 바로 위, 헤더 아래에 위치. 가로 스크롤 가능한 칩(chip) 목록 + 끝에 카테고리 추가 버튼.

```html
<div class="flex items-center gap-2 overflow-x-auto pb-1">
  <button class="rounded-full px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white">전체</button>
  <button class="rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
    LLM
  </button>
  <button class="rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
    스타트업
  </button>
  <!-- 카테고리 추가 버튼: 항상 목록 맨 끝 -->
  <button class="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-indigo-500 hover:text-indigo-600">
    <span aria-hidden="true">+</span> 카테고리 추가
  </button>
</div>
```

- 선택된 카테고리(현재 필터)는 `bg-indigo-600 text-white`로 채워서 강조, 나머지는 중립 배경의 outline 칩.
- "카테고리 추가" 칩은 점선 테두리로 다른 칩과 시각적으로 구분해 "액션"임을 표시한다.
- 칩 목록은 항상 `overflow-x-auto`로 감싸 카테고리가 많아져도 줄바꿈 대신 가로 스크롤되게 한다.

## 5. 뉴스 카드 컴포넌트

카드는 이 앱에서 가장 중요한 반복 단위다. 아래 구조를 기본값으로 삼는다.

```html
<article class="flex flex-col gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
  <!-- 카테고리 + 출처/날짜 -->
  <div class="flex items-center justify-between">
    <span class="rounded-full bg-neutral-100 dark:bg-neutral-800/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
      LLM
    </span>
    <span class="text-xs text-neutral-500">TechCrunch · 3시간 전</span>
  </div>

  <!-- 제목 -->
  <h3 class="text-base font-semibold leading-snug text-foreground">
    (한국어 번역 제목)
  </h3>

  <!-- 요약 -->
  <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
    (클로드가 생성한 한국어 요약)
  </p>

  <!-- 액션 바 -->
  <div class="mt-1 flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
    <a class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline" href="#">
      원문보기
    </a>
    <div class="ml-auto flex items-center gap-2">
      <!-- 저장하기: 미저장 상태 -->
      <button class="rounded-md px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
        저장하기
      </button>
      <!-- 저장하기: 저장됨 상태 (비활성화) -->
      <!--
      <button disabled class="rounded-md px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed">
        저장됨
      </button>
      -->

      <!-- Notion 저장: 독립 상태, DB 저장 여부와 무관 -->
      <button class="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        Notion 저장
      </button>
      <!-- Notion 저장됨 상태 -->
      <!--
      <button disabled class="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed">
        Notion 저장됨
      </button>
      -->
    </div>
  </div>
</article>
```

카드 규칙:
- 카테고리 칩은 카드 좌측 상단, 출처/시간은 우측 상단 — 카테고리 바와 같은 칩 스타일(`bg-neutral-100`)을 재사용해 시각적 일관성을 유지한다.
- 요약은 `line-clamp-3`으로 길이를 제한해 카드 높이를 그리드 안에서 고르게 유지한다.
- "저장하기"와 "Notion 저장"은 서로 다른 스타일(채움 vs 아웃라인)로 구분해, 둘이 독립적인 액션임을 시각적으로도 드러낸다.
- 저장 완료 상태는 배경을 중립색으로 낮추고 텍스트만 초록으로 바꿔 "완료되어 더 이상 누를 수 없음"을 표현한다 (버튼을 완전히 숨기지 않는다).

## 6. 버튼 스타일 요약

| 종류 | 클래스 | 사용처 |
|---|---|---|
| Primary (채움) | `rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700` | 뉴스 가져오기, 저장하기 |
| Secondary (아웃라인) | `rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800` | Notion 저장, 카테고리 수정/삭제 |
| 완료 상태 (disabled) | `bg-neutral-100 dark:bg-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed` + `disabled` | 저장됨, Notion 저장됨 |
| 칩 (필터/카테고리) | 4.3절 참조 | 카테고리 바 |
| 점선 액션 칩 | 4.3절 참조 | 카테고리 추가 |

## 7. 빈 상태 / 로딩

- **가져오기 전 빈 화면**: 카드 그리드 자리에 안내 문구 하나 — "뉴스 가져오기 버튼을 눌러 최신 AI 뉴스를 확인하세요." (`text-sm text-neutral-500`, 중앙 정렬, 세로 여백 `py-16`).
- **가져오는 중**: "뉴스 가져오기" 버튼에 로딩 스피너 + "가져오는 중…" 텍스트, 버튼은 `disabled` 처리.
- **카테고리 필터 결과 없음**: "이 카테고리에는 아직 뉴스가 없습니다." 동일 스타일로 표시.

## 8. 접근성 메모

- 아이콘만 있는 버튼(예: 카테고리 추가의 `+`)에는 반드시 텍스트 라벨을 함께 표기한다 (아이콘 전용 버튼 지양).
- disabled 버튼은 `disabled` 속성과 `cursor-not-allowed`를 함께 사용해 스크린리더와 마우스 커서 모두에서 비활성 상태가 드러나게 한다.
- 색만으로 상태를 구분하지 않는다 (예: 저장됨은 색 변화 + 텍스트 변화를 함께 사용).
