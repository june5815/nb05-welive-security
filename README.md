# nb05-welive-security

**WeLive Security**  
주민과 아파트 관리 주체 간의 원활한 소통과 효율적인 관리를 지원하는  
아파트 종합 관리 플랫폼 **WeLive**의 보안·백엔드 서버 프로젝트입니다.

---

## 📌 프로젝트 개요

- **프로젝트 명:** WeLive (위리브)
- **설명:**  
  위리브는 아파트 주민과 관리사무소가 하나의 플랫폼에서  
  공지, 민원, 투표, 알림 등을 안전하게 관리하고 소통할 수 있도록 지원하는 서비스입니다.
- **프로젝트 기간:** 2026.01.05 ~ 2026.02.10

### 🔗 프로젝트 계획서

- Notion:  
  https://www.notion.so/Team-Security-2dfd8a3b973f80c0b429d3868c005826

---

## 🛠 기술 스택

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

### Database

- PostgreSQL

### Infra / External

- Redis
- AWS S3
- Server-Sent Events (SSE)

### 협업 및 공통 도구

- Git & GitHub
- Discord
- Notion
- Notion Timeline (일정 관리)

---

## 👥 팀 구성

| 이름   | 역할              |
| ------ | ----------------- |
| 양다온 | Backend Developer |
| 오창섭 | Backend Developer |
| 정지원 | Backend Developer |
| 최지혜 | Backend Developer |

---

## 🧩 팀원별 구현 기능

### 양다온

### 오창섭

### 최지혜

### 정지원

- 민원(Complaints) 도메인
- 민원 등록 / 상태 변경 / SSE 알림
- 민원 관련 Notification 연동
- 투표(Polls) 도메인
- 투표 등록 / 투표 목록 조회 / 투표 상세 조회
- 투표 수정 / 투표 삭제 / 투표 상태 관리

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

## 📁 프로젝트 구조

welive
├─ Dockerfile
├─ README.md
├─ package.json
├─ tsconfig.json
├─ prisma
│ └─ schema.prisma
└─ src
├─ \_common # 공통 예외, 미들웨어, 포트, 유틸
├─ \_infra # DB, Redis, Repository 구현
├─ \_modules # 도메인별 모듈
├─ app.ts # 앱 초기화
├─ injector.ts # 의존성 주입
├─ servers
│ └─ http-server.ts
└─ test # API / Unit 테스트
