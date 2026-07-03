# automation/ — 콘텐츠 자동화 모듈 (선택)

**블로그만 쓸 거면 이 폴더는 무시해도 됩니다.** 아래는 "매일 소재를 제안받고, 여러 채널용
초안을 만들고, 승인하면 발행"하는 워크플로우를 **Claude Code로** 돌리는 선택 도구 모음입니다.

## 무엇이 들어있나
| 파일 | 역할 |
|---|---|
| `.claude/skills/daily-content/SKILL.md` | 소재 리서치 → 초안 → 발행 파이프라인 스킬 (Claude Code가 자동 인식) |
| `automation/platform-voice.md` | 채널별(블로그·소셜) 톤앤매너 가이드 |
| `automation/scheduled-tasks.md` | 매일 예약 실행 + 텔레그램 승인 발행 설정법 (프롬프트 템플릿 포함) |
| `automation/scripts/notify.sh` | 텔레그램 알림 전송 |
| `automation/scripts/publish.sh` | 슬롯 초안을 draft 해제 → 빌드 → 배포 |
| `automation/.automation.env.example` | 설정 자리표시자(토큰·프로젝트명) |

## 빠른 시작
1. **설정 파일**: `cp automation/.automation.env.example automation/.automation.env` 후 값 채우기
   (텔레그램 토큰·chat_id, `CF_PROJECT_NAME`)
2. **스크립트 실행 권한**: `chmod +x automation/scripts/*.sh`
3. **스킬 사용**: Claude Code에서 **"오늘 소재"** 라고 하면 daily-content 스킬이 동작
   → 소재 5개 제안 → 선택 → 초안(블로그+소셜) → "발행" → 게시
4. **매일 자동화**(선택): `automation/scheduled-tasks.md` 대로 예약 등록

## 먼저 할 일: 내 주제로 맞추기
`.claude/skills/daily-content/SKILL.md` 상단의 **[설정]**(TOPIC·PERSONA·CHANNELS·BLOG_LEN·CF_PROJECT)과
`automation/platform-voice.md`를 본인 주제·채널·화자에 맞게 고치세요.
(이 모듈은 시작점입니다 — 자기 워크플로우에 맞게 자유롭게 바꿔 쓰세요.)

## 텔레그램 없이도?
스킬(대화형 소재 제안·작성·발행)만 쓰고, 예약·텔레그램은 안 써도 됩니다.
텔레그램은 "매일 자동으로 알림 받기"가 필요할 때만 설정하세요.

> ⚠️ 시크릿(`.automation.env`)은 절대 커밋하지 마세요(자동 무시됨). 각자 발급해 로컬에만 두세요.
