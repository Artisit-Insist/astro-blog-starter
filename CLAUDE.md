# Claude 발행 가이드 (선택)

Claude Code로 이 블로그를 운영할 때 참고하는 규칙입니다. (Claude를 안 써도 사이트는 정상 동작합니다.)
스택: Astro(SSG) + Cloudflare Pages. 설정은 `src/consts.ts` 한 곳.

## "이 글 올려줘" 요청이 오면

1. **글 파일 생성**: `src/content/blog/YYYY-MM-DD-슬러그.md`
2. **frontmatter** (스키마: `src/content.config.ts`)
   - `title`(30~45자), `description`(검색 스니펫 120~160자), `pubDate`, `tags`(2~4개),
     `keywords`(5개 내외), `tldr`(핵심 한 줄), `draft: false`(발행), 선택 `heroImage`/`ogImage`
3. **본문 원칙**: `##`/`###` 헤딩으로 구조화, 첫 문단에 핵심 결론, 이미지 alt, 필요 시 표·다이어그램(```mermaid)
4. **(권장) 최종 윤문**: 사람이 쓴 글처럼 다듬되 **의미·사실·수치·인용은 바꾸지 않는다**(문체만)
5. **검증**: `npm run build` 무오류 확인
6. **배포**: `git add -A && git commit && git push` 후
   `npm run build && npx wrangler pages deploy dist --project-name=<프로젝트명> --branch=main`
   (자동배포(GitHub Actions)를 켰다면 push만으로 배포됨. 외부 공개는 사용자 확인 후.)

## 새 글 빠르게
```
npm run new -- "글 제목"   # draft:true 템플릿 생성
npm run dev                # http://localhost:4321
```

## 설정을 바꿀 때
- 사이트 주소·제목·저자·브랜드: `src/consts.ts`
- 배포 후 실제 도메인으로 교체: `src/consts.ts`의 `SITE.url`, `public/robots.txt`의 Sitemap 주소
- 자세한 설치·배포·관리자 설정: `SETUP.md`

## 하지 말 것
- 시크릿(ADMIN_PASSWORD·GITHUB_TOKEN·API 토큰·D1 id) 커밋 금지
- `dist/`, `node_modules/`, `.astro/` 커밋 금지 (`.gitignore` 처리됨)
