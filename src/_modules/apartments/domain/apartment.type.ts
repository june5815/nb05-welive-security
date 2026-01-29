export type ApartmentPublicListQuery = Readonly<{
  page: number;
  limit: number;
  searchKeyword?: string;
}>;

export type ApartmentPublicListItem = Readonly<{
  id: string;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  buildings: ReadonlyArray<number>;
  units: ReadonlyArray<number>;
  adminId?: string;
}>;

export type PageResult<T> = Readonly<{
  data: ReadonlyArray<T>;
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}>;
