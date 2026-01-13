import { User as IUser } from "../../../command/entities/user/user.entity";
import { PessimisticLock } from "../../../../shared/utils/pessimistic-lock.util";

export interface IUserCommandRepo {
  createSuperAdmin: (entity: IUser) => Promise<IUser>;
  createAdmin: (entity: IUser) => Promise<IUser>;
  createResidentUser: (entity: IUser) => Promise<IUser>;
  findByUsername: (username: string) => Promise<IUser | null>;
  findById: (
    id: string,
    pessimisticLock?: PessimisticLock,
  ) => Promise<IUser | null>;
  update: (entity: IUser) => Promise<IUser>;
  approveMany: () => Promise<void>;
  rejectMany: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}
