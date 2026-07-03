-- 이메일 구독자 (자체 수집)
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  ts INTEGER NOT NULL,          -- 구독 시각(unix ms)
  source TEXT DEFAULT 'site'    -- 유입 위치(footer/post 등)
);
CREATE INDEX IF NOT EXISTS idx_subscribers_ts ON subscribers (ts);
