-- 방문 기록 테이블 (개인정보 비식별: IP 미저장, visitor는 일일 해시)
CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,            -- unix milliseconds
  day TEXT NOT NULL,             -- YYYY-MM-DD (KST)
  path TEXT NOT NULL,            -- 방문 경로
  referrer TEXT DEFAULT '',      -- 유입 호스트 (예: google.com)
  referrer_type TEXT DEFAULT 'direct', -- direct | search | social | referral
  country TEXT DEFAULT 'XX',     -- CF-IPCountry
  device TEXT DEFAULT 'desktop', -- mobile | desktop | tablet
  visitor TEXT NOT NULL          -- (IP+UA+day) 해시 8바이트, 일일 회전
);

CREATE INDEX IF NOT EXISTS idx_pageviews_day ON pageviews (day);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews (path);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor ON pageviews (visitor);
