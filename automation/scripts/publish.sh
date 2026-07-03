#!/bin/bash
# 슬롯 발행: 오늘 계획의 해당 슬롯 글을 draft:true → false 로 바꾸고 빌드·배포
# 사용법: bash automation/scripts/publish.sh 오전|오후|저녁
# (텔레그램 "발행 오전/오후/저녁" 회신 → 브리지/스크립트가 이 파일을 호출하는 흐름. scheduled-tasks.md 참고)
set -uo pipefail

SLOT="${1:-}"
AUTODIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$AUTODIR/.." && pwd)"
ENVFILE="$AUTODIR/.automation.env"
[ -f "$ENVFILE" ] && { set -a; . "$ENVFILE"; set +a; }
PROJECT="${CF_PROJECT_NAME:-your-project-name}"
PLAN="$AUTODIR/today-plan.md"
NOTIFY="$AUTODIR/scripts/notify.sh"

note() { [ -f "$NOTIFY" ] && bash "$NOTIFY" "$1" >/dev/null 2>&1 || true; }
fail() { note "⚠️ ${SLOT} 발행 실패: $1"; echo "FAIL: $1" >&2; exit 1; }

case "$SLOT" in 오전|오후|저녁) ;; *) echo "usage: publish.sh 오전|오후|저녁" >&2; exit 1;; esac
[ -f "$PLAN" ] || fail "오늘 계획(today-plan.md)이 없습니다."

FILE=$(awk -v s="$SLOT" '
  $0 ~ ("^##[ ]*" s) {insec=1; next}
  /^##[ ]/ {insec=0}
  insec && /- *file:/ {sub(/.*file:[ ]*/,""); gsub(/[ \r]+$/,""); print; exit}
' "$PLAN")
[ -n "$FILE" ] || fail "계획에서 ${SLOT} 슬롯의 file을 찾지 못했습니다."

TARGET="$REPO/src/content/blog/$FILE"
[ -f "$TARGET" ] || fail "초안 파일이 없습니다 ($FILE)."

cd "$REPO" || fail "저장소 경로 접근 실패"
git pull --rebase --autostash origin main >/dev/null 2>&1 || true
perl -0pi -e 's/^draft:\s*true\s*$/draft: false/m' "$TARGET"
grep -q '^draft: false' "$TARGET" || fail "draft 전환 실패"

npm run build >/tmp/pub-build.log 2>&1 || fail "빌드 오류 (/tmp/pub-build.log)"
npx wrangler pages deploy dist --project-name="$PROJECT" --branch=main --commit-dirty=true >/tmp/pub-deploy.log 2>&1 || fail "배포 오류 (/tmp/pub-deploy.log)"
git add -A && git commit -q -m "publish(${SLOT}): ${FILE}" >/dev/null 2>&1 || true
git push -q origin main >/dev/null 2>&1 || true

SLUG="${FILE%.md}"; SLUG="${SLUG%.mdx}"
note "✅ ${SLOT} 글 발행 완료: /blog/${SLUG}/"
echo "published: /blog/${SLUG}/"
