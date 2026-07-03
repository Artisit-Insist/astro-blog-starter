#!/bin/bash
# 텔레그램 알림 전송 (선택 기능)
# 설정: automation/.automation.env 에 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID 채우기
# 사용법: bash automation/scripts/notify.sh "메시지"   (또는 stdin 파이프)
set -euo pipefail

AUTODIR="$(cd "$(dirname "$0")/.." && pwd)"
ENVFILE="$AUTODIR/.automation.env"
[ -f "$ENVFILE" ] && { set -a; . "$ENVFILE"; set +a; }

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT="${TELEGRAM_CHAT_ID:-}"
if [ -z "$TOKEN" ] || [ -z "$CHAT" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정 ($ENVFILE)" >&2
  exit 1
fi

if [ "$#" -ge 1 ]; then MSG="$1"; else MSG="$(cat)"; fi

HTTP=$(curl -s -o /tmp/notify-resp.json -w '%{http_code}' \
  -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT}" \
  --data-urlencode "text=${MSG}" \
  -d "disable_web_page_preview=true")

if [ "$HTTP" = "200" ]; then echo "sent"; else
  echo "FAILED (HTTP $HTTP): $(cat /tmp/notify-resp.json)" >&2; exit 1
fi
