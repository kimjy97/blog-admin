# 📝 블로그 관리자 | 대시보드

개인 블로그 운영을 위한 관리자 대시보드입니다. 게시물 작성 및 관리부터 통계 분석까지 블로그 관리에 필요한 모든 기능을 제공합니다.

![image](https://github.com/user-attachments/assets/1c8b31c9-941b-4f16-901b-a8637ffa4e2e)

## ✨ 주요 기능

- 📝 마크다운 기반 게시물 작성 및 편집
- 📊 방문자 통계 및 데이터 분석
- 🏷️ 카테고리 및 태그 시스템
- 👤 NextAuth 기반 사용자 인증
- 🔍 게시물 검색 및 필터링
- 🌙 다크/라이트 모드 지원
- 📱 반응형으로 모든 디바이스 지원

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **UI 컴포넌트**: Shadcn/ui, Lucide React, Heroicons
- **상태 관리**: Zustand, TanStack Query
- **차트**: Chart.js, Recharts
- **데이터베이스**: MongoDB, Mongoose
- **인증**: NextAuth.js with MongoDB Adapter
- **마크다운**: React Markdown, Remark GFM

## 💡 핵심 기능 설명

### 게시물 관리

- React Markdown과 Remark GFM을 활용한 마크다운 에디터
- 실시간 미리보기 및 코드 하이라이팅
- 게시물 상태 관리 (임시저장, 발행)
- 댓글 관리 (비공개, 수정)

### 데이터 분석 대시보드

- Chart.js와 Recharts를 활용한 시각적 데이터 표현
- 일별/월별 방문자 통계 추적
- 인기 게시물 및 검색 키워드 분석
- 실시간 데이터 업데이트

### 사용자 인증 시스템

- NextAuth.js 기반의 안전한 인증
- MongoDB 어댑터를 통한 세션 관리

### 성능 최적화

- **서버 컴포넌트**: Next.js 15 App Router 활용
- **데이터 페칭**: TanStack Query로 캐싱 및 동기화
