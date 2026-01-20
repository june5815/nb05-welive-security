import { IApartmentQueryRepo } from "./apartment-query-repo.interface";
import { IApartmentCommandRepo } from "./apartment-command-repo.interface";

export interface IApartmentRepo
  extends IApartmentQueryRepo,
    IApartmentCommandRepo {}
