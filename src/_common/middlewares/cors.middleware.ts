import cors from "cors";
import { IConfigUtil } from "../utils/config.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../exceptions/business.exception";
import { ICorsMiddleware } from "../ports/middlewares/cors-middleware.interface";

export const CorsMiddleware = (configUtil: IConfigUtil): ICorsMiddleware => {
  // 1. 허용할 도메인 목록 (Whitelist) 구성
  const whitelist: string[] = [
    "http://localhost:3000", // 로컬 테스트용
    "http://3.39.195.73:3000", // 👈 [중요] EC2 프론트엔드 주소 (HTTP)
  ];

  // 환경변수에 CLIENT_DOMAIN이 있다면 그것도 추가 (HTTP/HTTPS 둘 다)
  const clientDomain = configUtil.parsed().CLIENT_DOMAIN;
  if (clientDomain) {
    whitelist.push(`http://${clientDomain}`);
    whitelist.push(`https://${clientDomain}`);
    whitelist.push(`http://www.${clientDomain}`);
    whitelist.push(`https://www.${clientDomain}`);
  }

  const options: cors.CorsOptions = {};

  options.origin = function (origin, callback) {
    // origin이 없거나(서버-서버 통신 등) whitelist에 있으면 통과
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS Blocked: ${origin}`); // 디버깅용 로그
      callback(
        new BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
        }),
      );
    }
  };

  options.credentials = true; // 👈 쿠키/인증 헤더 허용 필수

  const corsHandler = () => {
    // 👇 [중요] 아까는 여기가 cors() 였습니다. options를 꼭 넣어주세요!
    return cors(options);
  };

  return {
    corsHandler,
  };
};

// import cors from "cors";
// import { IConfigUtil } from "../utils/config.util";
// import {
//   BusinessException,
//   BusinessExceptionType,
// } from "../exceptions/business.exception";
// import { ICorsMiddleware } from "../ports/middlewares/cors-middleware.interface";

// export const CorsMiddleware = (configUtil: IConfigUtil): ICorsMiddleware => {
//   const protocol =
//     configUtil.parsed().NODE_ENV === "development" ? "http" : "https";
//   const clientDomain =
//     configUtil.parsed().NODE_ENV === "development"
//       ? `localhost:${configUtil.parsed().FE_PORT}`
//       : configUtil.parsed().CLIENT_DOMAIN;
//   const whitelist = [
//     `${protocol}://${clientDomain}`,
//     `${protocol}://www.${clientDomain}`,
//   ];

//   const options: cors.CorsOptions = {};
//   options.origin = function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(
//         new BusinessException({
//           type: BusinessExceptionType.FORBIDDEN,
//         }),
//       );
//     }
//   };
//   options.credentials = true;

//   // 나중에 options 설정이 더 필요하면 여기에 추가
//   const corsHandler = () => {
//     return cors();
//   };

//   return {
//     corsHandler,
//   };
// };
