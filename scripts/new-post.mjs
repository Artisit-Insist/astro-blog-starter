#!/usr/bin/env node
// 새 글 스캐폴딩: node scripts/new-post.mjs "글 제목"
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('사용법: npm run new -- "글 제목"');
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10); // YYYY-MM-DD

// 한글 제목 → URL 슬러그(공백은 -, 특수문자 제거). 원하면 파일명에서 직접 바꿔도 됩니다.
const slug = title
  .toLowerCase()
  .replace(/[^가-힣a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .slice(0, 60);

const dir = join(process.cwd(), 'src', 'content', 'blog');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${date}-${slug}.md`);

if (existsSync(file)) {
  console.error(`이미 존재합니다: ${file}`);
  process.exit(1);
}

const tpl = `---
title: ${title}
description: (검색 결과에 노출될 한 줄 요약 120~160자)
pubDate: ${date}
tags: []
keywords: []
tldr: (핵심 한 줄 요약 — AI/독자가 먼저 읽는 부분)
draft: true
---

여기에 본문을 씁니다.
`;

writeFileSync(file, tpl, 'utf8');
console.log(`✅ 생성됨: ${file}`);
console.log('   draft: true 상태입니다. 발행하려면 draft를 false로 바꾸세요.');
