# 🧑‍💻 팀 고급 프로젝트
# nb05-welive-security

**WeLive Security**  
주민과 아파트 관리 주체 간의 원활한 소통과 효율적인 관리를 지원하는  
아파트 종합 관리 플랫폼 **WeLive**의 보안·백엔드 서버 프로젝트입니다.

---

## 👥 팀원 구성

| 이름       | 역할        | GitHub                                                       | 개인 개발 블로그                                                   |
| ---------- | ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **오창섭** | 백엔드 개발 | 🔗 [GitHub](https://github.com/GhostGN95) | 🔗 []() |
| **양다온** | 백엔드 개발 | 🔗 [GitHub]() | 🔗 []() |
| **정지원** | 백엔드 개발 | 🔗 [GitHub]() | 🔗 []() |
| **최지혜** | 백엔드 개발 | 🔗 [GitHub](https://github.com/918-jihye?tab=repositories) | 🔗 [노션](https://www.notion.so/NB-5-303bc88351b7801bbc84eff42856e704?source=copy_link) |

---

## 📘 프로젝트 소개

- **프로젝트 명:** WeLive (위리브)
- **설명:**  
  위리브는 아파트 주민과 관리사무소가 하나의 플랫폼에서  
  공지, 민원, 투표, 알림 등을 안전하게 관리하고 소통할 수 있도록 지원하는 서비스입니다.
- **프로젝트 기간:** 2026.01.05 ~ 2026.02.10

- ([팀 협업 문서 링크](https://www.notion.so/Team-Security-2dfd8a3b973f80c0b429d3868c005826?source=copy_link))

---

## 🧰 기술 스택

| 구분          | 사용 기술                     |
| ------------- | ----------------------------- |
| **Backend**   | Node.js, Express.js, PrismaORM, TypeScript |
| **Database**  | PostgreSQL                    |
| **공통 Tool** | Git & GitHub, Discord, Notion, Notion Timeline |
| **Infra / External** | Redis, AWS S3, Server-Sent Events (SSE) |

---

## 🔧 팀원별 구현 기능

### 🟦 양다온
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)



---

### 🟩 오창섭
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

- Auth
  - 1.로그인
      - /api/v2/auth/login
  - 2.로그아웃
      - /api/v2/auth/logout
  - 3.토큰 갱신
      - /api/v2/auth/refresh
- User
  - 1.슈퍼 관리자 계정 생성
      - /api/v2/users/super-admins
  - 2.관리자 계정 생성
      - /api/v2/users/admins
  - 3.주민 계정 생성
      - /api/v2/users/residents
  - 4.[슈퍼 관리자 권한 필요] 관리자 계정 목록 조회
      - /api/v2/users/admins
  - 5.[슈퍼 관리자 권한 필요] 관리자 계정 가입 상태 변경(다건)
      - /api/v2/users/admins/join-status
  - 6.[슈퍼 관리자 권한 필요] 관리자 계정 가입 상태 변경(단건)
      - /api/v2/users/admins/:adminId/join-status
  - 7.[슈퍼 관리자 권한 필요] 관리자 계정 정보(아파트 정보 포함) 수정
      - /api/v2/users/admins/:adminId
  - 8.[슈퍼 관리자 권한 필요] 관리자 계정 삭제
      - /api/v2/users/admins/:adminId
  - 9.[슈퍼 관리자 권한 필요] 거절된 관리자 계정(아파트 정보 포함) 일괄 삭제
      - /api/v2/users/admins/rejected
  - 10.[관리자 권한 필요] 주민 계정 목록 조회
      - /api/v2/users/residents
  - 11.[관리자 권한 필요] 주민 계정 가입 상태 변경(다건)
      - /api/v2/users/residents/join-status
  - 12.[관리자 권한 필요] 주민 계정 가입 상태 변경(단건)
      - /api/v2/users/residents/:residentId/join-status
  - 13.[관리자 권한 필요] 거절된 주민 계정 일관 삭제
      - /api/v2/users/residents/rejected
  - 14.프로필 이미지 수정 (슈퍼 관리자 제외)
      - /api/v2/users/me/avatar
  - 15.비밀번호 변경 (슈퍼 관리자 제외)
      - /api/v2/users/me/password
- etc
  - 1. 관리자 정보 수정을 위한 상세조회
    - /api/v2/users/admins/:adminId
  - 2. 개인 정보 상세 조회 (슈퍼 관리자 제외)
    - /api/v2/users/me

---

### 🟧 정지원
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

- 민원(Complaints) 도메인
- 민원 등록 / 민원 수정 / 민원 삭제
- 민원 조회 / SSE 알림
- 민원 관련 Notification 연동
- 투표(Polls) 도메인
- 투표 등록 / 투표 목록 조회 / 투표 상세 조회
- 투표 수정 / 투표 삭제 / 투표 상태 관리
---

### 🟥 최지혜
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

- 📌 Notices (공지사항 관리)
  - 관리자 기능
    - 공지사항 등록  
      POST /api/v2/notices  (관리자 권한 필요)

    - 공지사항 수정  
      PATCH /api/v2/notices/{noticeId}  (관리자 권한 필요)

    - 공지사항 삭제  
      DELETE /api/v2/notices/{noticeId}  (관리자 권한 필요)

  - 공통 기능
    - 공지사항 목록 조회  
      GET /api/v2/notices

    - 공지사항 상세 조회  
      GET /api/v2/notices/{noticeId}


- 💬 Comments (댓글 관리)
  - 공통 기능
    - 댓글 생성  
      POST /api/v2/comments

    - 댓글 목록 조회  
      GET /api/v2/comments

    - 댓글 수정  
      PATCH /api/v2/comments/{commentId}

    - 댓글 삭제  
      DELETE /api/v2/comments/{commentId}


- 📅 Events (이벤트 관리)
  - 공통 기능
    - 이벤트 목록 조회  
      GET /api/v2/events



---

## 🏗 프로젝트 아키텍처 개요

본 프로젝트는 **레이어드 아키텍처 + 도메인 중심 설계**를 기반으로 구성되어 있습니다.

- `_common`  
  → 공통 예외, 미들웨어, 포트(interface), 유틸리티
- `_infra`  
  → DB, Redis, 외부 시스템, Repository 구현체
- `_modules`  
  → 실제 비즈니스 도메인 단위 모듈 (Controller / Service / UseCase)
- `ports`  
  → 의존성 역전을 위한 인터페이스 계층
- `test`  
  → API(E2E) / Unit 테스트 분리 구성

---

## 📁 프로젝트 파일 구조

```bash
welive
├─ Dockerfile
├─ README.md
├─ package.json
├─ tsconfig.json
├─ prisma
│  └─ schema.prisma
└─ src
   ├─ _common               # 전역 공통 영역 (Framework / Cross-cutting)
   │  ├─ exceptions         # 비즈니스 / 기술 예외 정의
   │  ├─ middlewares        # 공통 미들웨어
   │  ├─ http               # HTTP 에러 / 응답 매핑
   │  ├─ ports              # 외부/인프라 의존 인터페이스
   │  │  ├─ db
   │  │  ├─ externals
   │  │  ├─ managers
   │  │  ├─ mappers
   │  │  ├─ middlewares
   │  │  └─ repos
   │  ├─ utils              # 공통 유틸
   │  ├─ sse                # SSE 공통 로직
   │  └─ types              # 글로벌 타입 확장
   │
   ├─ _infra                # 인프라 구현체 영역
   │  ├─ db                 # DB / Unit of Work / Transaction
   │  ├─ repos              # Repository 구현체
   │  ├─ externals           # Redis, S3 등 외부 시스템
   │  ├─ manager             # 암호화, 해시 매니저
   │  ├─ mappers             # Entity ↔ Persistence Mapper
   │  ├─ sse                 # SSE 인프라 구현
   │  └─ storage             # 파일 스토리지
   │
   ├─ _modules              # 도메인 중심 기능 모듈
   │  ├─ _base              # 공통 Controller / Router 베이스
   │  ├─ apartments
   │  ├─ auth
   │  ├─ comments
   │  ├─ complaints
   │  ├─ events
   │  ├─ notices
   │  ├─ notification
   │  ├─ polls
   │  ├─ residents
   │  └─ users
   │
   ├─ servers               # 서버 진입점
   │  └─ http-server.ts
   ├─ app.ts                # 애플리케이션 설정
   ├─ injector.ts           # 의존성 주입 설정
   └─ test                  # API / Unit 테스트

```

---

## 🌐 구현 홈페이지

[welive]()

---

## 🪞 프로젝트 회고록

[회고록]()

