# 설치 매뉴얼 — 처음부터 똑같이 만들기

이 문서만 따라 하면 **무료로** 개인 블로그 + 관리자 대시보드를 구축할 수 있습니다.
전체 30~60분, 대부분 복사·붙여넣기입니다.

> 💡 코드를 몰라도 됩니다. 터미널에 명령어를 붙여넣고, 웹 대시보드에서 버튼 몇 개만 누르면 됩니다.

---

## 0. 이 템플릿으로 만들어지는 것

- ⚡ **초고속 정적 블로그** (Astro) — 마크다운으로 글쓰기
- 🎨 Notion풍 미니멀 디자인 · 다크모드 · 모바일 최적화
- 🔎 **SEO/GEO** — 사이트맵·RSS·구조화 데이터·`llms.txt`·글별 **OG 카드 자동생성**
- 📊 **자체 방문 통계** 대시보드(`/admin`) — 조회수·방문자·유입경로·인기글 (개인정보 비식별)
- ✍️ **웹 에디터** — 브라우저에서 글 편집, **이미지 드래그&드롭·붙여넣기**, 실시간 미리보기, 표·다이어그램
- 📬 **이메일 구독** 수집
- 💸 **완전 무료** (Cloudflare Pages + D1 무료 티어)

---

## 1. 준비물 (모두 무료)

| 필요한 것 | 설명 |
|---|---|
| **Node.js 20+** | https://nodejs.org 에서 LTS 설치 |
| **GitHub 계정** | https://github.com |
| **Cloudflare 계정** | https://dash.cloudflare.com/sign-up |
| 터미널 | Mac: 터미널앱 / Windows: PowerShell |

---

## 2. 내 저장소로 복제하고 실행하기

1. 이 저장소 상단의 **초록색 `Use this template` → `Create a new repository`** 클릭 → 내 저장소 생성
2. 터미널에서 내 저장소를 클론(`your-name/your-repo`는 본인 것으로):
   ```bash
   git clone https://github.com/your-name/your-repo.git
   cd your-repo
   npm install
   npm run dev
   ```
3. 브라우저에서 **http://localhost:4321** 열기 → 사이트가 뜹니다. 🎉

---

## 3. 내 정보로 바꾸기 (핵심)

**`src/consts.ts` 파일 하나만** 열어서 자리표시자를 바꾸면 사이트 전체에 반영됩니다.

- `SITE` — 사이트 주소·제목·소개
- `AUTHOR` — 이름·직함·소개·소셜 링크(빈 값은 자동 숨김)
- `SERVICE` — 브랜드/서비스 소개 (안 쓰면 그대로 둬도 됨)
- `CATEGORIES` — 블로그 카테고리 탭 (예: `['일상','기술','리뷰']`)
- `VERIFICATION` — 검색엔진 인증 토큰 (9단계에서 채움)

그다음:
- **프로필 사진**: `public/avatar.svg`를 본인 사진(`avatar.jpg` 등)으로 바꾸고 `consts.ts`의 `AUTHOR.avatar` 경로 수정
- **파비콘**: `public/favicon.svg` 교체
- **robots/llms**: `public/robots.txt`·`public/llms.txt`의 도메인·소개를 본인 것으로

색을 바꾸려면 `src/styles/global.css` 상단의 `--brand`(액센트 색) 값을 수정하세요.

---

## 4. 글쓰기

**방법 A — 파일로:**
```bash
npm run new -- "첫 글 제목"     # src/content/blog/ 에 초안 생성
npm run dev                     # 미리보기
```
`src/content/blog/`의 `.md` 파일을 편집합니다. 상단 `---` 사이가 메타데이터(제목·요약·태그), 아래가 본문입니다.
표는 `| a | b |`, 다이어그램은 ` ```mermaid ` 코드블록으로 씁니다 (예시는 첫 글 참고).

**방법 B — 웹 에디터로:** 배포 후 `/admin`에서 (7단계).

예시 글(`2026-01-01-welcome.md`)은 지우고 시작하세요.

---

## 5. Cloudflare Pages에 배포 (무료 호스팅)

터미널에서:
```bash
# 1) Cloudflare 로그인 (브라우저가 열리면 Allow 클릭)
npx wrangler login

# 2) Pages 프로젝트 생성 (이름은 원하는 대로 — 이게 주소가 됩니다: 이름.pages.dev)
npx wrangler pages project create my-blog --production-branch=main

# 3) 빌드 후 배포
npm run build
npx wrangler pages deploy dist --project-name=my-blog --branch=main
```
→ 나온 `https://my-blog.pages.dev` 주소로 접속하면 사이트가 라이브입니다.

배포 후 `src/consts.ts`의 `SITE.url`과 `public/robots.txt`의 Sitemap 주소를 실제 주소로 바꾸고 다시 배포하세요.

> ⚠️ **중요:** `wrangler.toml`의 `name`을 위에서 만든 프로젝트명(`my-blog`)과 똑같이 맞추세요.

---

## 6. 관리자 대시보드·에디터·구독 켜기 (D1 + 시크릿)

블로그만 쓸 거면 건너뛰어도 됩니다. `/admin`(통계·에디터·구독)을 쓰려면:

### 6-1. D1 데이터베이스 생성
```bash
npx wrangler d1 create my-blog-db
```
출력된 `database_id`를 `wrangler.toml`의 `REPLACE_WITH_YOUR_D1_DATABASE_ID`에 붙여넣고,
같은 파일의 `database_name`도 `my-blog-db`로, `GITHUB_REPO`를 본인 저장소(`your-name/your-repo`)로 바꿉니다.

### 6-2. 테이블 생성
```bash
npx wrangler d1 execute my-blog-db --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute my-blog-db --remote --file=./migrations/0002_subscribers.sql
```

### 6-3. 시크릿 설정
```bash
# 관리자 비밀번호 (원하는 값) — /admin 로그인 + API 인증
npx wrangler pages secret put ADMIN_PASSWORD --project-name=my-blog

# (에디터·이미지 업로드용) GitHub 토큰
#   github.com → Settings → Developer settings → Fine-grained tokens
#   → 저장소: 본인 repo만 / 권한: Contents Read and write
npx wrangler pages secret put GITHUB_TOKEN --project-name=my-blog
```

### 6-4. 재배포 (시크릿 반영)
```bash
npm run build && npx wrangler pages deploy dist --project-name=my-blog --branch=main
```

이제 **`https://my-blog.pages.dev/admin`** 에서 비밀번호로 로그인할 수 있습니다.

---

## 7. /admin 사용법

- **대시보드**: 오늘/누적 조회수·방문자, 인기글, 유입 채널, 구독자 수
- **콘텐츠**: 글 목록(초안/발행 배지·검색), 클릭해 **웹 에디터**로 편집
  - 서식 툴바 + 실시간 미리보기 + 초안↔발행 토글
  - **이미지를 끌어다 놓거나(⌘V 붙여넣기)** 하면 자동 업로드되어 본문에 삽입
  - 저장하면 GitHub에 커밋됨 → **사이트 반영은 재배포 시** (`npx wrangler pages deploy dist ...`)
- **통계**: 기간별 상세(기기·국가 포함)

> 에디터 저장·이미지가 **바로 사이트에 뜨게** 하려면 10단계(자동배포)를 켜세요.

---

## 8. OG(소셜 공유) 이미지 — 자동

글을 발행하면 **제목이 박힌 1200×630 카드**가 자동 생성됩니다(`/og/<슬러그>.png`).
페이스북·링크드인·카톡 공유 시 이 카드가 뜹니다. 추가 설정 없음.
한글 폰트는 `src/og/Pretendard-Bold.otf`에 포함돼 있습니다.

---

## 9. 검색엔진 등록 (한국은 네이버도 필수)

1. **Google Search Console** (https://search.google.com/search-console) → URL 접두어로 사이트 추가 → **HTML 태그** 인증 방식의 `content` 값을 복사
2. **네이버 서치어드바이저** (https://searchadvisor.naver.com) → 웹마스터도구 → 사이트 등록 → **HTML 태그** 인증 값 복사
3. 두 값을 `src/consts.ts`의 `VERIFICATION.google` / `.naver`에 넣고 재배포
4. 각 콘솔에서 소유확인 → **사이트맵 제출**: `sitemap-index.xml`

---

## 10. (선택) 저장하면 자동 배포 — GitHub Actions

`/admin` 에디터 저장이나 push 시 자동으로 빌드·배포되게 하려면:
1. Cloudflare → My Profile → API Tokens → **"Cloudflare Pages — Edit"** 토큰 생성
2. GitHub repo → Settings → Secrets and variables → Actions 에 추가:
   - `CLOUDFLARE_API_TOKEN` (위 토큰)
   - `CLOUDFLARE_ACCOUNT_ID` (`npx wrangler whoami`로 확인)
3. `.github/workflows/deploy.yml`의 `--project-name=your-project-name`을 본인 프로젝트명으로 수정 → push

---

## 11. (선택) 커스텀 도메인

Cloudflare Pages 프로젝트 → Custom domains → 도메인 연결 → `SITE.url`·robots Sitemap 주소 갱신 후 재배포.

---

## 🤖 (선택) 콘텐츠 자동화

매일 소재를 제안받고 여러 채널용 초안을 만들어 승인 후 발행하는 워크플로우를 Claude Code로
돌릴 수 있습니다. **[automation/README.md](automation/README.md)** 참고 — 주제·채널·화자만 내
것으로 바꾸면 됩니다. (텔레그램 알림·예약 실행은 선택.)

---

## 🔒 보안 — 절대 공개/공유 금지

아래는 **각자 발급**하며, 코드·깃허브에 커밋하지 마세요 (이 템플릿엔 자리표시자만 있습니다):
`ADMIN_PASSWORD`, `GITHUB_TOKEN`, Cloudflare API 토큰·계정 ID, 검색엔진 인증 토큰, D1 `database_id`.
시크릿은 항상 `wrangler ... secret put` 또는 Cloudflare 대시보드로만 설정하세요.

---

## 📁 폴더 구조

```
src/
  consts.ts            ← 사이트 설정 (여기만 바꾸면 전체 반영)
  content/blog/        ← 글(.md)
  pages/               ← 홈·소개·글·태그·RSS·OG(/og)·어드민(/admin)
  layouts/ components/ ← 레이아웃·부품
  styles/global.css    ← 색·디자인 토큰
functions/api/         ← Cloudflare Functions (통계·구독·에디터·업로드)
migrations/            ← D1 테이블 스키마
public/                ← 파비콘·robots·llms·이미지
```

## ❓ 문제 해결

- **/admin에서 콘텐츠 목록이 안 떠요** → `GITHUB_TOKEN` 미설정 또는 재배포 안 함 (6-3, 6-4)
- **통계가 0이에요** → 배포 후 실제 방문부터 집계됩니다 (로컬·본인 방문은 제외)
- **에디터 저장했는데 사이트에 안 보여요** → 재배포 필요 (7단계 안내) 또는 자동배포(10단계)
- **빌드 오류** → `node -v`로 20+ 확인, `npm install` 다시

막히면 이 저장소의 Issues에 남기거나, Claude Code/ChatGPT에 이 매뉴얼과 함께 물어보세요.
