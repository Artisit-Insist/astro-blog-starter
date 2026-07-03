// 사이트 전역 설정 — 여기 값만 바꾸면 전체에 반영됩니다.
// ↓↓↓ 아래 자리표시자를 본인 정보로 교체하세요.

export const SITE = {
  // 배포 후 실제 주소로 교체 (Cloudflare Pages: 프로젝트명.pages.dev 또는 커스텀 도메인)
  url: 'https://your-site.pages.dev',
  title: '내 블로그',
  // 검색 결과·소셜 공유에 쓰이는 사이트 한 줄 소개
  description: '여기에 사이트 한 줄 소개를 적으세요. 검색 스니펫과 소셜 공유에 사용됩니다.',
  lang: 'ko-KR',
  locale: 'ko_KR',
  // 소셜 공유 기본 이미지 — /og/default.png 는 빌드 시 자동 생성됩니다.
  defaultOgImage: '/og/default.png',
} as const;

export const AUTHOR = {
  name: '홍길동',
  nameEn: 'Hong Gildong',
  role: '한 줄 직함 / 소개',
  bio: '자기소개 한두 문장. 어떤 사람이고 무엇을 쓰는지 적으세요.',
  avatar: '/avatar.svg', // public/avatar.svg — 본인 사진(jpg/png)으로 교체 권장
  // 있으면 채우고, 없으면 빈 문자열로 두면 렌더링에서 제외됩니다.
  social: {
    email: '',
    brunch: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  },
} as const;

// 서비스/브랜드 소개 (홈 섹션 + Organization 구조화 데이터). 안 쓰면 값만 바꿔 두세요.
export const SERVICE = {
  name: '브랜드명',
  nameEn: 'BrandName',
  tagline: '핵심 태그라인 한 줄.',
  subTagline: '보조 문구.',
  description: '서비스/브랜드를 2~3문장으로 소개하세요.',
  url: '',
} as const;

export const NAV = [
  { label: '홈', href: '/' },
  { label: '글', href: '/blog' },
  { label: '소개', href: '/about' },
] as const;

// 검색엔진 소유권 확인 메타태그 (각자 발급받아 넣으세요. 빈 문자열이면 렌더링 안 함)
export const VERIFICATION = {
  google: '',
  naver: '',
} as const;

// 블로그 핵심 주제(카테고리 탭). 글 태그에 이 값을 쓰면 탭 필터로 묶입니다.
export const CATEGORIES = ['카테고리1', '카테고리2', '카테고리3'] as const;
