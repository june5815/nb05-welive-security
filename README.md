# 🏢 Team.SECURITY

## 🌿 프로젝트 소개

- 🌳 **프로젝트 개요**
  **WeLive Security**  
  주민과 아파트 관리 주체 간의 원활한 소통과 효율적인 관리를 지원하는 **아파트 종합 관리 플랫폼 보안·백엔드** 개발 프로젝트

- 🗓️ **프로젝트 기간**
  - 2026.01.05 ~ 2026.02.09

- **관련 문서**
  - [시큐리티 Dev협업 문서](https://www.notion.so/Team-Security-2dfd8a3b973f80c0b429d3868c005826?source=copy_link)

---

### 👨‍💻👨‍💻 팀원 구성

| Apartments · Residents · Notifications                                                           | Auth · Users                                                                                            | Notices · Comments · Events                                                                             | Complaints · Polls                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <div align="center">[june5815](https://github.com/june5815)</div>                                | <div align="center">[GhostGN95](https://github.com/GhostGN95)</div>                                     | <div align="center">[918-jihye](https://github.com/918-jihye)</div>                                     | <div align="center">[XOXOXO13](https://github.com/XOXOXO13)</div>                                       |
| <div align="center"><img src="https://avatars.githubusercontent.com/june5815" width="80"/></div> | <div align="center"><img src="https://avatars.githubusercontent.com/u/171834764?v=4" width="80"/></div> | <div align="center"><img src="https://avatars.githubusercontent.com/u/227042578?v=4" width="80"/></div> | <div align="center"><img src="https://avatars.githubusercontent.com/u/227587001?v=4" width="80"/></div> |
| <div align="center"><b>양다온</b></div>                                                          | <div align="center"><b>오창섭</b></div>                                                                 | <div align="center"><b>최지혜</b></div>                                                                 | <div align="center"><b>정지원</b></div>                                                                 |

</br>

## 🧰 기술 스택

- RunTime : Node.js
- Framework : Express
- Language : TypeScript
- ORM : Prisma
- Database : PostgreSQL, AWS RDS
- Testing : Jest(Unit/Integration), SuperTest
- Others : Git, VsCode, ESLint, Prettier, Swagger  
  </br>
  </br>

</br>

## 🛠️ 팀원별 구현 기능 상세

### 👨‍💻 양다온

- Apartments
  - [퍼블릭] 아파트 목록 조회   /api/v2/apartments
  - 아파트 상세 조회 /api/v2/apartments/{id}
- Residents
  - [관리자 권한 필요] 입주민 등록 /api/v2/residents
  - [관리자 권한 필요] 입주민 목록 조회 /api/v2/residents
  - [관리자 권한 필요] 입주민 상세 조회 /api/v2/residents/{id}
  - [관리자 권한 필요] 입주민 정보 수정 /api/v2/residents/{id}
  - [관리자 권한 필요] 입주민 정보 삭제 /api/v2/residents/{id}
  - [관리자 권한 필요] 입주민 업로드 템플릿 다운로드 /api/v2/residents/file/template
  - [관리자 권한 필요] 파일로부터 입주민 리소스 생성  /api/v2/residents/file/import 
  - [관리자 권한 필요] 입주민 목록 파일 다운로드 GET /api/v2/residents/file/export 
- Notifications
  - [퍼블릭] 아파트 목록 조회 /api/v2/apartments
  - 아파트 상세 조회 /api/v2/apartments/{id}

---

### 👨‍💻 오창섭

- Auth
  - 로그인  /api/v2/auth/login
  - 로그아웃 /api/v2/auth/logout
  - 토큰 갱신 /api/v2/auth/refresh
- User
  - 슈퍼 관리자 계정 생성 /api/v2/users/super-admins
  - 관리자 계정 생성 /api/v2/users/admins
  - 주민 계정 생성 /api/v2/users/residents
  - [슈퍼 관리자 권한 필요] 관리자 계정 목록 조회 /api/v2/users/admins
  - [슈퍼 관리자 권한 필요] 관리자 계정 가입 상태 변경(다건) /api/v2/users/admins/join-status
  - [슈퍼 관리자 권한 필요] 관리자 계정 가입 상태 변경(단건) /api/v2/users/admins/:adminId/join-status
  - [슈퍼 관리자 권한 필요] 관리자 계정 정보(아파트 정보 포함) 수정 /api/v2/users/admins/:adminId
  - [슈퍼 관리자 권한 필요] 관리자 계정 삭제 /api/v2/users/admins/:adminId
  - [슈퍼 관리자 권한 필요] 거절된 관리자 계정(아파트 정보 포함) 일괄 삭제 /api/v2/users/admins/rejected
  - [관리자 권한 필요] 주민 계정 목록 조회 /api/v2/users/residents
  - [관리자 권한 필요] 주민 계정 가입 상태 변경(다건) /api/v2/users/residents/join-status
  - [관리자 권한 필요] 주민 계정 가입 상태 변경(단건) /api/v2/users/residents/:residentId/join-status
  - [관리자 권한 필요] 거절된 주민 계정 일관 삭제 /api/v2/users/residents/rejected
  - 프로필 이미지 수정 (슈퍼 관리자 제외) /api/v2/users/me/avatar
  - 비밀번호 변경 (슈퍼 관리자 제외) /api/v2/users/me/password
- etc
  - 관리자 정보 수정을 위한 상세조회 /api/v2/users/admins/:adminId
  - 개인 정보 상세 조회 (슈퍼 관리자 제외) /api/v2/users/me

---

### 👨‍💻 정지원

- Complaints
  - 민원 등록 /api/v2/complaints
  - 민원 목록 조회 /api/v2/complaints
  - 민원 상세 조회 /api/v2/complaints/{complaintId}
  - 민원 수정 /api/v2/complaints/{complaintId
  - 민원 삭제 /api/v2/complaints/{complaintId}
  - [관리자 권한 필요] 민원 상태 수정 /api/v2/complaints/{complaintId}/status
- Polls
  - [관리자 권한 필요] 투표 글 작성 /api/v2/polls
  - 투표 글 전체 조회 /api/v2/polls
  - 투표 글 상세 조회 /api/v2/polls/{pollId}
  - [관리자 권한 필요] 투표 글 수정 /api/v2/polls/{pollId}
  - [관리자 권한 필요] 투표 글 삭제 /api/v2/polls/{pollId}
  - 투표하기 /api/v2/polls/{pollId}/options/{optionId}/vote
  - 투표 취소 /api/v2/polls/{pollId}/options/{optionId}/vote

---

### 👨‍💻 최지혜

- Notices
- [관리자 권한 필요] 공지사항 등록 /api/v2/notices
- [관리자 권한 필요] 공지사항 수정 /api/v2/notices/{noticeId}
- [관리자 권한 필요] 공지사항 삭제 /api/v2/notices/{noticeId}
- 공지사항 목록 조회 /api/v2/notices
- 공지사항 상세 조회 /api/v2/notices/{noticeId}
- Comments
  - 댓글 생성 /api/v2/comments
  - 댓글 목록 조회 /api/v2/comments
  - 댓글 수정 /api/v2/comments/{commentId}
  - 댓글 삭제 /api/v2/comments/{commentId}
- Events
  - 이벤트 목록 조회 /api/v2/events

---

<br>

## 🏗 프로젝트 아키텍처 개요

본 프로젝트는 **레이어드 아키텍처 + 도메인 중심 설계**를 기반으로 구성되어 있습니다.

```
Presentation Layer (Controller/Router)
    ↓
Domain Layer (Entity/UseCase)
    ↓
Infrastructure Layer (Repository/DB/외부 API)
```

- **Presentation Layer**: HTTP 요청 처리, 인증/검증, 라우팅
- **Domain Layer**: 비즈니스 로직, 도메인 엔티티, 유스케이스
- **Infrastructure Layer**: 데이터베이스 접근, 외부 시스템 연동

## <br><br>

## 📁 프로젝트 파일 구조

```bash
nb05-welive-security/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── admin_profile.*.jpg
│   ├── user_profile.*.png
├── src/
│   ├── app.ts
│   ├── injector.ts
│   ├── _common/
│   │   ├── exceptions/
│   │   ├── http/
│   │   ├── middlewares/
│   │   ├── ports/
│   │   ├── sse/
│   │   ├── types/
│   │   └── utils/
│   ├── _infra/
│   │   ├── db/
│   │   ├── externals/
│   │   ├── manager/
│   │   ├── mappers/
│   │   ├── repos/
│   │   └── sse/
│   ├── _modules/
│   │   ├── _base/
│   │   ├── _common/
│   │   ├── apartments/
│   │   │   ├── apartment.controller.ts
│   │   │   ├── apartment.router.ts
│   │   │   ├── apartment.entity.ts
│   │   │   ├── apartment.usecase.ts
│   │   │   ├── apartment.repo.ts
│   │   │   └── ...
│   │   ├── residents/
│   │   │   ├── resident.controller.ts
│   │   │   ├── resident.router.ts
│   │   │   ├── resident.entity.ts
│   │   │   ├── resident.usecase.ts
│   │   │   ├── resident.repo.ts
│   │   │   └── ...
│   │   ├── notifications/
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.router.ts
│   │   │   ├── domain/
│   │   │   │   ├── notification.entity.ts
│   │   │   │   ├── notification.type.ts
│   │   │   │   └── notification.view.ts
│   │   │   ├── usecases/
│   │   │   │   ├── notification-query.usecase.ts
│   │   │   │   ├── notification-command.usecase.ts
│   │   │   │   └── ...
│   │   │   ├── infrastructure/
│   │   │   │   ├── notification-sse-manager.service.ts
│   │   │   │   ├── notification-event-manager.ts
│   │   │   │   └── sse/
│   │   │   │       ├── sse-connection-manager.ts
│   │   │   │       ├── sse-types.ts
│   │   │   │       └── db-notification-persistence.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.usecase.ts
│   ├── servers/
│   └── test/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

<br>

<br>

## 🌐 서비스 배포 주소 </br>

- [Team.시큐리티's 입주민과 아파트 관리 단체를 위한 상호 관리 플랫폼 서비스](http://3.39.195.73:3000/)

</br>
</br>

</br>

## 📝 프로젝트 회고록

- [Team.시큐리티 개발자들의 회고록](https://www.notion.so/2dfd8a3b973f81c4b6d6cf9c0817df8d?source=copy_link)
