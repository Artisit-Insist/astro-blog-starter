---
name: daily-content
description: 관심 주제의 소재를 웹검색으로 제안하고, 선택·방향 논의 후 블로그(+선택한 소셜 채널) 톤에 맞춰 초안 작성, 승인 시 블로그 발행 + 소셜 복붙 블록 제공. 트리거 "오늘 소재", "블로그 소재 뽑아줘", "데일리 콘텐츠".
---

# daily-content — 데일리 콘텐츠 파이프라인 (범용 템플릿)

이 스킬은 **소재 리서치 → 선택 → 초안 → 승인/발행**을 한 흐름으로 처리합니다.
아래 `[설정]`을 본인에 맞게 바꿔서 쓰세요. (자세한 배경은 `automation/README.md`)

## [설정] — 쓰기 전에 채우세요
- **TOPIC(관심 주제)**: 예) "AI를 마케팅에 적용", "개발 생산성", "요리 레시피" …
- **PERSONA(글의 화자·톤)**: 예) "현장 경험 많은 실무자, 차분한 존댓말"
- **CHANNELS(소셜 채널)**: 예) 페이스북 · 링크드인 · 쓰레드 (필요한 것만)
- **BLOG_LEN(블로그 분량)**: 예) 2,000자 내외(±10%)
- **CF_PROJECT(배포 프로젝트명)**: `wrangler.toml`의 `name`

## 빠른 실행 (Happy Path)
```
사용자: "오늘 소재"
→ PHASE 1: 국내외 웹검색으로 TOPIC 소재 5개 숏리스트 제시
사용자: "3번"
→ PHASE 2: 방향 질문 2~3개(핵심 메시지? 사례? 톤? CTA?)
→ PHASE 3: platform-voice.md 읽고 블로그 + CHANNELS 초안
사용자: "발행"
→ PHASE 4: 블로그 파일 생성·빌드·커밋·배포 / 소셜은 복붙 블록 출력
```

## PHASE 1 — 소재 리서치
- **국내외 병행 웹검색**(WebSearch 등)으로 최근 1~2주 TOPIC 소재 수집.
- 산출: **소재 5개.** 각 소재 = (a)제목 (b)왜 지금 (c)내 앵글(PERSONA 관점) (d)출처 링크 1~2개(검색으로 확인된 것만) (e)채널 적합도.
- 통계·인용은 출처 없으면 쓰지 말 것.

## PHASE 2 — 선택 & 방향
- 사용자가 소재를 고르면 방향 질문 2~3개(핵심 메시지·사례 삽입 여부·톤·CTA)로 앵글 확정.

## PHASE 3 — 채널별 초안
- `automation/platform-voice.md`의 채널 규칙을 읽고 적용.
- 산출: (1)블로그 마크다운(제목·소제목·TL;DR, **BLOG_LEN 준수**) + (2)CHANNELS 각각의 버전.
- (권장) 최종 윤문: "사람이 쓴 글"처럼 다듬되 **의미·사실·수치·인용은 바꾸지 않는다**(문체만).

## PHASE 4 — 승인 & 발행
- **블로그(자동)**: `src/content/blog/YYYY-MM-DD-슬러그.md` 생성(frontmatter 스키마: `src/content.config.ts`, `draft: false`). `npm run build` 검증 → `git add/commit/push` →
  `npx wrangler pages deploy dist --project-name=CF_PROJECT --branch=main`. **배포(외부 공개)는 사용자 확인 후.**
- **소셜(수동)**: 각 채널 최종본을 코드펜스 블록으로 분리 출력 → 사용자가 직접 업로드.

## 안전장치
- 실제 검색 결과 기반, 날조 금지. 시크릿(토큰·비번) 커밋 금지.
- 예약 실행(매일 아침 소재 제안·슬롯 발행)·텔레그램 알림은 `automation/scheduled-tasks.md` 참고(선택).
