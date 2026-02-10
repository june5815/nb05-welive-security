import { RefreshToken as IRefreshToken } from "../../../../_modules/auth/domain/auth.entity";

export interface IAuthCommandRepo {
  upsertRefreshToken: (entity: IRefreshToken) => Promise<IRefreshToken>;
  findByUserId: (userId: string) => Promise<IRefreshToken | null>;
  deleteRefreshToken: (userId: string) => Promise<void>;
}
