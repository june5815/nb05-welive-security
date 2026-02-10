import {
  ApartmentListResView,
  ApartmentDetailResView,
} from "../../../../_modules/apartments/dtos/res/apartment.view";
import { ApartmentListQueryReq } from "../../../../_modules/apartments/dtos/req/apartment.request";

export interface IApartmentQueryRepo {
  findApartmentList: (
    query: ApartmentListQueryReq,
  ) => Promise<ApartmentListResView>;
  findApartmentDetailById: (
    apartmentId: string,
  ) => Promise<ApartmentDetailResView | null>;
  findApartmentByName: (name: string) => Promise<ApartmentDetailResView | null>;
  findApartmentByAddress: (
    address: string,
  ) => Promise<ApartmentDetailResView | null>;
  findApartmentByDescription: (
    description: string,
  ) => Promise<ApartmentDetailResView[]>;
  findApartmentByOfficeNumber: (
    officeNumber: string,
  ) => Promise<ApartmentDetailResView | null>;
}
