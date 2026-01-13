import {
  TUserRole,
  TJoinStatus,
  AdminOf,
  Resident,
  User as IUser,
  UserEntity,
} from "../entities/user/user.entity";
import { IUserCommandRepo } from "../../ports/repos/command/user-command-repo.interface";
import { IUnitOfWork } from "../../ports/u-o-w.interface";
import { IHashManager } from "../../ports/managers/bcrypt-hash-manager.interface";
import { ITokenUtil } from "../../../shared/utils/token.util";
import { PessimisticLock } from "../../../shared/utils/pessimistic-lock.util";
import {
  BusinessException,
  BusinessExceptionType,
} from "../../../shared/exceptions/business.exception";
import {
  TechnicalException,
  TechnicalExceptionType,
} from "../../../shared/exceptions/technical.exception";

export const UserCommandService = (
  unitOfWork: IUnitOfWork,
  hashManager: IHashManager,
  tokenUtil: ITokenUtil,
  userCommandRepo: IUserCommandRepo,
) => {
  const signUpSuperAdmin = async () => {};

  const signUpAdmin = async () => {};

  const signUpResidentUser = async () => {};

  const updateMyAvatar = async () => {};

  const updateMyPassword = async () => {};

  const updateAdminData = async () => {};

  const updateAdminSignUpStatus = async () => {};

  const updateAdminListSignUpStatus = async () => {};

  const updateResidentUserListSignUpStatus = async () => {};

  const updateResidentUserSignUpStatus = async () => {};

  const deleteAdmin = async () => {};

  const delteRejectedAdmins = async () => {};

  const deleteRejectedResidentUsers = async () => {};

  return {
    signUpSuperAdmin,
    signUpAdmin,
    signUpResidentUser,
    updateMyAvatar,
    updateMyPassword,
    updateAdminData,
    updateAdminSignUpStatus,
    updateAdminListSignUpStatus,
    updateResidentUserListSignUpStatus,
    updateResidentUserSignUpStatus,
    deleteAdmin,
    delteRejectedAdmins,
    deleteRejectedResidentUsers,
  };
};
