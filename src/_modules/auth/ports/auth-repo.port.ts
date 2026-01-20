//예시 파일 구조입니다.
//삭제하시거나 필요에 맞게 파일명 수정하셔서 사용하시면 됩니다.

//인터페이스(Port)는 각 도메인 모듈의 ports/ 폴더에 작성해주세요.
//구현체(Repository)는 infra/repositories/ 폴더에 작성해주세요

/** 폴더 구조의 이유
 * : 상위계층이 하위계층에 의존하지 않고,추상화(Port)에만 의존하도록 하기 위함입니다.
 */

/** 
 * 
- 인터페이스 
modules/users/ports/user-repo.port.ts가 되고 
- 실제 db 구현체
infra/repo/user/repo/db.ts입니다.
 * 
 */
