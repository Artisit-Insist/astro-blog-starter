# 예약 자동화 (선택) — 매일 소재 제안 + 승인 발행

**흐름:** 매일 아침 소재를 슬롯에 배정해 텔레그램으로 받고 → 각 슬롯에 초안을 받아 →
"발행 오전/오후/저녁" 회신하면 게시. 자동화는 **소재 제안·초안 작성까지**, 실제 발행은 승인 후.

```
아침  → 오늘 소재 N개를 슬롯에 배정 → 텔레그램 전송 + automation/today-plan.md 저장
슬롯  → 해당 슬롯 초안(draft:true) 작성·커밋 → 텔레그램 전송
회신  → "발행 오전/오후/저녁" → automation/scripts/publish.sh 실행(빌드·배포)
```

## 준비물
1. `automation/.automation.env` 설정 (텔레그램 토큰·chat_id·CF_PROJECT_NAME) — `.automation.env.example` 복사
2. `chmod +x automation/scripts/*.sh`
3. 텔레그램 봇: BotFather로 생성 → 토큰 발급 → 봇에게 아무 메시지 보내고 chat_id 확인
4. 알림 테스트: `bash automation/scripts/notify.sh "테스트"`

## 예약 실행 방법 (택1)
- **Claude Code 예약 에이전트 / 클라우드 크론** — 아래 프롬프트를 등록
- **로컬 cron / launchd** — `claude -p "<프롬프트>"` 를 정해진 시각에 실행
- **텔레그램→Claude 브리지** — 발행 회신("발행 오전")을 받아 `publish.sh` 실행

> `<REPO>` 는 본인 저장소의 **절대 경로**로 바꾸세요.

### ① 아침 계획 (예: 09:00)
```
<REPO>/.claude/skills/daily-content/SKILL.md 의 PHASE 1만 수행한다.
오늘 소재 N개를 슬롯(예: 오전/오후/저녁)에 배정하고, 각 소재의 제목·왜지금·앵글·출처·슬러그를
<REPO>/automation/today-plan.md 에 아래 형식으로 저장한다:
  # 발행 계획 YYYY-MM-DD
  ## 오전
  - title: ...
  - file: YYYY-MM-DD-슬러그.md
  ## 오후 ...
그리고 bash <REPO>/automation/scripts/notify.sh "오늘의 계획 ..." 로 텔레그램 전송한다.
글 작성·발행은 하지 않는다.
```

### ② 슬롯 초안 (예: 오전 10:00 / 오후 15:00 / 저녁 20:00 — 슬롯마다 하나씩)
```
<REPO>/automation/today-plan.md 의 '오전' 슬롯 글을 초안으로 작성한다(daily-content PHASE 3).
src/content/blog/<slug> 를 draft:true 로 생성 → npm run build 검증 → git add/commit/push.
배포는 하지 않는다. bash <REPO>/automation/scripts/notify.sh "오전 초안 준비됨 ... '발행 오전' 회신" 전송.
(오후/저녁 슬롯도 같은 프롬프트에서 '오전'만 바꿔 각각 등록)
```

### ③ 발행 (텔레그램 "발행 오전/오후/저녁" 회신 처리)
브리지/핸들러가 회신을 받으면:
```
bash <REPO>/automation/scripts/publish.sh 오전
```
→ draft 해제 + 빌드 + 배포 + 완료 알림.

## 주의
- 시크릿(`.automation.env`)은 커밋 금지(자동 무시됨).
- 예약 에이전트는 실행 환경(앱/서버)이 켜져 있어야 동작합니다.
