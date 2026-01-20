import { User as IUser } from "../../../../_modules/users/domain/user.entity";
import { PessimisticLock } from "../../../utils/pessimistic-lock.util";

export interface IUserCommandRepo {
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  createSuperAdmin: (entity: IUser) => Promise<IUser>;
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  createAdmin: (entity: IUser) => Promise<IUser>;
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   */
  createResidentUser: (entity: IUser) => Promise<IUser>;
  /**
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR
   * @error UserRole이 우리가 정의한 것과 다를 때 에러 발생함
   */
  findByUsername: (username: string) => Promise<IUser | null>;
  /**
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR
   * @error UserRole이 우리가 정의한 것과 다를 때 에러 발생함
   */
  findById: (
    id: string,
    pessimisticLock?: PessimisticLock,
  ) => Promise<IUser | null>;
  lockManyAdmin: (pessimisticLock: PessimisticLock) => Promise<void>;
  lockManyResidentUser: (pessimisticLock: PessimisticLock) => Promise<void>;
  /**
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL
   * @error TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT
   * @error TechnicalExceptionType.UNIQUE_VIOLATION (동일 아파트 단지 정보)
   * @error TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED (낙관적 락 실패)
   * @error TechnicalExceptionType.UNKNOWN_SERVER_ERROR (UserRole 오류 관련)
   */
  update: (entity: IUser) => Promise<IUser>;
  approveManyAdmin: () => Promise<void>;
  rejectManyAdmin: () => Promise<void>;
  approveManyResidentUser: () => Promise<void>;
  rejectManyResidentUser: () => Promise<void>;
  deleteAdmin: (userId: string) => Promise<void>;
  deleteManyAdmin: () => Promise<void>;
  deleteManyResidentUser: () => Promise<void>;
}
